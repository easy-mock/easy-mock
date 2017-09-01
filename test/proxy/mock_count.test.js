'use strict'

require('should')

const support = require('../support')
const p = require('../../proxy')

describe('test/proxy/mock_count.test.js', () => {
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
        return p.Mock.newAndSave({
          project: project._id,
          description: '我是描述',
          method: 'GET',
          url: '/api',
          mode: '{}'
        })
      }).then((data) => {
        mock = data[0]
        done()
      })
  })

  after(() => support.cleanCollections())

  it('#newAndSave', (done) => {
    p.MockCount.newAndSave(mock._id)
      .then((data) => {
        data.count.should.be.exactly(1)
        return p.MockCount.newAndSave(mock._id)
      })
      .then(() => p.MockCount.newAndSave(mock._id))
      .then((data) => {
        data.count.should.be.exactly(3)
        done()
      })
  })
})
