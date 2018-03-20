'use strict'

const { UserProject } = require('../models')

module.exports = class UserProjectProxy {
  static newAndSave (docs) {
    return UserProject.insertMany(docs)
  }

  static find (query, opt) {
    return UserProject.find(query, {}, opt)
  }

  static findOne (query, opt) {
    return UserProject.findOne(query, {}, opt)
  }

  static updateWorkbench (doc) {
    return UserProject.update({
      _id: doc.id
    }, {
      $set: {
        is_workbench: doc.is_workbench
      }
    })
  }

  static delByProjectId (projectId) {
    return UserProject.remove({
      project: projectId
    })
  }

  static del (query) {
    return UserProject.remove(query)
  }
}
