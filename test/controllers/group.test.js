'use strict'

require('should')

const support = require('../support')
const projectProxy = require('../../proxy').Project

const _r = support.r

describe('test/controllers/group.test.js', () => {
  let token
  let token2
  let group

  before((done) => {
    support.createUser().then((data) => {
      token = data.token
      return support.createUser({
        name: 'vvvvv'
      })
    }).then((data) => {
      token2 = data.token
      done()
    })
  })

  after(() => support.cleanCollections())

  describe('#create', () => {
    it('无参', (done) => {
      _r('post', '/group/create', token).then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('创建', (done) => {
      _r('post', '/group/create', token, {
        name: '分组1'
      }).then((data) => {
        data.success.should.be.ok()
        done()
      })
    })

    it('重名', (done) => {
      _r('post', '/group/create', token, {
        name: '分组1'
      }).then((data) => {
        data.message.should.containEql('相同')
        done()
      })
    })
  })

  describe('#list', () => {
    it('获取列表', (done) => {
      _r('get', '/group', token).then((data) => {
        group = data.data[0]
        data.success.should.be.ok()
        data.data.should.have.length(1)
        data.data[0].name.should.eql('分组1')
        done()
      })
    })

    it('搜索', (done) => {
      _r('get', `/group?keywords=${encodeURIComponent('分组1')}`, token).then((data) => {
        data.success.should.be.ok()
        data.data.should.have.length(1)
        return _r('get', '/group?keywords=1', token)
      }).then((data) => {
        data.success.should.be.ok()
        data.data.should.be.empty()
        done()
      })
    })
  })

  describe('#update', () => {
    it('无参', (done) => {
      _r('post', '/group/update', token).then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('无权限', (done) => {
      _r('post', '/group/update', token2, {
        id: group._id,
        name: '分组2'
      }).then((data) => {
        data.message.should.be.containEql('无权限')
        done()
      })
    })

    it('更新', (done) => {
      _r('post', '/group/update', token, {
        id: group._id,
        name: '分组2'
      }).then((data) => {
        data.success.should.be.ok()
        done()
      })
    })

    it('重名', (done) => {
      _r('post', '/group/update', token, {
        id: group._id,
        name: '分组2'
      }).then((data) => {
        data.success.should.not.be.ok()
        data.message.should.containEql('相同')
        done()
      })
    })
  })

  describe('#join', () => {
    it('无参', (done) => {
      _r('post', '/group/join', token).then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('加入', (done) => {
      // 创建团队项目
      const createProject = support.cp(token)
      createProject({ group: group._id })
        .then(() => _r('post', '/group/join', token2, {
          id: group._id
        }))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })

  describe('#delete', () => {
    it('无参', (done) => {
      _r('post', '/group/delete', token).then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('退出团队', (done) => {
      _r('post', '/group/delete', token2, {
        id: group._id
      }).then((data) => {
        data.success.should.be.ok()
        done()
      })
    })

    it('存在项目，禁止删除', (done) => {
      _r('post', '/group/delete', token, { id: group._id })
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('删除团队下所有的项目')
          done()
        })
    })

    it('删除', (done) => {
      projectProxy
        .findOne({
          group: group._id
        })
        .then(project => projectProxy.delById(project.id))
        .then(() => _r('post', '/group/delete', token, {
          id: group._id
        }))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })
})
