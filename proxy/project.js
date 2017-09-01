'use strict'

const _ = require('lodash')

const m = require('../models')
const mock = require('./mock')
const userProject = require('./user_project')
const userGroup = require('./user_group')

const ProjectModel = m.Project

exports.newAndSave = function (docs) {
  return ProjectModel.insertMany(docs)
    .then(data => Promise.all(data.map((item) => {
      const projectId = item.id
      const userIds = _.uniq([item.user].concat(item.members))
      // 区分 个人项目 or 团队项目
      // 获取团队下所有的用户，创建关联表
      return item.user
        ? userIds.map(id => ({ user: id, project: projectId }))
        : userGroup.find({ group: item.group }).then(data => data.map(o => ({
          user: o.user.id,
          project: projectId
        })))
    }))
      .then(docs => userProject.newAndSave(_.flattenDeep(docs)))
      .then(() => data))
}

exports.getById = function (projectId) {
  return ProjectModel.findById(projectId).populate('user members group')
    .then(project => userProject
      .findOne({ project: project.id })
      .then(data => {
        project.extend = data
        return project
      })
    )
}

exports.findByIds = function (ids) {
  return ProjectModel.find({ _id: { $in: ids } })
    .populate('user members group')
}

exports.find = function (sessionUId, query, opt) {
  return ProjectModel.find(query, {}, opt).populate('user members group')
    .then(projects => userProject.find({
      project: { $in: projects.map(item => item.id) },
      user: sessionUId
    })
      .then(data => projects.map((project) => {
        project.extend = data.filter(item =>
          item.project.toString() === project.id
        )[0]
        return project
      })))
}

exports.findOne = function (query, opt) {
  return ProjectModel.findOne(query, {}, opt).populate('user members group')
}

exports.updateById = function (project) {
  return ProjectModel.update({
    _id: project.id
  }, {
    $set: {
      url: project.url,
      name: project.name,
      members: project.members,
      description: project.description,
      swagger_url: project.swagger_url
    }
  })
}

exports.delById = function (projectId) {
  return mock.del({ project: projectId })
    .then(() => userProject.delByProjectId(projectId))
    .then(() => ProjectModel.remove({ _id: projectId }))
}
