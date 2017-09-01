'use strict'

require('should')

const support = require('../support')

let create
let getProject

describe('test/controllers/project.test.js', () => {
  let user
  let user2

  before((done) => {
    support.createUser().then((data) => {
      user = data
      create = support.cp(user.token)
      getProject = support.gp(user.token)
      return support.createUser({
        name: 'qqqq3'
      })
    }).then((data) => {
      user2 = data
      done()
    })
  })

  after(() => support.cleanCollections())

  describe('#create', () => {
    it('无参', (done) => {
      support.r('post', '/project/create', user.token).then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('创建项目', (done) => {
      create().then((data) => {
        data.success.should.be.ok()
        return create()
      }).then((data) => {
        data.success.should.not.be.ok()
        done()
      })
    })

    it('不允许重复创建', (done) => {
      create().then((data) => {
        data.success.should.be.not.ok()
        data.message.should.containEql('创建失败')
        done()
      })
    })

    it('禁止邀请自己', (done) => {
      create({
        name: 'demo',
        url: '/demo',
        members: [user._id]
      }).then((data) => {
        data.success.should.be.not.ok()
        data.message.should.containEql('不能邀请自己哦')
        done()
      })
    })

    it('邀请别人', (done) => {
      create({
        name: 'demo',
        url: '/demo',
        members: [user2._id]
      }).then((data) => {
        data.success.should.be.ok()
        done()
      })
    })
  })

  describe('#list', () => {
    it('参数异常', (done) => {
      support.r('get', '/project?page_index=index', user.token).then((data) => {
        data.message.should.be.eql('params error')
        done()
      })
    })

    it('获取项目', (done) => {
      getProject().then((data) => {
        data.success.should.be.ok()
        data.data.should.have.length(3)
        data.data[0].should.have.property('members')
        done()
      })
    })
    it('获取工作台中的项目', (done) => {
      support
        .r('get', '/project?type=workbench', user.token)
        .then((data) => {
          data.success.should.be.ok()
          data.data.should.have.length(0)
          done()
        })
    })
    it('搜索', (done) => {
      support
        .r('get', '/project?keywords=example', user.token)
        .then((data) => {
          data.success.should.be.ok()
          data.data.should.have.length(1)
          done()
        })
    })
  })

  describe('#update', () => {
    it('更新项目', (done) => {
      getProject()
        .then(data => support.r('post', '/project/update', user.token, {
          id: data.data[0]._id,
          url: '/ttt'
        }))
        .then(() => getProject())
        .then((data) => {
          data.data[0].url.should.eql('/ttt')
          done()
        })
    })

    it('无权限', (done) => {
      getProject()
        .then(data => support.r('post', '/project/update', user2.token, {
          id: data.data[2]._id,
          url: '/example'
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('无权限')
          done()
        })
    })

    it('禁止邀请自己', (done) => {
      getProject()
        .then(data => support.r('post', '/project/update', user.token, {
          id: data.data[0]._id,
          members: [user._id]
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('用户未命中')
          done()
        })
    })

    it('禁止更新重复项目', (done) => {
      getProject()
        .then(data => support.r('post', '/project/update', user.token, {
          id: data.data[0]._id,
          url: '/example'
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('相同')
          done()
        })
    })
  })

  describe('#updateSwagger', () => {
    it('更新失败', (done) => {
      getProject()
        .then(data =>
          support.r('post', '/project/update_swagger', user2.token, {
            id: data.data[2]._id
          })
        )
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('无权限')
          done()
        })
    })

    it('更新', (done) => {
      getProject()
        .then(data =>
          support.r('post', '/project/update_swagger', user.token, {
            id: data.data[0]._id
          })
        )
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })

  describe('#updateWorkbench', () => {
    it('更新失败', (done) => {
      getProject()
        .then(data =>
          support.r('post', '/project/update_workbench', user2.token, {
            id: data.data[2]._id,
            status: false
          })
        )
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('无权限')
          done()
        })
    })

    it('更新', (done) => {
      getProject()
        .then(data =>
          support.r('post', '/project/update_workbench', user.token, {
            id: data.data[2].extend._id,
            status: true
          })
        )
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })

  describe('#delete', () => {
    it('无权限', (done) => {
      getProject()
        .then(data => support.r('post', '/project/delete', user2.token, {
          id: data.data[2]._id
        }))
        .then((data) => {
          data.success.should.not.be.ok()
          data.message.should.containEql('无权限')
          done()
        })
    })

    it('删除', (done) => {
      getProject()
        .then(data => support.r('post', '/project/delete', user.token, {
          id: data.data[0]._id
        }))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })

  describe('#copy', () => {
    it('复制', (done) => {
      getProject()
        .then(data => support.r('post', '/project/copy', user.token, {
          id: data.data[1]._id
        }))
        .then((data) => {
          data.success.should.be.ok()
          done()
        })
    })
  })
})
