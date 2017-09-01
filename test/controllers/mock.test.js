'use strict'

require('should')

const support = require('../support')

let createPro
let getProject

describe('test/controllers/mock.test.js', () => {
  let user
  let user2
  let user3
  let project
  let projects

  before((done) => {
    support
      .createUser()
      .then((data) => {
        user = data
        createPro = support.cp(user.token)
        getProject = support.gp(user.token)
        return support.createUser({
          name: 'qqqq'
        })
      })
      .then(data => (user2 = data))
      .then(() => support.createUser({
        name: 'vvvvv'
      }))
      .then(data => (user3 = data))
      .then(() => createPro({
        members: [user2._id]
      }))
      .then(() => getProject())
      .then((data) => {
        // demo 项目
        project = data.data[1]
        projects = data.data
        done()
      })
  })

  after(() => support.cleanCollections())

  function create (body, token) {
    const newBody = Object.assign({}, {
      project_id: projects[0]._id,
      url: '/u',
      method: 'get',
      mode: '{"success": true}',
      description: '测试mock'
    }, body)

    return support
      .r('post', '/mock/create', token || user.token, newBody)
      .then((data) => {
        data.mockUrl = `/${user.name}${project.url}${newBody.url}`
        return data
      })
  }

  function getMock (projectId, kw) {
    const id = projectId || project._id
    kw = kw || ''
    return support
      .r('get', `/mock?project_id=${id}&${kw}`, user.token)
      .then(data => data.data)
  }

  describe('#create', () => {
    it('创建mock', (done) => {
      create().then((data) => {
        data.success.should.be.ok()
        return create()
      }).then((data) => {
        data.success.should.not.be.ok()
        data.message.should.containEql('相同')
        done()
      })
    })

    it('无权限', (done) => {
      create({}, user3.token).then((data) => {
        data.success.should.not.be.ok()
        data.message.should.containEql('无权限')
        done()
      })
    })
  })

  describe('#list', () => {
    it('获取列表', (done) => {
      getMock().then((data) => {
        data.mocks.should.have.length(6)
        data.project.members.should.have.length(0)
        done()
      })
    })
    it('搜索', (done) => {
      getMock(null, 'keywords=/proxy').then((data) => {
        data.mocks.should.have.length(1)
        done()
      })
    })
  })

  describe('#byProjects', () => {
    it('获取列表', (done) => {
      const ids = [projects[0]._id, projects[1]._id].join(',')
      support.r(
        'get',
        `/mock/by_projects?project_ids=${ids}`
      ).then((data) => {
        data.success.should.be.ok()
        data.data.should.have.size(2)
        done()
      })
    })
  })

  describe('#exportMock', () => {
    it('导出 Mock', (done) => {
      getMock()
        .then((data) => {
          const mocks = data.mocks
          return support.r('post', '/mock/export', user.token, {
            ids: [mocks[0]._id]
          })
        })
        .then(done())
    })

    it('Mock 不存在', (done) => {
      getMock()
        .then(() => support.r('post', '/mock/export', user.token, {
          ids: ['5873600ce94ce07e02cdac29']
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('不存在')
          done()
        })
    })
  })

  describe('#getMock', () => {
    it('404', (done) => {
      support
        .m('get', `/${user.name}${project.url}`)
        .catch(() => done())
    })

    it('普通类型 Mock', (done) => {
      support
        .m('get', `/${user.name}${project.url}/mock`)
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })

    it('代理类型 Mock', (done) => {
      support
        .m('get', `/${user.name}${project.url}/proxy`)
        .then(done())
    })
  })

  describe('#update', () => {
    it('Mock 不存在', (done) => {
      getMock()
        .then(() => support.r('post', '/mock/update', user.token, {
          id: '5873600ce94ce07e02cdac29',
          url: '/change'
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('不存在')
          done()
        })
    })

    it('无权限', (done) => {
      getMock()
        .then(data => support.r('post', '/mock/update', user2.token, {
          id: data.mocks[0]._id,
          url: '/change'
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('无权限')
          done()
        })
    })

    it('重复', (done) => {
      getMock()
        .then((data) => {
          const mocks = data.mocks
          const mock = mocks[0]
          const id = mock.url === '/proxy' ? mocks[1]._id : mock._id
          return support.r('post', '/mock/update', user.token, {
            id,
            url: '/proxy'
          })
        })
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('相同')
          done()
        })
    })

    it('更新', (done) => {
      getMock()
        .then(data => support.r('post', '/mock/update', user.token, {
          id: data.mocks[0]._id,
          url: '/proxy2'
        }))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })

  describe('#delete', () => {
    it('Mock 不存在', (done) => {
      getMock()
        .then(data => support.r('post', '/mock/delete', user2.token, {
          ids: [data.mocks[0]._id, '5873600ce94ce07e02cdac29']
        })).then((data) => {
          data.success.should.not.be.ok()
          done()
        })
    })

    it('删除 Mock', (done) => {
      getMock()
        .then(data => support.r('post', '/mock/delete', user.token, {
          ids: [data.mocks[0]._id, data.mocks[1]._id]
        })).then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })
})
