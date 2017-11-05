'use strict'

const _ = require('lodash')
const { VM } = require('vm2')
const { URL } = require('url')
const JSZip = require('jszip')
const Mock = require('mockjs')
const axios = require('axios')
const config = require('config')
const qs = require('querystring')
const pathToRegexp = require('path-to-regexp')

const p = require('../proxy')
const { getParams } = require('../util/mock')
const ft = require('../models/fields_table')

const projectProxy = p.Project
const mockProxy = p.Mock
const mockCountProxy = p.MockCount
const userProxy = p.User

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

exports.getMock = function * () {
  const query = this.query || {}
  const body = this.request.body || {}
  const method = this.method.toLowerCase()
  const urlArr = _.filter(this.path.split('/')) // filter empty
  const userName = urlArr[1]
  const projectUrl = `/${urlArr[2]}`
  const callbackName = query.jsonp_param_name && (query[query.jsonp_param_name] || 'callback')

  let data
  let mocks
  let reqUrl = `/${urlArr.slice(3).join('/')}`

  if (urlArr.length < 2) {
    this.throw(404)
  }

  try {
    let project

    if (userName.length === 24) {
      // 现以 项目id 作为起始路径
      project = yield projectProxy.findOne({ _id: userName })
      reqUrl = project.url === '/'
        ? `/${urlArr.slice(2).join('/')}`
        : `/${urlArr.slice(2).join('/')}`.replace(project.url, '')
    } else {
      // 兼容以前以用户名开头的路径
      const user = yield userProxy.getByName(userName)
      project = yield projectProxy.findOne({
        user: user.id,
        url: projectUrl
      })
    }

    mocks = yield mockProxy.find({
      project: project.id,
      method
    })
  } catch (e) {
    this.throw(404)
  }

  mocks = mocks.filter((item) => {
    // /api/{user}/{id} => /api/:user/:id
    const url = item.url.replace(/{/g, ':').replace(/}/g, '')
    return pathToRegexp(url).test(reqUrl)
  })

  if (_.isEmpty(mocks)) {
    this.throw(404)
  }

  const mock = mocks[0]

  Mock.Handler.function = function (options) {
    // /api/{user}/{id} => /api/:user/:id
    const mockUrl = mock.url.replace(/{/g, ':').replace(/}/g, '')
    options.Mock = Mock
    // 传入 request cookies，方便使用
    options._req = this.request
    options._req.params = getParams(mockUrl, reqUrl)
    options._req.cookies = this.cookies.get.bind(this)
    return options.template.call(options.context.currentContext, options)
  }.bind(this)

  if (/^http(s)?/.test(mock.mode)) {
    const proxy = mock.mode.split('?')
    const url = new URL(proxy[0])
    const queryString = _.assign({}, qs.parse(proxy[1]), query)
    const params = getParams(mock.url, reqUrl)
    const pathname = pathToRegexp.compile(url.pathname)(params)
    try {
      data = yield axios({
        method: method,
        url: url.origin + pathname,
        params: queryString,
        data: body,
        timeout: 10000
      }).then(res => res.data)
    } catch (error) {
      this.body = this.util.refail(error.message || '无法完成代理请求')
      return
    }
    yield mockCountProxy.newAndSave(mock.id)
    if (callbackName) {
      this.type = 'text/javascript'
      this.body = `${callbackName}(${JSON.stringify(data, null, 2)})`
      // JSON parse vs eval fix. https://github.com/rack/rack-contrib/pull/37
      this.body = this.body
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
    } else {
      this.body = data
    }
    return
  }

  const vm = new VM({
    timeout: 2000,
    sandbox: {
      Mock: Mock,
      mode: mock.mode,
      template: new Function(`return ${mock.mode}`) // eslint-disable-line
    }
  })

  try {
    // 只负责数据验证，检测 setTimeout 等方法
    vm.run('Mock.mock(new Function("return " + mode)())')
    // 解决正则表达式失效的问题
    data = vm.run('Mock.mock(template())')

    yield mockCountProxy.newAndSave(mock.id)
    // 开始处理自定义响应
    if (data._res) {
      let _res = data._res
      if (_res.cookies) {
        for (let i in _res.cookies) {
          if (_res.cookies.hasOwnProperty(i)) {
            this.cookies.set(i, _res.cookies[i])
          }
        }
      }
      if (_res.status) {
        this.status = _res.status
      }
      if (_res.headers) {
        for (let i in _res.headers) {
          if (_res.headers.hasOwnProperty(i)) {
            this.set(i, _res.headers[i])
          }
        }
      }
      if (_res.status && parseInt(_res.status) !== 200 && _res.data) {
        data = _res.data
      }
      delete data['_res']
    }
    if (callbackName) {
      this.type = 'text/javascript'
      // JSON parse vs eval fix. https://github.com/rack/rack-contrib/pull/37
      this.body = (callbackName + '(' + JSON.stringify(data, null, 2) + ')')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
    } else {
      this.body = data
    }
  } catch (err) {
    this.body = this.util.refail(err.message || '请检查 Mode 格式是否正确')
  }
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
