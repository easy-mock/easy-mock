'use strict'

const _ = require('lodash')
const config = require('config')

const util = require('../util')
const ft = require('../models/fields_table')
const SwaggerUtil = require('../util/swagger')
const { MockProxy, ProjectProxy, UserProjectProxy, UserGroupProxy } = require('../proxy')

const redis = util.getRedis()
const defPageSize = config.get('pageSize')

async function checkByProjectId (projectId, uid, creater) {
  const project = await ProjectProxy.findOne({ _id: projectId })

  if (project) {
    const group = project.group
    if (group) {
      if (creater && group.user.toString() !== uid) return '无权限操作'
      const userGroup = await UserGroupProxy.findOne({ user: uid, group: group })
      if (!userGroup) return '无权限操作'
    } else if (project.user.id !== uid) {
      if (creater) return '无权限操作'
      /* istanbul ignore else */
      if (!_.find(project.members, ['id', uid])) return '无权限操作'
    }
    return project
  }

  return '项目不存在'
}

module.exports = class ProjectController {
  /**
   * 创建项目
   * @param Object ctx
   */

  static async create (ctx) {
    const uid = ctx.state.user.id
    const group = ctx.request.body.group
    const description = ctx.request.body.description
    const name = ctx.checkBody('name').notEmpty().value
    const memberIds = ctx.checkBody('members').empty().type('array').value
    const url = ctx.checkBody('url').notEmpty().match(/^\/.*$/i, 'URL 必须以 / 开头').value
    const swaggerUrl = ctx.checkBody('swagger_url').empty().isUrl(null, { allow_underscores: true, require_protocol: true }).value
    const findQuery = { $or: [{ name }, { url }] }
    const saveQuery = {
      name,
      url,
      swagger_url: swaggerUrl,
      description: description || name
    }

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    if (_.includes(memberIds, uid)) {
      ctx.body = ctx.util.refail('项目成员不能包含自己')
      return
    }

    if (group) {
      findQuery.group = group
      saveQuery.group = group

      const userGroup = await UserGroupProxy.findOne({ user: uid, group: group })

      if (!userGroup) {
        ctx.body = ctx.util.refail('无权限操作')
        return
      }
    } else {
      findQuery.user = uid
      saveQuery.user = uid
      saveQuery.members = memberIds
    }

    const project = await ProjectProxy.findOne(findQuery)

    if (project) {
      ctx.body = project.name === name
        ? ctx.util.refail(`项目 ${name} 已存在`)
        : ctx.util.refail('请检查 URL 是否已经存在')
      return
    }

    const projects = await ProjectProxy.newAndSave(saveQuery)

    if (swaggerUrl) {
      await SwaggerUtil.create(projects[0])
    }

    ctx.body = ctx.util.resuccess()
  }

  /**
   * 复制项目
   * @param Object ctx
   */

  static async copy (ctx) {
    const uid = ctx.state.user.id
    const id = ctx.checkBody('id').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(id, uid)

    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    const apis = await MockProxy.find({ project: id })

    if (apis.length === 0) {
      ctx.body = ctx.util.refail('该项目无接口可复制')
      return
    }

    const newUrl = project.url + '_copy'
    const newName = project.name + '_copy'
    const query = { user: uid, $or: [{ name: newName }, { url: newUrl }] }
    const checkProject = await ProjectProxy.findOne(query)

    if (checkProject) {
      ctx.body = checkProject.name === newName
        ? ctx.util.refail(`项目 ${newName} 已存在`)
        : ctx.util.refail('请检查 URL 是否已经存在')
      return
    }

    const projects = await ProjectProxy.newAndSave({
      user: uid,
      name: newName,
      url: newUrl,
      description: project.description,
      swagger_url: project.swagger_url
    })

    const newAPIs = apis.map(item => ({
      project: projects[0].id,
      description: item.description,
      method: item.method,
      url: item.url,
      mode: item.mode
    }))

    await MockProxy.newAndSave(newAPIs)

    ctx.body = ctx.util.resuccess()
  }

  /**
   * 获取项目列表
   * @param Object ctx
   */

  static async list (ctx) {
    const uid = ctx.state.user.id
    const group = ctx.query.group
    const keywords = ctx.query.keywords
    const type = ctx.checkQuery('type').empty().toLow().in([ 'workbench' ]).value
    const pageIndex = ctx.checkQuery('page_index').empty().toInt().gt(0).default(1).value
    const pageSize = ctx.checkQuery('page_size').empty().toInt().gt(0).default(defPageSize).value
    const filterByAuthor = ctx.checkQuery('filter_by_author').empty().toInt().default(0).value // 0：全部、1：我创建的、2：我加入的

    let projects, baseWhere

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const opt = {
      skip: (pageIndex - 1) * pageSize,
      limit: pageSize,
      sort: '-create_at'
    }

    if (group) {
      const userGroup = await UserGroupProxy.findOne({ user: uid, group: group })
      if (!userGroup) {
        ctx.body = ctx.util.resuccess([])
        return
      }
      baseWhere = [{ group }]
    } else {
      if (filterByAuthor === 0) {
        baseWhere = [
          { user: uid },
          { members: { $elemMatch: { $eq: uid } } }
        ]
      } else if (filterByAuthor === 1) {
        baseWhere = [{ user: uid }]
      } else {
        baseWhere = [
          { members: { $elemMatch: { $eq: uid } } }
        ]
      }
    }

    let where = { $or: baseWhere }

    if (keywords) {
      const keyExp = new RegExp(keywords, 'i')
      where = {
        $and: [
          { $or: baseWhere },
          {
            $or: [
              { url: keyExp },
              { description: keyExp },
              { name: keyExp }]
          }
        ]
      }
    }

    switch (type) {
      case 'workbench':
        projects = await UserProjectProxy.find({
          user: uid,
          is_workbench: true
        })
        projects = projects.map(item => item.project)
        projects = await ProjectProxy.find(uid, {
          _id: { $in: projects }
        })
        break
      default:
        projects = await ProjectProxy.find(uid, where, opt)
    }

    projects = _.map(projects, (item) => {
      item.members = item.members.map(item => _.pick(item, ft.user))
      item.extend = _.pick(item.extend, ft.projectExtend)
      item.user = _.pick(item.user, ft.user)
      return _.pick(item, ['user'].concat(ft.project))
    })

    ctx.body = ctx.util.resuccess(projects)
  }

  /**
   * 更新工作台
   * @param Object ctx
   */

  static async updateWorkbench (ctx) {
    const uid = ctx.state.user.id
    const id = ctx.checkBody('id').notEmpty().value
    const status = ctx.checkBody('status').notEmpty().type('boolean').value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const userProjectDocs = await UserProjectProxy.findOne({ _id: id, user: uid })

    if (!userProjectDocs) {
      ctx.body = ctx.util.refail('无权限操作')
      return
    }

    userProjectDocs.is_workbench = status

    await UserProjectProxy.updateWorkbench(userProjectDocs)

    ctx.body = ctx.util.resuccess()
  }

  /**
   * 更新项目
   * @param Object ctx
   */

  static async update (ctx) {
    const uid = ctx.state.user.id
    const id = ctx.checkBody('id').notEmpty().value
    const name = ctx.checkBody('name').notEmpty().value
    const description = ctx.request.body.description || ''
    const memberIds = ctx.checkBody('members').empty().type('array').value
    const url = ctx.checkBody('url').notEmpty().match(/^\/.*$/i, 'URL 必须以 / 开头').value
    const swaggerUrl = ctx.checkBody('swagger_url').empty().isUrl(null, { allow_underscores: true, require_protocol: true }).value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(id, uid)

    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    if (project.user && _.includes(memberIds, project.user.id)) {
      ctx.body = ctx.util.refail('项目成员不能包含创建者')
      return
    }

    let diffIds = _.difference(project.members, memberIds)

    if (diffIds.length > 0) {
      await UserProjectProxy.del({
        project: project.id,
        user: { $in: diffIds }
      })
    }

    diffIds = _.difference(memberIds, project.members)

    if (diffIds.length > 0) {
      await UserProjectProxy.newAndSave(diffIds.map(userId => ({
        user: userId,
        project: project.id
      })))
    }

    project.url = url
    project.name = name
    project.members = memberIds || []
    project.swagger_url = swaggerUrl
    project.description = description

    const existQuery = {
      _id: { $ne: project.id },
      $or: [{
        url: project.url
      }, {
        name: project.name
      }]
    }

    if (project.group) {
      existQuery.group = project.group.id
    } else {
      existQuery.user = project.user.id
    }

    const existProject = await ProjectProxy.findOne(existQuery)

    if (existProject) {
      ctx.body = existProject.name === project.name
        ? ctx.util.refail(`项目 ${project.name} 已存在`)
        : ctx.util.refail('请检查 URL 是否已经存在')
      return
    }

    await ProjectProxy.updateById(project)
    await redis.del('project:' + id)
    ctx.body = ctx.util.resuccess()
  }

  /**
   * 同步 Swagger 文档
   * @param Object ctx
   */

  static async syncSwagger (ctx) {
    const uid = ctx.state.user.id
    const id = ctx.checkBody('id').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(id, uid)

    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    if (!project.swagger_url) {
      ctx.body = ctx.util.refail('请先设置 Swagger 文档地址')
      return
    }

    try {
      await SwaggerUtil.create(project)
    } catch (error) {
      ctx.body = ctx.util.refail(error.message)
      return
    }

    await redis.del('project:' + id)
    ctx.body = ctx.util.resuccess()
  }

  /**
   * 删除项目
   * @param Object ctx
   */

  static async delete (ctx) {
    const uid = ctx.state.user.id
    const id = ctx.checkBody('id').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(id, uid, true)

    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    await ProjectProxy.delById(id)
    await redis.del('project:' + id)
    ctx.body = ctx.util.resuccess()
  }
}
