'use strict'

const _ = require('lodash')

const MockProxy = require('./mock')
const { Project } = require('../models')
const UserGroupProxy = require('./user_group')
const UserProjectProxy = require('./user_project')

module.exports = class ProjectProxy {
  static findByIds (ids) {
    return Project.find({ _id: { $in: ids } }).populate('user members group')
  }

  static async getById (uid, projectId) {
    const project = await Project.findById(projectId).populate('user members group')
    const data = await UserProjectProxy.findOne({ project: projectId, user: uid })
    if (project) project.extend = data
    return project
  }

  static async newAndSave (docs) {
    const projects = await Project.insertMany(docs)
    const userProjectDocs = projects.map((project) => {
      const projectId = project.id
      const userId = project.user
      if (userId) {
        return project.members.concat(userId).map(id => ({ user: id, project: projectId }))
      } else {
        return UserGroupProxy
          .find({ group: project.group })
          .then(docs => docs.map(doc => ({ user: doc.user.id, project: projectId })))
      }
    })
    const result = await Promise.all(userProjectDocs)
    await UserProjectProxy.newAndSave(_.flattenDeep(result))

    return projects
  }

  static findOne (query, opt) {
    return Project.findOne(query, {}, opt).populate('user members group')
  }

  static async find (uid, query, opt) {
    const projects = await Project.find(query, {}, opt).populate('user members group')
    const userProjectDocs = await UserProjectProxy.find({
      project: { $in: projects.map(item => item.id) },
      user: uid
    })
    return projects.map(project => {
      project.extend = userProjectDocs.filter(item =>
        item.project.toString() === project.id
      )[0]
      return project
    })
  }

  static updateById (project) {
    return Project.update({
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

  static async delById (projectId) {
    await MockProxy.del({ project: projectId })
    await UserProjectProxy.delByProjectId(projectId)
    await Project.remove({ _id: projectId })
  }
}
