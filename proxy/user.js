'use strict'

const _ = require('lodash')
const config = require('config')

const m = require('../models')

const UserModel = m.User

exports.newAndSave = function (name, password, nickName, headImg) {
  const user = new UserModel()
  const len = config.get('gravatar').length

  user.name = name
  user.password = password
  user.email = email || ''
  user.nick_name = nickName || _.now()
  user.head_img = headImg || config.get('gravatar')[_.random(0, len - 1)]

  return user.save()
}

exports.update = function (user) {
  return UserModel.update({
    _id: user.id
  }, {
    $set: {
      nick_name: user.nick_name,
      email: user.email,
      head_img: user.head_img,
      password: user.password
    }
  })
}

exports.getByName = function (userName) {
  return UserModel.findOne({ name: userName })
}

exports.getById = function (userId) {
  return UserModel.findById(userId)
}

exports.find = function (query, opt) {
  return UserModel.find(query, {}, opt)
}
