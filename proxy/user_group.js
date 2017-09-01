'use strict'

const m = require('../models')
const userProjectProxy = require('./user_project')

const ProjectModel = m.Project
const UserGroupModel = m.UserGroup

exports.newAndSave = function (doc) {
  const UserGroup = new UserGroupModel(doc)
  return UserGroupModel
    .findOne(doc)
    .then(data => (data || UserGroup.save()))
    .then(() => ProjectModel.find({ group: doc.group }))
    // 获取团队下所有项目，建立关联表
    .then((projects) => {
      const data = projects.length > 0
        ? userProjectProxy.newAndSave(projects.map(o => ({
          user: doc.user,
          project: o.id
        })))
        : []
      return data
    })
}

exports.find = function (query) {
  return UserGroupModel.find(query, {}).populate('user group')
}

exports.del = function (query) {
  return UserGroupModel.remove(query)
}
