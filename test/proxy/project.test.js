'use strict'

require('should')

const support = require('../support')
const p = require('../../proxy')

describe('test/proxy/project.test.js', () => {
  const projectName = 'pro'
  const projectUrl = '/pj'
  let user
  let project

  before((done) => {
    support.createUser().then((data) => {
      user = data
      done()
    })
  })

  after(() => support.cleanCollections())

  it('#newAndSave', (done) => {
    p.Project
      .newAndSave({
        user: user._id,
        name: projectName,
        url: projectUrl
      })
      .then((data) => {
        project = data[0]
        project.name.should.eql(projectName)
        project.url.should.eql(projectUrl)
        project.members.should.have.length(0)
        done()
      })
  })

  it('#getById', (done) => {
    p.Project.getById(project._id).then((data) => {
      data.name.should.eql(projectName)
      done()
    })
  })

  it('#updateById & getById', (done) => {
    project.name = 'hh'
    p.Project.updateById(project).then((data) => {
      data.n.should.be.exactly(1)
      return p.Project.getById(project._id)
    }).then((data) => {
      data.name.should.eql(project.name)
      done()
    })
  })

  it('#find', (done) => {
    // 刚注册的用户默认会有1个项目演示项目
    p.Project.find(user._id, {
      user: user._id
    }).then((data) => {
      data[0].extend.is_workbench.should.not.be.ok()
      data.should.have.length(2)
      done()
    })
  })

  it('#delById', (done) => {
    p.Project.delById(project._id)
      .then(() => p.Project.find())
      .then((data) => {
        data.should.have.length(1)
        data[0].url.should.eql('/example')
        done()
      })
  })
})
