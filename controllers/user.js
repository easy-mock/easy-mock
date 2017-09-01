'use strict'

const _ = require('lodash')
const config = require('config')

const p = require('../proxy')
const util = require('../util')
const mock = require('../util/mock')
const ft = require('../models/fields_table')

const userProxy = p.User

exports.list = function * () {
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
    _id: {
      $ne: this.state.user.id
    }
  }

  if (keywords) {
    const keyExp = new RegExp(keywords)
    where.$or = [{
      name: keyExp
    }, {
      nick_name: keyExp
    }]
  }

  let users = yield userProxy.find(where, opt)
  users = users.map(user => _.pick(user, ft.user))
  this.body = this.util.resuccess(users)
}

exports.update = function * () {
  const password = this.checkBody('password').empty().len(6, 20).value
  const nickName = this.checkBody('nick_name').empty().len(2, 20).value
  const headImg = this.checkBody('head_img').empty().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const user = yield userProxy.getById(this.state.user.id)

  // 修改资料
  user.nick_name = nickName || user.nick_name
  user.head_img = headImg || user.head_img
  user.password = password ? yield util.bhash(password) : user.password

  yield userProxy.update(user)

  this.body = this.util.resuccess()
}

exports.login = function * () {
  const name = this.checkBody('name').notEmpty().len(4, 20).value
  const password = this.checkBody('password').notEmpty().len(6, 20).value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  // 判断用户是否已存在
  const user = yield userProxy.getByName(name)

  if (_.isEmpty(user)) {
    this.body = this.util.refail('用户不存在')
    return
  }

  // 验证密码
  const verifyPassword = yield util.bcompare(password, user.password)

  if (!verifyPassword) {
    this.body = this.util.refail('请检查密码是否正确')
    return
  }

  let token = yield this.Token.list({
    id: user.id
  })

  if (_.isEmpty(token)) {
    token = [yield this.Token.create({ id: user.id })]
  }

  user.token = token[0].jwt

  this.body = this.util.resuccess(_.pick(user, ft.user))
}

exports.logout = function * () {
  yield this.Token.destroy()
  this.body = this.util.resuccess()
}

exports.register = function * () {
  const name = this.checkBody('name').notEmpty().len(4, 20).value
  const password = this.checkBody('password').notEmpty().len(6, 20).value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  let user = yield userProxy.getByName(name)

  if (!_.isEmpty(user)) {
    this.body = this.util.refail('注册失败，该用户已存在')
    return
  }

  const npassword = yield util.bhash(password)

  yield userProxy.newAndSave(
    name,
    npassword
  )

  user = yield userProxy.getByName(name)

  yield mock.createExample(user.id)

  this.body = this.util.resuccess()
}
