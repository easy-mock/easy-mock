'use strict'

const app = require('../../app')
const spt = require('../support')

describe('test/controllers/user.test.js', () => {
  let request, user

  afterAll(() => spt.cleanCollections())
  beforeAll(async () => {
    user = await spt.createUser('test2', '123456')
    request = spt.createRequest(app.listen(), user.token)
  })

  describe('register', () => {
    test('参数验证', async () => {
      const res = await request('/api/u/register', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('注册用户', async () => {
      await request('/api/u/register', 'post')
        .send({ name: 'test1', password: '123456' })
        .expect(200, {
          code: 200,
          message: 'success',
          success: true,
          data: null
        })
    })

    test('重复注册', async () => {
      const res = await request('/api/u/register', 'post')
        .send({ name: 'test1', password: '123456' })

      expect(res.body.message).toBe('用户名已被使用')
    })
  })

  describe('login', () => {
    test('参数验证', async () => {
      const res = await request('/api/u/login', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('登录', async () => {
      const res = await request('/api/u/login', 'post')
        .send({ name: 'test2', password: '123456' })

      expect(res.body.data.name).toBe('test2')
    })

    test('用户名错误', async () => {
      const res = await request('/api/u/login', 'post')
        .send({ name: 'te2st', password: '123456' })

      expect(res.body.message).toBe('用户不存在')
    })

    test('密码错误', async () => {
      const res = await request('/api/u/login', 'post')
        .send({ name: 'test2', password: '1234567' })

      expect(res.body.message).toBe('用户名或密码错误')
    })
  })

  describe('update', () => {
    test('参数验证', async () => {
      const res = await request('/api/u/update', 'post')
        .send({ nick_name: 'u' })

      expect(res.body.message).toBe('params error')
    })

    test('信息更新', async () => {
      await request('/api/u/update', 'post')
        .send({
          nick_name: 'test2',
          head_img: 'http://example.com/l.png',
          password: '1234567'
        })

      const u = await spt.login('test2', '1234567')

      expect(u.nick_name).toBe('test2')
      expect(u.head_img).toBe('http://example.com/l.png')
    })
  })

  describe('list', () => {
    test('参数验证', async () => {
      const res = await request('/api/u')
        .query({ page_size: -1 })

      expect(res.body.message).toBe('params error')
    })

    test('分页查询', async () => {
      const res = await request('/api/u')

      expect(res.body.data).toHaveLength(1) // ['test1']
    })

    test('关键词查询', async () => {
      const res = await request('/api/u')
        .query({ keywords: 'te' })

      const data = res.body.data
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('test1')
    })
  })
})
