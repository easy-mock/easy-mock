'use strict'

require('should')

const support = require('../support')

describe('test/controllers/user.test.js', () => {
  after(() => support.cleanCollections())

  function register () {
    return support.r('post', '/u/register', '', {
      name: 'hhhh',
      nick_name: 'cc',
      password: '123456',
      head_img: 'example.com/head.jpg'
    })
  }

  function login () {
    return support.r('post', '/u/login', '', {
      name: 'hhhh',
      password: '123456'
    })
  }

  describe('#register', () => {
    it('无参', (done) => {
      support.r('post', '/u/register').then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('注册用户', (done) => {
      register().then((data) => {
        data.success.should.be.ok()
        return register()
      }).then((data) => {
        data.success.should.not.be.ok()
        done()
      })
    })
  })

  describe('#login', () => {
    it('无参', (done) => {
      support.r('post', '/u/login').then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('用户不存在', (done) => {
      support.r('post', '/u/login', '', {
        name: 'hhhh2',
        password: '123456'
      }).then((data) => {
        data.message.should.be.eql('用户不存在')
        done()
      })
    })

    it('密码错误', (done) => {
      support.r('post', '/u/login', '', {
        name: 'hhhh',
        password: '1234567'
      }).then((data) => {
        data.message.should.be.eql('请检查密码是否正确')
        done()
      })
    })

    it('登录', (done) => {
      login().then((data) => {
        data.success.should.be.ok()
        data.data.should.not.have.enumerable('password')
        done()
      })
    })
  })

  describe('#update', () => {
    it('参数异常', (done) => {
      login()
        .then(data => support.r('post', '/u/update', data.data.token, {
          password: '111'
        }))
        .then((data) => {
          data.message.should.be.eql('params error')
          done()
        })
    })

    it('修改资料', (done) => {
      login().then(data => support.r('post', '/u/update', data.data.token, {
        nick_name: 'qqqq'
      })).then((data) => {
        data.success.should.be.ok()
        return login()
      }).then((data) => {
        data.data.nick_name.should.eql('qqqq')
        done()
      })
    })
  })

  describe('#list', () => {
    it('参数异常', (done) => {
      login()
        .then(data => support.r('get', '/u?page_index=index', data.data.token))
        .then((data) => {
          data.message.should.be.eql('params error')
          done()
        })
    })

    it('搜索', (done) => {
      login()
        .then(data => support.r('get', '/u?keywords=hhhh', data.data.token))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })

    it('查询用户列表', (done) => {
      login()
        .then(data => support.r('get', '/u', data.data.token))
        .then((data) => {
          data.success.should.be.ok()
          data.data.should.have.length(0)
          done()
        })
    })
  })

  describe('#logout', () => {
    it('登出', (done) => {
      login()
        .then(data => support.r('post', '/u/logout', data.data.token))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })
})
