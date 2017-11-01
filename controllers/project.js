'use strict'

const _ = require('lodash')
const config = require('config')

const p = require('../proxy')
const swagger = require('../util/swagger')
const ft = require('../models/fields_table')

const projectProxy = p.Project
const mockProxy = p.Mock
const userProjectProxy = p.UserProject

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
  const uid = this.state.user.id
  const group = this.checkQuery('group').value
  const pageSize = this.checkQuery('page_size').empty().toInt().gt(0)
    .default(config.get('pageSize')).value
  const pageIndex = this.checkQuery('page_index').empty().toInt().gt(0)
    .default(1).value
  const type = this.checkQuery('type').empty().toLow().in([
    'workbench'
  ]).value
  // 0：全部、1：我创建的、2：我加入的
  const filterByAuthor = this.checkQuery('filter_by_author')
    .empty().toInt().default(0).value
  const keywords = this.checkQuery('keywords').value

  let projects
  let baseWhere

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const opt = {
    skip: (pageIndex - 1) * pageSize,
    limit: pageSize,
    sort: '-create_at'
  }

  if (group) {
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
      // 获取该用户下所有在工作台中的项目
      projects = yield userProjectProxy.find({
        user: uid,
        is_workbench: true
      })
      projects = projects.map(item => item.project)
      projects = yield projectProxy.find(uid, {
        _id: { $in: projects }
      })
      break
    default:
      projects = yield projectProxy.find(uid, where, opt)
  }

  projects = _.map(projects, (item) => {
    item.members = item.members.map(item => _.pick(item, ft.user))
    item.extend = _.pick(item.extend, ft.projectExtend)
    item.user = _.pick(item.user, ft.user)
    return _.pick(item, ['user'].concat(ft.project))
  })

  this.body = this.util.resuccess(projects)
}

exports.create = function * () {
  const uid = this.state.user.id
  const group = this.checkBody('group').value
  const name = this.checkBody('name').notEmpty().value
  const description = this.checkBody('description').value
  const swaggerUrl = this.checkBody('swagger_url').empty().isUrl(null, {
    allow_underscores: true
  }).value
  const memberIds = this.checkBody('members').empty()
    .type('array').value
  const url = this.checkBody('url').notEmpty()
    .match(/^\/.*$/i, 'URL 必须以 / 开头').value

  const findQuery = {
    $or: [{ name }, { url }]
  }
  const saveQuery = {
    name,
    url,
    swagger_url: swaggerUrl,
    description: description || name
  }

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  if (_.includes(memberIds, uid)) {
    this.body = this.util.refail('创建失败，不能邀请自己哦')
    return
  }

  if (group) {
    findQuery.group = group
    saveQuery.group = group
  } else {
    findQuery.user = uid
    saveQuery.user = uid
    saveQuery.members = memberIds
  }

  const project = yield projectProxy.findOne(findQuery)

  if (project) {
    this.body = project.name === name
      ? this.util.refail('创建失败，与现有项目同名')
      : this.util.refail('创建失败，与现有项目的 URL 相同')
    return
  }

  const newProjects = yield projectProxy.newAndSave(saveQuery)

  // 基于 swagger 创建 mock
  if (swaggerUrl) {
    // 防止在依赖 swagger 创建 mock 的时候返回失败
    try {
      yield swagger.create(newProjects[0])
    } catch (err) {
      this.log.error(
        { req: this.req, err },
        '  --> %s %s, 基于 Swagger 创建 Mock 发生异常',
        this.request.method,
        this.request.originalUrl
      )
    }
  }

  this.body = this.util.resuccess()
}

exports.update = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value
  const name = this.checkBody('name').value
  const description = this.checkBody('description').value
  const swaggerUrl = this.checkBody('swagger_url').empty().isUrl(null, {
    allow_underscores: true
  }).value
  const memberIds = this.checkBody('members').empty()
    .type('array').value
  const url = this.checkBody('url').empty()
    .match(/^\/.*$/i, 'URL 必须以 / 开头').value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const project = yield projectExistCheck(id, uid)

  if (!project) {
    this.body = this.util.refail('更新失败，无权限')
    return
  }

  // 如果存在 members，判断是否存在，不能包含创建人
  if (project.user && _.includes(memberIds, project.user.id)) {
    this.body = this.util.refail('更新失败，用户未命中，请检查用户 ID')
    return
  }

  // 创建关联表
  if (memberIds &&
    memberIds.length !== project.members.length) {
    // 获取操作状态 添加 or 移除
    const isAddMember = memberIds.length > project.members.length
    const diff = _.xor(memberIds, project.members.map(o => o.id))

    if (isAddMember) {
      yield userProjectProxy.newAndSave(diff.map(userId => ({
        user: userId,
        project: project.id
      })))
    } else {
      yield userProjectProxy.del({
        project: project.id,
        user: { $in: diff }
      })
    }
  }

  // 更新属性
  project.url = url || project.url
  project.name = name || project.name
  project.members = memberIds || project.members
  project.swagger_url = swaggerUrl || project.swagger_url
  project.description = description || project.description

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

  // 查重
  const existProject = yield projectProxy.findOne(existQuery)

  if (existProject) {
    if (existProject.name === project.name) {
      this.body = this.util.refail('更新失败，与现有项目同名')
    } else {
      this.body = this.util.refail('更新失败，与现有项目的 URL 相同')
    }
    return
  }

  yield projectProxy.updateById(project)
  this.body = this.util.resuccess()
}

exports.updateSwagger = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 验证 project 是否存在
  const project = yield projectExistCheck(id, uid)

  if (!project) {
    this.body = this.util.refail('更新失败，无权限')
    return
  }

  if (!/http(s)?:\/\//.test(project.swagger_url)) {
    this.body = this.util.refail('更新失败，未设置 Swagger')
    return
  }

  try {
    yield swagger.create(project)
    this.body = this.util.resuccess()
  } catch (err) {
    this.log.error(
      { req: this.req, err },
      '  --> %s %s, 基于 Swagger 更新 Mock 发生异常',
      this.request.method,
      this.request.originalUrl
    )
    this.body = this.util.refail('同步失败，' + err)
  }
}

exports.updateWorkbench = function * () {
  const id = this.checkBody('id').notEmpty().value
  const status = this.checkBody('status').notEmpty().type('boolean').value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const doc = yield userProjectProxy.findOne({
    _id: id,
    user: this.state.user.id
  })

  if (!doc) {
    this.body = this.util.refail('更新失败，无权限')
    return
  }

  doc.is_workbench = status

  yield userProjectProxy.updateWorkbench(doc)

  this.body = this.util.resuccess()
}

exports.delete = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 获取project
  const project = yield projectExistCheck(id, uid)

  if (!project) {
    this.body = this.util.refail('删除失败，无权限')
    return
  } else if (project.group && project.group.user.toString() !== uid) {
    this.body = this.util.refail('删除失败，非团队创建者无法删除项目')
    return
  }

  yield projectProxy.delById(id)

  this.body = this.util.resuccess()
}

exports.copy = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 获取待复制项目下所有 mock
  const mocks = yield mockProxy.find({ project: id })

  if (mocks.length === 0) {
    this.body = this.util.refail('创建失败，该项目下无 Mock 数据')
    return
  }

  const project = mocks[0].project
  const newUrl = `${project.url}_${_.now()}`
  const newName = `${project.name}_${_.now()}`

  // 创建项目，只创建已有 mock。
  // 此时 swagger_url 无效
  yield projectProxy.newAndSave({
    user: uid,
    name: newName,
    url: newUrl,
    description: project.description,
    swagger_url: project.swagger_url
  }).then(projects => mockProxy.newAndSave(mocks.map(item => ({
    project: projects[0].id,
    description: item.description,
    method: item.method,
    url: item.url,
    mode: item.mode
  }))))

  this.body = this.util.resuccess()
}
