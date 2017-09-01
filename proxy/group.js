'use strict'

const m = require('../models')
const userGroup = require('./user_group')

const GroupModel = m.Group

exports.newAndSave = function (docs) {
  const group = new GroupModel(docs)
  return group.save().then(data => userGroup.newAndSave({
    user: data.user,
    group: data.id
  }))
}

exports.findByName = function (name) {
  return GroupModel.findOne({ name })
}

exports.findOne = function (query) {
  return GroupModel.findOne(query)
}

exports.find = function (query) {
  return GroupModel.find(query, {})
}

exports.updateById = function (id, doc) {
  return GroupModel.update({ _id: id }, { $set: doc })
}

exports.del = function (query) {
  return GroupModel.remove(query)
}
