'use strict'

require('should')

const support = require('../support')

describe('test/controllers/util.test.js', () => {
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
})
