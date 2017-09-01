'use strict'

require('should')

const support = require('../support')
const p = require('../../proxy')
const util = require('../../util')

describe('test/proxy/user.test.js', () => {
  const name = '_test'
  const password = '123456'
  let user

  after(() => support.cleanCollections())

  it('#newAndSave', (done) => {
    util.bhash(password).then((pass) => {
      p.User.newAndSave(name, pass, 'nic').then((data) => {
        user = data
        user.name.should.eql(name)
        user.password.should.eql(pass)
        done()
      })
    })
  })

  it('#find', (done) => {
    p.User.find({
      name
    }).then((data) => {
      data.should.have.length(1)
      data[0].name.should.eql(name)
      done()
    })
  })

  it('#getByName', (done) => {
    p.User.getByName(name).then(done())
  })

  it('#getById', (done) => {
    p.User.getByName(name)
      .then(data => p.User.getById(data._id))
      .then(done())
  })

  it('#update', (done) => {
    user.nick_name = 'hh'
    p.User.update(user).then((data) => {
      data.n.should.be.exactly(1)
      done()
    })
  })
})
