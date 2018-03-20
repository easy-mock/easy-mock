'use strict'

const UserProjectProxy = require('./user_project')
const { Project, UserGroup } = require('../models')

module.exports = class UserGroupProxy {
  static async newAndSave (doc) {
    let userGroup = await UserGroup.findOne(doc)

    /* istanbul ignore else */
    if (!userGroup) {
      userGroup = new UserGroup(doc)
      await userGroup.save()
    }

    const projects = await Project.find({ group: doc.group })

    /* istanbul ignore else */
    if (projects.length === 0) return []

    const userProjectDocs = projects.map(project => {
      return { user: doc.user, project: project.id }
    })

    return UserProjectProxy.newAndSave(userProjectDocs)
  }

  static find (query) {
    return UserGroup.find(query, {}).populate('user group')
  }

  static findOne (query) {
    return UserGroup.findOne(query)
  }

  static del (query) {
    return UserGroup.remove(query)
  }
}
