'use strict'

const http = require('http')

const app = require('../../app')
const spt = require('../support')
const swaggerDocs = require('../specs/swagger')

describe('test/controllers/project.test.js', () => {
  let docsServer, request, user, soucheUser

  afterAll(() => {
    docsServer.close()
    spt.cleanCollections()
  })

  beforeAll(async () => {
    docsServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(swaggerDocs))
    }).listen(7400)
    user = await spt.createUser()
    soucheUser = await spt.createUser('souche', '123456')
    request = spt.createRequest(app.listen(), user.token)
  })

  describe('create', () => {
    test('参数验证', async () => {
      const res = await request('/api/project/create', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('项目成员不能包含自己', async () => {
      const res = await request('/api/project/create', 'post')
        .send({
          name: 'example',
          url: '/example',
          members: [user._id]
        })

      expect(res.body.message).toBe('项目成员不能包含自己')
    })

    test('无权限操作', async () => {
      const res = await request('/api/project/create', 'post')
        .send({
          name: 'example',
          url: '/example',
          group: '111111111111111111111111'
        })

      expect(res.body.message).toBe('无权限操作')
    })

    test('项目已存在', async () => {
      const res = await request('/api/project/create', 'post')
        .send({
          name: '演示项目',
          url: '/example',
          description: 'example'
        })

      expect(res.body.message).toBe('项目 演示项目 已存在')
    })

    test('请检查 URL 是否已经存在', async () => {
      const res = await request('/api/project/create', 'post')
        .send({
          name: '演示项目2',
          url: '/example',
          description: 'example'
        })

      expect(res.body.message).toBe('请检查 URL 是否已经存在')
    })

    test('创建项目', async () => {
      const res = await request('/api/project/create', 'post')
        .send({
          name: 'demo',
          url: '/demo',
          description: 'demo',
          members: [soucheUser._id],
          swagger_url: 'http://localhost:7400'
        })

      expect(res.body.success).toBe(true)
    })
  })

  describe('copy', () => {
    test('参数验证', async () => {
      const res = await request('/api/project/copy', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('项目不存在', async () => {
      const res = await request('/api/project/copy', 'post')
        .send({ id: '111111111111111111111111' })

      expect(res.body.message).toBe('项目不存在')
    })

    test('复制项目', async () => {
      let res = await request('/api/project')

      res = await request('/api/project/copy', 'post')
        .send({ id: res.body.data[1]._id })
      res = await request('/api/project')

      const data = res.body.data

      expect(data).toHaveLength(3)
      expect(data[0].url).toBe('/example_copy')
      expect(data[0].name).toBe('演示项目_copy')
    })

    test('项目已存在', async () => {
      let res = await request('/api/project')
      res = await request('/api/project/copy', 'post')
        .send({ id: res.body.data[2]._id })

      expect(res.body.message).toBe('项目 演示项目_copy 已存在')
    })

    test('URL 已存在', async () => {
      const projects = await request('/api/project').then(res => res.body.data)
      await request('/api/project/update', 'post')
        .send({
          id: projects[0]._id,
          name: 'copy_演示项目',
          url: projects[0].url
        })
      const res = await request('/api/project/copy', 'post')
        .send({ id: projects[2]._id })

      await request('/api/project/update', 'post')
        .send({
          id: projects[0]._id,
          name: '演示项目_copy',
          url: projects[0].url
        })

      expect(res.body.message).toBe('请检查 URL 是否已经存在')
    })

    test('该项目无接口可复制', async () => {
      let res = await request('/api/project/create', 'post')
        .send({
          name: 'empty',
          url: '/empty',
          description: 'empty'
        })

      const projects = await request('/api/project').then(res => res.body.data)

      res = await request('/api/project/copy', 'post')
        .send({ id: projects[0]._id })
      await request('/api/project/delete', 'post').send({ id: projects[0]._id })
      expect(res.body.message).toBe('该项目无接口可复制')
    })
  })

  describe('updateWorkbench', () => {
    test('参数验证', async () => {
      const res = await request('/api/project/update_workbench', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('无权限操作', async () => {
      const res = await request('/api/project/update_workbench', 'post')
        .send({
          id: '111111111111111111111111',
          status: true
        })

      expect(res.body.message).toBe('无权限操作')
    })

    test('加入工作台', async () => {
      let res = await request('/api/project')

      res = await request('/api/project/update_workbench', 'post')
        .send({
          id: res.body.data[0].extend._id,
          status: true
        })

      expect(res.body.success).toBe(true)
    })
  })

  describe('list', () => {
    test('参数验证', async () => {
      const res = await request('/api/project').query({ type: 'demo' })

      expect(res.body.message).toBe('params error')
    })

    test('我创建的', async () => {
      const res = await request('/api/project').query({ filter_by_author: 1 })
      expect(res.body.data).toHaveLength(3)
    })

    test('我加入的', async () => {
      const res = await request('/api/project', 'get', soucheUser.token)
        .query({ filter_by_author: 2 })

      const data = res.body.data
      expect(data).toHaveLength(1)
      expect(data[0].url).toBe('/demo')
      expect(data[0].name).toBe('demo')
    })

    test('搜索', async () => {
      const res = await request('/api/project')
        .query({ keywords: 'example' })

      const data = res.body.data
      expect(data).toHaveLength(2)
      expect(data[0].url).toBe('/example_copy')
      expect(data[0].name).toBe('演示项目_copy')
      expect(data[1].url).toBe('/example')
      expect(data[1].name).toBe('演示项目')
    })

    test('工作台', async () => {
      const res = await request('/api/project')
        .query({ type: 'workbench' })

      const data = res.body.data

      expect(data).toHaveLength(1)
      expect(data[0].url).toBe('/example_copy')
      expect(data[0].name).toBe('演示项目_copy')
    })

    test('团队项目', async () => {
      await request('/api/group/create', 'post')
        .send({ name: 'souche' })

      let res = await request('/api/group')
      await request('/api/project/create', 'post')
        .send({
          name: 'group',
          url: '/group',
          group: res.body.data[0]._id
        })

      res = await request('/api/project')
        .query({ group: res.body.data[0]._id })

      const data = res.body.data

      expect(data).toHaveLength(1)
      expect(data[0].url).toBe('/group')
      expect(data[0].name).toBe('group')
    })

    test('获取未加入团队的项目', async () => {
      let res = await request('/api/group')
      res = await request('/api/project', 'get', soucheUser.token)
        .query({ group: res.body.data[0]._id })

      const data = res.body.data

      expect(data).toHaveLength(0)
    })
  })

  describe('update', () => {
    test('参数验证', async () => {
      const res = await request('/api/project/update', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('无权限操作', async () => {
      let res = await request('/api/project', 'get', soucheUser.token)
      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[1]._id,
          name: 'demo',
          url: '/demo'
        })

      expect(res.body.message).toBe('无权限操作')
    })

    test('项目成员不能包含创建者', async () => {
      let res = await request('/api/project', 'get')
      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[0]._id,
          name: 'demo',
          url: '/demo',
          members: [res.body.data[0].user._id]
        })

      expect(res.body.message).toBe('项目成员不能包含创建者')
    })

    test('邀请成员', async () => {
      let res = await request('/api/project', 'get')

      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[0]._id,
          name: 'copy',
          url: '/copy',
          members: [soucheUser._id]
        })

      expect(res.body.success).toBe(true)
    })

    test('移除成员', async () => {
      let res = await request('/api/project', 'get')

      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[0]._id,
          name: 'copy',
          url: '/copy',
          members: []
        })

      expect(res.body.success).toBe(true)
    })

    test('请检查 URL 是否已经存在', async () => {
      let res = await request('/api/project', 'get')

      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[0]._id,
          name: 'example',
          url: '/example'
        })

      expect(res.body.message).toBe('请检查 URL 是否已经存在')
    })

    test('项目已存在', async () => {
      let res = await request('/api/project', 'get')

      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[0]._id,
          name: '演示项目',
          url: '/example'
        })

      expect(res.body.message).toBe('项目 演示项目 已存在')
    })

    test('团队项目', async () => {
      let res = await request('/api/group')
      res = await request('/api/project')
        .query({ group: res.body.data[0]._id })
      res = await request('/api/project/update', 'post')
        .send({
          id: res.body.data[0]._id,
          name: '演示项目',
          url: '/example'
        })

      expect(res.body.success).toBe(true)
    })

    test('非团队成员无法更新项目', async () => {
      let res = await request('/api/group')
      res = await request('/api/project')
        .query({ group: res.body.data[0]._id })
      res = await request('/api/project/update', 'post', soucheUser.token)
        .send({
          id: res.body.data[0]._id,
          name: '演示项目',
          url: '/example'
        })
      expect(res.body.message).toBe('无权限操作')
    })
  })

  describe('syncSwagger', () => {
    test('参数验证', async () => {
      const res = await request('/api/project/sync/swagger', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('无权限操作', async () => {
      let res = await request('/api/project', 'get', soucheUser.token)
      res = await request('/api/project/sync/swagger', 'post')
        .send({ id: res.body.data[1]._id })

      expect(res.body.message).toBe('无权限操作')
    })

    test('请先设置 Swagger 文档地址', async () => {
      let res = await request('/api/project', 'get')
      res = await request('/api/project/sync/swagger', 'post')
        .send({ id: res.body.data[0]._id })

      expect(res.body.message).toBe('请先设置 Swagger 文档地址')
    })

    test('同步 Swagger 文档', async () => {
      let res = await request('/api/project', 'get')
      res = await request('/api/project/sync/swagger', 'post')
        .send({ id: res.body.data[1]._id })

      expect(res.body.success).toBe(true)
    })

    test('同步失败', async () => {
      let res = await request('/api/project', 'get')
      let apiRes = await request('/api/mock').query({ project_id: res.body.data[1]._id })
      let api = apiRes.body.data.mocks.filter(api => api.url === '/v2/user/logout')[0]
      await request('/api/mock/update', 'post').send({
        id: api._id,
        url: '/v2/user/logout',
        mode: '{a:1}',
        method: 'get',
        description: '同步失败'
      })
      res = await request('/api/project/sync/swagger', 'post').send({ id: res.body.data[1]._id })
      expect(res.body.message).toBe('/v2/user/logout 接口中存在语法错误，请检查是否为标准 JSON 格式（例：被忽略的双引号）。')
    })
  })

  describe('delete', () => {
    test('参数验证', async () => {
      const res = await request('/api/project/delete', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('无权限操作', async () => {
      let res = await request('/api/project', 'get', soucheUser.token)
      res = await request('/api/project/delete', 'post')
        .send({ id: res.body.data[1]._id })

      expect(res.body.message).toBe('无权限操作')
    })

    test('非团队创建者无法删除项目', async () => {
      let res = await request('/api/group')
      res = await request('/api/project')
        .query({ group: res.body.data[0]._id })
      res = await request('/api/project/delete', 'post', soucheUser.token)
        .send({ id: res.body.data[0]._id })

      expect(res.body.message).toBe('无权限操作')
    })

    test('删除项目', async () => {
      let res = await request('/api/project')
      res = await request('/api/project/delete', 'post')
        .send({ id: res.body.data[0]._id })

      expect(res.body.success).toBe(true)
    })
  })
})
