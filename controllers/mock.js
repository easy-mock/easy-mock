'use strict'

const _ = require('lodash')
const { VM } = require('vm2')
const nodeURL = require('url')
const JSZip = require('jszip')
const Mock = require('mockjs')
const axios = require('axios')
const config = require('config')
const pathToRegexp = require('path-to-regexp')

const p = require('../proxy')
const util = require('../util')
const ft = require('../models/fields_table')

const projectProxy = p.Project
const mockProxy = p.Mock
const mockCountProxy = p.MockCount

function projectExistCheck (id, uid) {
  return projectProxy.findOne({ _id: id }).then((project) => {
    const members = project.members.map(member => member.id)
    if (project.user &&
      (project.user.id === uid || members.indexOf(uid) > -1)
    ) {
      return project
    } else if (project.group) {
      return project
    }
    return null
  })
}

exports.list = function * () {
  const projectId = this.checkQuery('project_id').notEmpty().value

  const pageSize = this.checkQuery('page_size').empty().toInt().gt(0)
    .default(config.get('pageSize')).value

  const pageIndex = this.checkQuery('page_index').empty().toInt().gt(0)
    .default(1).value

  const keywords = this.checkQuery('keywords').value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const opt = {
    skip: (pageIndex - 1) * pageSize,
    limit: pageSize,
    sort: '-create_at'
  }

  const where = {
    project: projectId
  }

  if (keywords) {
    const keyExp = new RegExp(keywords)
    where.$or = [{
      url: keyExp
    }, {
      description: keyExp
    }, {
      method: keyExp
    }, {
      mode: keyExp
    }]
  }

  let mocks = yield mockProxy.find(where, opt)
  let project = yield projectProxy.getById(projectId)

  project.members = project.members.map(o => _.pick(o, ft.user))
  project.extend = _.pick(project.extend, ft.projectExtend)
  project.group = _.pick(project.group, ft.group)
  project.user = _.pick(project.user, ft.user)
  project = _.pick(project, ['user'].concat(ft.project))
  mocks = mocks.map(o => _.pick(o, ft.mock))

  this.body = this.util.resuccess({
    project,
    mocks
  })
}

exports.byProjects = function * () {
  let projectIds = this.checkQuery('project_ids').notEmpty().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  projectIds = projectIds.split(',')

  const mocks = yield mockProxy.find({
    project: {
      $in: projectIds
    }
  })

  const projects = yield projectProxy.findByIds(projectIds)

  const result = {}

  projects.forEach((project) => {
    const projectId = project.id
    let newMocks = mocks.filter(o => (o.project.id === projectId))
    let newProject = projects.filter(o => (o.id === projectId))[0]

    newProject.members = newProject.members.map(o => _.pick(o, ft.user))
    newProject.user = _.pick(newProject.user, ft.user)
    newProject = _.pick(newProject, ['user'].concat(ft.project))
    newMocks = newMocks.map(o => _.pick(o, ft.mock))

    result[projectId] = {
      project: newProject,
      mocks: newMocks
    }
  })

  this.body = this.util.resuccess(result)
}

exports.create = function * () {
  const mode = this.checkBody('mode').notEmpty().value
  const projectId = this.checkBody('project_id').notEmpty().value
  const description = this.checkBody('description').notEmpty().value
  const url = this.checkBody('url').notEmpty()
    .match(/^\/.*$/i, 'URL 必须以 / 开头').value
  const method = this.checkBody('method').notEmpty().toLow().in([
    'get', 'post', 'put', 'delete', 'patch'
  ]).value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 1.项目是否存在
  const project = yield projectExistCheck(projectId, this.state.user.id)

  if (!project) {
    this.body = this.util.refail('创建失败，无权限')
    return
  }

  // 2.查重, url，method
  const mock = yield mockProxy.findOne({
    project: projectId,
    url,
    method
  })

  if (mock) {
    this.body = this.util.refail('创建失败，已存在相同 Mock')
    return
  }

  // 保存
  yield mockProxy.newAndSave({
    project: projectId,
    description,
    method,
    url,
    mode
  })

  this.body = this.util.resuccess()
}

exports.update = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value
  const mode = this.checkBody('mode').value
  const description = this.checkBody('description').value
  const url = this.checkBody('url').empty()
    .match(/^\/.*$/i, 'URL 必须以 / 开头').value
  const method = this.checkBody('method').empty().toLow().in([
    'get', 'post', 'put', 'delete', 'patch'
  ]).value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 获取mock
  const mock = yield mockProxy.getById(id)

  if (!mock) {
    this.body = this.util.refail('更新失败，Mock 不存在')
    return
  }

  const project = mock.project

  // 权限验证
  if (project.user && project.user.toString() !== uid &&
    project.members.indexOf(uid) === -1) {
    this.body = this.util.refail('更新失败，无权限')
    return
  }

  // 更新属性
  mock.url = url || mock.url
  mock.mode = mode || mock.mode
  mock.method = method || mock.method
  mock.description = description || mock.description

  // 更新属性后查重
  const existMock = yield mockProxy.findOne({
    _id: { $ne: mock.id },
    project: project.id,
    url: mock.url,
    method: mock.method
  })

  if (existMock) {
    this.body = this.util.refail('更新失败，已存在相同 Mock')
    return
  }

  yield mockProxy.updateById(mock)

  this.body = this.util.resuccess()
}

exports.delete = function * () {
  const ids = this.checkBody('ids').empty().type('array').value
  const uid = this.state.user.id

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const mocks = yield mockProxy.find({
    _id: {
      $in: ids
    }
  })

  const unMatchMock = mocks.filter((item) => {
    const project = item.project

    // 允许删除团队项目下的 mock
    if (project.group) {
      return false
    }

    const members = project.members
    const mockUId = project.user.toString()

    return mockUId !== uid && members.indexOf(uid) === -1
  })

  if (!_.isEmpty(unMatchMock) ||
    (mocks.length < ids.length)) {
    this.body = this.util.refail('删除失败，无权限')
    return
  }

  yield mockProxy.delByIds(ids)

  this.body = this.util.resuccess()
}

exports.exportMock = function * () {
  const ids = this.checkBody('ids').empty().type('array').value
  const projectId = this.checkBody('project_id').empty().value
  let mocks

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  if (projectId) {
    mocks = yield mockProxy.find({
      project: projectId
    })
  } else if (!_.isEmpty(ids)) {
    mocks = yield mockProxy.find({
      _id: {
        $in: ids
      }
    })
  } else {
    this.body = this.util.refail('参数不能为空')
    return
  }

  if (_.isEmpty(mocks)) {
    this.body = this.util.refail('Mock 不存在')
    return
  }

  this.set(
    'Content-disposition',
    'attachment; filename=Easy-Mock-API.zip'
  )

  const zip = new JSZip()

  mocks.forEach((mock) => {
    let data
    try {
      data = JSON.parse(mock.mode)
      data = JSON.stringify(Mock.mock(data))
    } catch (e) {
      data = mock.mode
    } finally {
      zip.file(`${mock.project.url}${mock.url}.json`, data)
    }
  })

  const content = yield zip.generateAsync({ type: 'nodebuffer' })

  this.body = content
}

module.exports = class MockController {
  /**
   * 获取 Mock 接口
   * @param {*} ctx
   * @param {*} next
   */

  static async getAPI (ctx, next) {
    const { query, body } = ctx.request
    const method = ctx.method.toLowerCase()
    const pathNode = ctx.path.split('/').filter(o => o) // ['', 'mock'] => ['mock']
    const projectId = pathNode[1]
    const jsonpCallback = query.jsonp_param_name && (query[query.jsonp_param_name] || 'callback')
    let apiPath = `/${pathNode.slice(2).join('/')}`
    let apiData, apis, api

    if (!projectId) ctx.throw(404)
    if (projectId && projectId.length !== 24) ctx.throw(404)

    apis = await mockProxy.find({ project: projectId, method })

    if (apis.length === 0) ctx.throw(404)

    apiPath = apis[0].project.url === '/'
      ? apiPath : apiPath.replace(apis[0].project.url, '')

    apis = apis.filter((item) => {
      const url = item.url.replace(/{/g, ':').replace(/}/g, '') // /api/{user}/{id} => /api/:user/:id
      return pathToRegexp(url).test(apiPath)
    })

    if (apis.length === 0) ctx.throw(404)

    api = apis[0]
    Mock.Handler.function = function (options) {
      const mockUrl = api.url.replace(/{/g, ':').replace(/}/g, '') // /api/{user}/{id} => /api/:user/:id
      options.Mock = Mock
      options._req = ctx.request
      options._req.params = util.params(mockUrl, apiPath)
      options._req.cookies = ctx.cookies.get.bind(ctx)
      return options.template.call(options.context.currentContext, options)
    }

    if (/^http(s)?/.test(api.mode)) { // 代理模式
      const url = nodeURL.parse(api.mode, true)
      const params = util.params(api.url, apiPath)
      const pathname = pathToRegexp.compile(url.pathname)(params)
      try {
        apiData = await axios({
          method: method,
          url: url.protocol + '//' + url.host + pathname,
          params: _.assign({}, url.query, query),
          data: body,
          timeout: 3000
        }).then(res => res.data)
      } catch (error) {
        ctx.body = ctx.util.refail(error.message || '接口请求失败')
        return
      }
    } else {
      const vm = new VM({
        timeout: 1000,
        sandbox: {
          Mock: Mock,
          mode: api.mode,
          template: new Function(`return ${api.mode}`) // eslint-disable-line
        }
      })

      vm.run('Mock.mock(new Function("return " + mode)())') // 数据验证，检测 setTimeout 等方法
      apiData = vm.run('Mock.mock(template())') // 解决正则表达式失效的问题

      if (apiData._res) { // 开始处理自定义响应
        let _res = apiData._res
        if (_res.cookies) {
          for (let i in _res.cookies) {
            if (_res.cookies.hasOwnProperty(i)) ctx.cookies.set(i, _res.cookies[i])
          }
        }
        if (_res.status) ctx.status = _res.status
        if (_res.headers) {
          for (let i in _res.headers) {
            if (_res.headers.hasOwnProperty(i)) ctx.set(i, _res.headers[i])
          }
        }
        if (_res.status && parseInt(_res.status) !== 200 && _res.data) apiData = _res.data
        delete apiData['_res']
      }
    }

    await mockCountProxy.newAndSave(api.id)
    if (jsonpCallback) {
      ctx.type = 'text/javascript'
      ctx.body = `${jsonpCallback}(${JSON.stringify(apiData, null, 2)})`
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029') // JSON parse vs eval fix. https://github.com/rack/rack-contrib/pull/37
    } else {
      ctx.body = apiData
    }
  }
}
