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
})
