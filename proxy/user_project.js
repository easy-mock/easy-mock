'use strict'

const m = require('../models')

const UserProjectModel = m.UserProject

exports.newAndSave = function (docs) {
  return UserProjectModel.insertMany(docs)
}

exports.getById = function (docId) {
  return UserProjectModel.findById(docId)
}

exports.find = function (query, opt) {
  return UserProjectModel.find(query, {}, opt)
}

exports.findOne = function (query, opt) {
  return UserProjectModel.findOne(query, {}, opt)
}

exports.updateWorkbench = function (doc) {
  return UserProjectModel.update({
    _id: doc.id
  }, {
    $set: {
      is_workbench: doc.is_workbench
    }
  })
}

exports.delByProjectId = function (projectId) {
  return UserProjectModel.remove({
    project: projectId
  })
}

exports.del = function (query) {
  return UserProjectModel.remove(query)
}
