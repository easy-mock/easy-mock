'use strict'

const app = require('../../app')
const spt = require('../support')

jest.mock('axios', () => {
  return jest.fn()
    .mockImplementationOnce(() => Promise.resolve({
      data: {
        sucess: true,
        data: {
          proxy: true
        }
      }
    }))
    .mockImplementationOnce(() => Promise.reject(new Error('time out')))
    .mockImplementationOnce(() => Promise.reject(new Error()))
})

describe('test/controllers/mock.test.js', () => {
  let request, user, soucheUser, project

  afterAll(() => spt.cleanCollections())

  beforeAll(async () => {
    user = await spt.createUser()
    soucheUser = await spt.createUser('souche', '123456')
    request = spt.createRequest(app.listen(), user.token)
    project = await request('/api/project').then(res => res.body.data[0])
  })

  describe('create', () => {
    test('参数验证', async () => {
      const res = await request('/api/mock/create', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('无权限操作', async () => {
      const res = await request('/api/mock/create', 'post', soucheUser.token)
        .send({
          project_id: project._id,
          url: '/demo',
          mode: '{}',
          method: 'get',
          description: 'demo'
        })

      expect(res.body.message).toBe('无权限操作')
    })

    test('请检查接口是否已经存在', async () => {
      const res = await request('/api/mock/create', 'post')
        .send({
          project_id: project._id,
          url: '/mock',
          mode: '{}',
          method: 'get',
          description: 'mock'
        })

      expect(res.body.message).toBe('请检查接口是否已经存在')
    })

    test('创建个人项目接口', async () => {
      const res = await request('/api/mock/create', 'post')
        .send({
          project_id: project._id,
          url: '/new',
          mode: '{}',
          method: 'get',
          description: 'new api'
        })

      expect(res.body.success).toBe(true)
    })

    test('创建团队项目接口', async () => {
      await request('/api/group/create', 'post')
        .send({ name: 'souche' })
      const group = await request('/api/group').then(res => res.body.data[0])
      await request('/api/project/create', 'post')
        .send({
          group: group._id,
          name: 'demo',
          url: '/demo'
        })
      const newProject = await request('/api/project')
        .query({ group: group._id })
        .then(res => res.body.data[0])

      const res = await request('/api/mock/create', 'post')
        .send({
          project_id: newProject._id,
          url: '/new',
          mode: '{}',
          method: 'get',
          description: 'new api'
        })

      expect(res.body.success).toBe(true)
    })

    test('非团队成员无法创建团队项目接口', async () => {
      const group = await request('/api/group').then(res => res.body.data[0])
      const newProject = await request('/api/project')
        .query({ group: group._id })
        .then(res => res.body.data[0])
      const res = await request('/api/mock/create', 'post', soucheUser.token)
        .send({
          project_id: newProject._id,
          url: '/new',
          mode: '{}',
          method: 'get',
          description: 'new api'
        })
      expect(res.body.message).toBe('无权限操作')
    })
  })

  describe('update', () => {
    test('参数验证', async () => {
      const res = await request('/api/mock/update', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('接口不存在', async () => {
      const res = await request('/api/mock/update', 'post')
        .send({
          id: '111111111111111111111111',
          url: '/demo',
          mode: '{}',
          method: 'get',
          description: 'demo'
        })

      expect(res.body.message).toBe('接口不存在')
    })

    test('无权限操作', async () => {
      let res = await request('/api/mock').query({ project_id: project._id })
      res = await request('/api/mock/update', 'post', soucheUser.token)
        .send({
          id: res.body.data.mocks[0]._id,
          url: '/mock',
          mode: '{}',
          method: 'get',
          description: 'mock'
        })

      expect(res.body.message).toBe('无权限操作')
    })

    test('接口已经存在', async () => {
      let res = await request('/api/mock').query({ project_id: project._id })
      res = await request('/api/mock/update', 'post')
        .send({
          id: res.body.data.mocks[0]._id,
          url: '/proxy',
          mode: '{}',
          method: 'get',
          description: 'mock'
        })

      expect(res.body.message).toBe('接口已经存在')
    })

    test('更新接口', async () => {
      let res = await request('/api/mock').query({ project_id: project._id })
      res = await request('/api/mock/update', 'post')
        .send({
          id: res.body.data.mocks[0]._id,
          url: '/mock2',
          mode: '{}',
          method: 'get',
          description: 'mock'
        })

      expect(res.body.success).toBe(true)
    })
  })

  describe('list', () => {
    test('参数验证', async () => {
      const res = await request('/api/mock')

      expect(res.body.message).toBe('params error')
    })

    test('搜索', async () => {
      const res = await request('/api/mock')
        .query({ project_id: project._id, keywords: '/proxy' })

      const data = res.body.data
      expect(data.project.name).toBe('演示项目')
      expect(data.project.url).toBe('/example')
      expect(data.mocks).toHaveLength(1)
    })

    test('获取接口列表', async () => {
      let res = await request('/api/project/create', 'post')
        .send({
          name: 'souche',
          url: '/souche',
          members: [soucheUser._id]
        })
      const newProject = await request('/api/project')
        .then(res => res.body.data[0])

      await request('/api/mock/create', 'post')
        .send({
          project_id: newProject._id,
          url: '/mock',
          mode: '{}',
          description: 'mock',
          method: 'get'
        })
      res = await request('/api/mock').query({ project_id: newProject._id })

      const data = res.body.data

      expect(data.project.name).toBe('souche')
      expect(data.project.url).toBe('/souche')
      expect(data.mocks).toHaveLength(1)
      expect(data.mocks[0].url).toBe('/mock')
    })

    test('项目不存在', async () => {
      const res = await request('/api/mock').query({ project_id: '111111111111111111111111' })

      const data = res.body.data
      expect(data.project).toEqual({})
      expect(data.mocks).toHaveLength(0)
    })
  })

  describe('getAPIByProjectIds', () => {
    test('参数验证', async () => {
      const res = await request('/api/mock/by_projects')

      expect(res.body.message).toBe('params error')
    })

    test('获取接口列表', async () => {
      const newProject = await request('/api/project')
        .then(res => res.body.data[0])

      const res = await request('/api/mock/by_projects')
        .query({ project_ids: newProject._id })

      const data = res.body.data
      expect(data[newProject._id].project.name).toBe('souche')
    })
  })

  describe('exportAPI', () => {
    test('参数验证', async () => {
      let res = await request('/api/mock/export', 'post')

      expect(res.body.message).toBe('参数不能为空')
      res = await request('/api/mock/export', 'post')
        .send({ ids: '1' })

      expect(res.body.message).toBe('params error')
    })

    test('没有可导出的接口', async () => {
      const res = await request('/api/mock/export', 'post')
        .send({ project_id: '111111111111111111111111' })

      expect(res.body.message).toBe('没有可导出的接口')
    })

    test('导出项目', (done) => {
      const req = request('/api/mock/export', 'post')
        .send({ project_id: project._id })
        .buffer(false)

      req.end((err, res) => {
        if (err) return done(err)
        let trackEndEvent = 0
        let trackCloseEvent = 0

        res.on('end', () => {
          trackEndEvent++
          expect(trackEndEvent).toBe(1)
          expect(trackCloseEvent).toBe(0)
          done()
        })

        res.on('close', () => {
          trackCloseEvent++
        })
      })
    })

    test('导出选定接口', async (done) => {
      const apis = await request('/api/mock')
        .query({ project_id: project._id })
        .then(res => res.body.data.mocks)

      const req = request('/api/mock/export', 'post')
        .send({ ids: apis.map(api => api._id) })
        .buffer(false)

      req.end((err, res) => {
        if (err) return done(err)
        let trackEndEvent = 0
        let trackCloseEvent = 0

        res.on('end', () => {
          trackEndEvent++
          expect(trackEndEvent).toBe(1)
          expect(trackCloseEvent).toBe(0)
          done()
        })

        res.on('close', () => {
          trackCloseEvent++
        })
      })
    })
  })

  describe('getMockAPI', () => {
    function getMockURL (url, proj = project) {
      return '/mock/' + proj._id + proj.url + url
    }

    test('404', async () => {
      await request('/mock').expect(404)
      await request('/mock/api/user').expect(404)
      await request('/mock/111111111111111111111111/').expect(404)
      await request('/mock/111111111111111111111111/user').expect(404)
      await request(`/mock/${project._id}/ttest`).expect(404)
    })

    test('接口请求频率太快，已被限制访问', async () => {
      const res = await request('/mock/222222222233333333331212/user')
      expect(res.body.message).toBe('接口请求频率太快，已被限制访问')
    })

    test('/', async () => {
      const res = await request(getMockURL('/'))
        .expect(400)
      expect(res.headers.power).toBe('easy-mock')
      expect(res.body.success).toBe(false)
    })

    test('/proxy', async () => {
      let res = await request(getMockURL('/proxy'))
      expect(res.body).toEqual({
        sucess: true,
        data: {
          proxy: true
        }
      })

      res = await request(getMockURL('/proxy'))
      expect(res.body.message).toBe('time out')

      res = await request(getMockURL('/proxy'))
      expect(res.body.message).toBe('接口请求失败')
    })

    test('/query', async () => {
      const res = await request(getMockURL('/query?name=hh'))
      expect(res.body.data.name).toEqual('hh')
    })

    test('jsonp', async () => {
      const res = await request(getMockURL('/mock'))
        .query({ jsonp_param_name: 'callback' })

      const callback = json => json // eslint-disable-line
      const data = eval(res.text) // eslint-disable-line
      expect(data.success).toBe(true)
    })

    test('/mock', async () => {
      await request('/api/project/update', 'post')
        .send({
          id: project._id,
          name: project.name,
          url: '/'
        })
      const res = await request('/mock/' + project._id + '/mock')
      expect(res.body.success).toBe(true)
    })
  })

  describe('delete', () => {
    test('参数验证', async () => {
      const res = await request('/api/mock/delete', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('无权限操作', async () => {
      const apis = await request('/api/mock')
        .query({ project_id: project._id })
        .then(res => res.body.data.mocks)

      let res = await request('/api/mock/delete', 'post')
        .send({ project_id: '111111111111111111111111', ids: ['111111111111111111111111'] })

      expect(res.body.message).toBe('项目不存在')

      res = await request('/api/mock/delete', 'post', soucheUser.token)
        .send({ project_id: project._id, ids: apis.map(api => api._id) })

      expect(res.body.message).toBe('无权限操作')
    })

    test('删除接口', async () => {
      const apis = await request('/api/mock')
        .query({ project_id: project._id })
        .then(res => res.body.data.mocks)

      const res = await request('/api/mock/delete', 'post')
        .send({ project_id: project._id, ids: apis.map(api => api._id) })

      expect(res.body.success).toBe(true)
    })
  })
})
