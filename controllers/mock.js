'use strict'

const _ = require('lodash')
const { VM } = require('vm2')
const nodeURL = require('url')
const JSZip = require('jszip')
const Mock = require('mockjs')
const axios = require('axios')
const config = require('config')
const pathToRegexp = require('path-to-regexp')

const util = require('../util')
const ft = require('../models/fields_table')
const { MockProxy, ProjectProxy, UserGroupProxy } = require('../proxy')

const redis = util.getRedis()
const defPageSize = config.get('pageSize')

async function checkByMockId (mockId, uid) {
  const api = await MockProxy.getById(mockId)

  if (!api) return '接口不存在'

  const project = await checkByProjectId(api.project.id, uid)

  if (typeof project === 'string') return project
  return { api, project }
}

async function checkByProjectId (projectId, uid) {
  const project = await ProjectProxy.findOne({ _id: projectId })

  if (project) {
    const group = project.group
    if (group) {
      const userGroup = await UserGroupProxy.findOne({ user: uid, group: group })
      if (!userGroup) return '无权限操作'
    } else if (project.user.id !== uid) {
      /* istanbul ignore else */
      if (!_.find(project.members, ['id', uid])) return '无权限操作'
    }
    return project
  }

  return '项目不存在'
}

module.exports = class MockController {
  /**
   * 创建接口
   * @param Object ctx
   */

  static async create (ctx) {
    const uid = ctx.state.user.id
    const mode = ctx.checkBody('mode').notEmpty().value
    const projectId = ctx.checkBody('project_id').notEmpty().value
    const description = ctx.checkBody('description').notEmpty().value
    const url = ctx.checkBody('url').notEmpty().match(/^\/.*$/i, 'URL 必须以 / 开头').value
    const method = ctx.checkBody('method').notEmpty().toLow().in(['get', 'post', 'put', 'delete', 'patch']).value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(projectId, uid)

    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    const api = await MockProxy.findOne({
      project: projectId,
      url,
      method
    })

    if (api) {
      ctx.body = ctx.util.refail('请检查接口是否已经存在')
      return
    }

    await MockProxy.newAndSave({
      project: projectId,
      description,
      method,
      url,
      mode
    })

    await redis.del('project:' + projectId)
    ctx.body = ctx.util.resuccess()
  }

  /**
   * 获取接口列表
   * @param Object ctx
   */

  static async list (ctx) {
    const uid = ctx.state.user.id
    const keywords = ctx.query.keywords
    const projectId = ctx.checkQuery('project_id').notEmpty().value
    const pageSize = ctx.checkQuery('page_size').empty().toInt().gt(0).default(defPageSize).value
    const pageIndex = ctx.checkQuery('page_index').empty().toInt().gt(0).default(1).value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const opt = {
      skip: (pageIndex - 1) * pageSize,
      limit: pageSize,
      sort: '-create_at'
    }

    const where = { project: projectId }

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

    let mocks = await MockProxy.find(where, opt)
    let project = await ProjectProxy.getById(uid, projectId)

    /* istanbul ignore else */
    if (project) {
      project.members = project.members.map(o => _.pick(o, ft.user))
      project.extend = _.pick(project.extend, ft.projectExtend)
      project.group = _.pick(project.group, ft.group)
      project.user = _.pick(project.user, ft.user)
      project = _.pick(project, ['user'].concat(ft.project))
    }

    mocks = mocks.map(o => _.pick(o, ft.mock))

    ctx.body = ctx.util.resuccess({ project: project || {}, mocks })
  }

  /**
   * 更新接口
   * @param Object ctx
   */

  static async update (ctx) {
    const uid = ctx.state.user.id
    const id = ctx.checkBody('id').notEmpty().value
    const mode = ctx.checkBody('mode').notEmpty().value
    const description = ctx.checkBody('description').notEmpty().value
    const url = ctx.checkBody('url').notEmpty().match(/^\/.*$/i, 'URL 必须以 / 开头').value
    const method = ctx.checkBody('method').notEmpty().toLow().in(['get', 'post', 'put', 'delete', 'patch']).value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const result = await checkByMockId(id, uid)

    if (typeof result === 'string') {
      ctx.body = ctx.util.refail(result)
      return
    }

    const { api, project } = result

    api.url = url
    api.mode = mode
    api.method = method
    api.description = description

    const existMock = await MockProxy.findOne({
      _id: { $ne: api.id },
      project: project.id,
      url: api.url,
      method: api.method
    })

    if (existMock) {
      ctx.body = ctx.util.refail('接口已经存在')
      return
    }

    await MockProxy.updateById(api)
    await redis.del('project:' + project.id)
    ctx.body = ctx.util.resuccess()
  }

  /**
   * 获取 Mock 接口
   * @param {*} ctx
   */

  static async getMockAPI (ctx) {
    const { query, body } = ctx.request
    const method = ctx.method.toLowerCase()
    const jsonpCallback = query.jsonp_param_name && (query[query.jsonp_param_name] || 'callback')
    let { projectId, mockURL } = ctx.pathNode
    const redisKey = 'project:' + projectId
    let apiData, apis, api

    apis = await redis.get(redisKey)

    if (apis) {
      apis = JSON.parse(apis)
    } else {
      apis = await MockProxy.find({ project: projectId })
      if (apis[0]) await redis.set(redisKey, JSON.stringify(apis), 'EX', 60 * 30)
    }

    if (apis[0] && apis[0].project.url !== '/') {
      mockURL = mockURL.replace(apis[0].project.url, '') || '/'
    }

    api = apis.filter((item) => {
      const url = item.url.replace(/{/g, ':').replace(/}/g, '') // /api/{user}/{id} => /api/:user/:id
      return item.method === method && pathToRegexp(url).test(mockURL)
    })[0]

    if (!api) ctx.throw(404)

    Mock.Handler.function = function (options) {
      const mockUrl = api.url.replace(/{/g, ':').replace(/}/g, '') // /api/{user}/{id} => /api/:user/:id
      options.Mock = Mock
      options._req = ctx.request
      options._req.params = util.params(mockUrl, mockURL)
      options._req.cookies = ctx.cookies.get.bind(ctx)
      return options.template.call(options.context.currentContext, options)
    }

    if (/^http(s)?/.test(api.mode)) { // 代理模式
      const url = nodeURL.parse(api.mode.replace(/{/g, ':').replace(/}/g, ''), true)
      const params = util.params(api.url.replace(/{/g, ':').replace(/}/g, ''), mockURL)
      const pathname = pathToRegexp.compile(url.pathname)(params)
      try {
        apiData = await axios({
          method: method,
          url: url.protocol + '//' + url.host + pathname,
          params: _.assign({}, url.query, query),
          data: body,
          timeout: 3000,
          headers: ctx.headers
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

      /* istanbul ignore else */
      if (apiData._res) { // 自定义响应 Code
        let _res = apiData._res
        ctx.status = _res.status || /* istanbul ignore next */ 200
        /* istanbul ignore else */
        if (_res.cookies) {
          for (let i in _res.cookies) {
            /* istanbul ignore else */
            if (_res.cookies.hasOwnProperty(i)) ctx.cookies.set(i, _res.cookies[i])
          }
        }
        /* istanbul ignore next */
        if (_res.headers) {
          for (let i in _res.headers) {
            /* istanbul ignore next */
            if (_res.headers.hasOwnProperty(i)) ctx.set(i, _res.headers[i])
          }
        }
        /* istanbul ignore next */
        if (_res.status && parseInt(_res.status, 10) !== 200 && _res.data) apiData = _res.data
        delete apiData['_res']
      }
    }

    await redis.lpush('mock.count', api._id)
    if (jsonpCallback) {
      ctx.type = 'text/javascript'
      ctx.body = `${jsonpCallback}(${JSON.stringify(apiData, null, 2)})`
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029') // JSON parse vs eval fix. https://github.com/rack/rack-contrib/pull/37
    } else {
      ctx.body = apiData
    }
  }

  /**
   * Easy Mock CLI 依赖该接口获取接口数据
   * @param Object ctx
   */

  static async getAPIByProjectIds (ctx) {
    let projectIds = ctx.checkQuery('project_ids').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    projectIds = projectIds.split(',')

    const apis = await MockProxy.find({
      project: {
        $in: projectIds
      }
    })

    const projects = await ProjectProxy.findByIds(projectIds)

    const result = {}

    projects.forEach((project) => {
      const projectId = project.id
      let newMocks = apis.filter(o => (o.project.id === projectId))
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

    ctx.body = ctx.util.resuccess(result)
  }

  /**
   * 接口导出
   * @param Object ctx
   */

  static async exportAPI (ctx) {
    const zip = new JSZip()
    const ids = ctx.checkBody('ids').empty().type('array').value
    const projectId = ctx.checkBody('project_id').empty().value
    let apis

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    if (projectId) {
      apis = await MockProxy.find({ project: projectId })
    } else if (!_.isEmpty(ids)) {
      apis = await MockProxy.find({
        _id: {
          $in: ids
        }
      })
    } else {
      ctx.body = ctx.util.refail('参数不能为空')
      return
    }

    if (_.isEmpty(apis)) {
      ctx.body = ctx.util.refail('没有可导出的接口')
      return
    }

    apis.forEach((api) => {
      zip.file(`${api.project.url}${api.url}.json`, api.mode)
    })

    const content = await zip.generateAsync({ type: 'nodebuffer' })

    ctx.set('Content-disposition', 'attachment; filename=Easy-Mock-API.zip')
    ctx.body = content
  }

  /**
   * 删除接口
   * @param Object ctx
   */

  static async delete (ctx) {
    const uid = ctx.state.user.id
    const projectId = ctx.checkBody('project_id').notEmpty().value
    const ids = ctx.checkBody('ids').notEmpty().type('array').value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(projectId, uid)

    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    await MockProxy.find({
      _id: {
        $in: ids
      },
      project: projectId
    })

    await MockProxy.delByIds(ids)
    await redis.del('project:' + projectId)
    ctx.body = ctx.util.resuccess()
  }
}
