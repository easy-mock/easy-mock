'use strict'

require('should')

const support = require('../support')
const p = require('../../proxy')

const userProjectProxy = p.UserProject

describe('test/proxy/user_project.test.js', () => {
  let user
  let project
  let userProject

  before((done) => {
    support
      .createUser()
      .then((data) => {
        user = data
        return support.gp(user.token)()
      })
      .then((data) => {
        project = data.data[0]
        done()
      })
  })

  after(() => support.cleanCollections())

  it('#updateWorkbench', (done) => {
    userProjectProxy
      .findOne({
        user: user._id,
        project: project._id
      })
      .then((data) => {
        userProject = data
        userProject.is_workbench = true
        return userProjectProxy.updateWorkbench(userProject)
      })
      .then(() => userProjectProxy.findOne({
        user: user._id,
        project: project._id
      }))
      .then((data) => {
        data.is_workbench.should.be.ok()
        done()
      })
  })

  it('#delByProjectId', (done) => {
    userProjectProxy.delByProjectId(project._id)
      .then(done())
  })
})
