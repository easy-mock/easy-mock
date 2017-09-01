'use strict'

const should = require('should')

const support = require('../support')
const p = require('../../proxy')

describe('test/proxy/mock.test.js', () => {
  let user
  let project
  let mock

  before((done) => {
    support.createUser()
      .then((data) => {
        user = data
        return p.Project.newAndSave({
          user: user._id,
          name: 'pro'
        })
      })
      .then((pro) => {
        project = pro[0]
        done()
      })
  })

  after(() => support.cleanCollections())

  it('#newAndSave', (done) => {
    p.Mock.newAndSave({
      project: project._id,
      description: '我是描述',
      method: 'GET',
      url: '/api',
      mode: '{}'
    }).then((data) => {
      mock = data[0]
      data.should.have.length(1)
      data[0].url.should.eql('/api')
      done()
    })
  })

  it('#delById && getById', (done) => {
    p.Mock.delByIds([mock._id], user._id)
      .then(() => p.Mock.getById(mock._id))
      .then((data) => {
        should.not.exist(data)
        done()
      })
  })

  it('#find', (done) => {
    p.Mock.find().then((data) => {
      data.should.have.length(6)
      should.exist(data[0].project)
      should.exist(data[0].project.user)
      done()
    })
  })
})
