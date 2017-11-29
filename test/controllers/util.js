'use strict'

require('should')

const path = require('path')
const support = require('../support')

describe('test/controllers/util.test.js', () => {
  let user

  before((done) => {
    support.createUser().then((data) => {
      user = data
      done()
    })
  })

  after(() => support.cleanCollections())

  describe('#proxy', () => {
    const url = encodeURIComponent('http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=1484223823846&pid=hp&video=1')

    it('无参', (done) => {
      support
        .r('get', '/proxy')
        .then((data) => {
          data.message.should.be.eql('params error')
          done()
        })
    })

    it('注册用户', (done) => {
      support.r('get', `/proxy?url=${url}`).then(done())
    })
  })

  describe('#upload', () => {
    it('空文件', (done) => {
      support.request
        .post('/api/upload')
        .set('Authorization', `Bearer ${user.token || ''}`)
        .set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundaryl8pytbOxkyNIdRgC')
        .expect(200, function (err, res) {
          if (!err) {
            res.body.success.should.not.be.ok()
            res.body.message.should.be.eql('无文件上传')
            done()
          }
        })
    })

    it('正常上传', (done) => {
      support.request
        .post('/api/upload')
        .set('Authorization', `Bearer ${user.token || ''}`)
        .attach('file', path.join(__dirname, '../support/swagger.json'))
        .expect(200, function (err, res) {
          if (!err) {
            res.body.success.should.be.ok()
            res.body.data.path.should.not.empty()
            done()
          }
        })
    })

    it('错误的文件类型', (done) => {
      support.request
        .post('/api/upload')
        .set('Authorization', `Bearer ${user.token || ''}`)
        .attach('file', path.join(__dirname, '../support/index.js'))
        .expect(200, function (err, res) {
          if (!err) {
            res.body.success.should.not.be.ok()
            done()
          }
        })
    })
  })
})
