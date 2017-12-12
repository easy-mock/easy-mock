'use strict'

const { Group } = require('../models')
const UserGroupProxy = require('./user_group')

module.exports = class GroupProxy {
  static async newAndSave (docs) {
    const group = new Group(docs)
    const result = await group.save()
    return UserGroupProxy.newAndSave({ user: result.user, group: result.id })
  }

  static findByName (name) {
    return Group.findOne({ name })
  }

  static findOne (query) {
    return Group.findOne(query)
  }

  static find (query) {
    return Group.find(query, {})
  }

  static updateById (id, doc) {
    return Group.update({ _id: id }, { $set: doc })
  }

  static del (query) {
    return Group.remove(query)
  }
}
