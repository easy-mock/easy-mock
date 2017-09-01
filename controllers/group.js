'use strict'

const _ = require('lodash')

const p = require('../proxy')
const m = require('../models')
const ft = require('../models/fields_table')

const groupProxy = p.Group
const userGroupProxy = p.UserGroup
const userProjectProxy = p.UserProject
const Project = m.Project

exports.list = function * () {
  const uid = this.state.user.id
  const keywords = this.checkQuery('keywords').value
  let groups

  if (keywords) {
    groups = yield groupProxy.find({ name: keywords })
    groups = groups.map(o => _.pick(o, ft.group))
  } else {
    groups = yield userGroupProxy.find({ user: uid })
    groups = groups.map(o => _.pick(o.group, ft.group))
  }

  this.body = this.util.resuccess(groups)
}

exports.create = function * () {
  const name = this.checkBody('name').notEmpty().len(3, 16).value
  const uid = this.state.user.id

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const doc = yield groupProxy.findByName(name)

  if (doc) {
    this.body = this.util.refail('创建失败，已存在相同团队名')
    return
  }

  yield groupProxy.newAndSave({
    user: uid,
    name
  })

  this.body = this.util.resuccess()
}

exports.update = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value
  const name = this.checkBody('name').notEmpty().len(3, 16).value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  let doc = yield groupProxy.findOne({
    _id: id,
    user: uid
  })

  if (!doc) {
    this.body = this.util.refail('更新失败，无权限')
    return
  }

  doc = yield groupProxy.findByName(name)

  if (doc) {
    this.body = this.util.refail('更新失败，已存在相同团队名')
    return
  }

  yield groupProxy.updateById(id, { name })

  this.body = this.util.resuccess()
}

exports.join = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty('团队不存在').value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  yield userGroupProxy.newAndSave({ user: uid, group: id })

  this.body = this.util.resuccess()
}

exports.delete = function * () {
  const uid = this.state.user.id
  const id = this.checkBody('id').notEmpty().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 是否创建者删除
  const group = yield groupProxy.findOne({
    _id: id,
    user: uid
  })

  const projects = yield Project.find({ group: id })
  const projectIds = projects.map(o => o.id)

  if (group) {
    if (projects.length > 0) {
      this.body = this.util.refail('删除失败，请先删除团队下所有的项目')
      return
    }
    yield groupProxy.del({ _id: id })
    yield userGroupProxy.del({ group: id })
  } else {
    yield userGroupProxy.del({ user: uid, group: id })
    yield userProjectProxy.del({ user: uid, project: { $in: projectIds } })
  }

  this.body = this.util.resuccess()
}
