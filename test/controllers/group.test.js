'use strict'

const app = require('../../app')
const spt = require('../support')

describe('test/controllers/group.test.js', () => {
  let request, user, soucheUser

  afterAll(() => spt.cleanCollections())
  beforeAll(async () => {
    user = await spt.createUser()
    request = spt.createRequest(app.listen(), user.token)
    soucheUser = await spt.createUser('souche', '123456')
  })

  describe('create', () => {
    test('参数验证', async () => {
      const res = await request('/api/group/create', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('创建团队', async () => {
      const res = await request('/api/group/create', 'post')
        .send({ name: 'dasouche' })

      expect(res.body.success).toBe(true)
    })

    test('重复创建', async () => {
      const res = await request('/api/group/create', 'post')
        .send({ name: 'dasouche' })

      expect(res.body.message).toBe('团队 dasouche 已存在')
    })
  })

  describe('join', () => {
    test('参数验证', async () => {
      const res = await request('/api/group/join', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('加入团队', async () => {
      await request('/api/group/create', 'post', soucheUser.token).send({ name: 'souche' })

      const groupId = await request('/api/group')
        .query({ keywords: 'souche' })
        .then(res => res.body.data[0]._id)

      await request('/api/project/create', 'post', soucheUser.token)
        .send({
          group: groupId,
          name: 'user',
          url: '/user'
        })

      let res = await request('/api/group/join', 'post').send({ id: groupId })
      expect(res.body.success).toBe(true)

      res = await request('/api/project').query({ group: groupId })
      res = await request('/api/project/update_workbench', 'post')
        .send({ id: res.body.data[0].extend._id, status: true })

      expect(res.body.success).toBe(true)
    })
  })

  describe('list', () => {
    test('我加入的团队', async () => {
      const res = await request('/api/group')

      const data = res.body.data
      expect(data).toHaveLength(2)
      expect(data[0].name).toBe('dasouche')
      expect(data[1].name).toBe('souche')
    })

    test('搜索团队', async () => {
      let res = await request('/api/group').query({ keywords: 'dasouched' })

      expect(res.body.data).toHaveLength(0)

      res = await request('/api/group').query({ keywords: 'dasouche' })

      expect(res.body.data).toHaveLength(1)
    })
  })

  describe('update', () => {
    test('参数验证', async () => {
      const res = await request('/api/group/update', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('更新我加入团队的信息', async () => {
      let res = await request('/api/group')

      res = await request('/api/group/update', 'post')
        .send({ id: res.body.data[1]._id, name: 'souche2' })

      expect(res.body.message).toBe('非团队创建者无法更新团队信息')
    })

    test('团队重名', async () => {
      let res = await request('/api/group')

      res = await request('/api/group/update', 'post')
        .send({ id: res.body.data[0]._id, name: 'souche' })

      expect(res.body.message).toBe('团队 souche 已存在')
    })

    test('更新我创建团队的信息', async () => {
      let res = await request('/api/group')

      res = await request('/api/group/update', 'post')
        .send({ id: res.body.data[0]._id, name: 'souche2' })

      expect(res.body.success).toBe(true)
    })
  })

  describe('delete', () => {
    test('参数验证', async () => {
      const res = await request('/api/group/delete', 'post')

      expect(res.body.message).toBe('params error')
    })

    test('离开团队', async () => {
      let res = await request('/api/group')

      res = await request('/api/group/delete', 'post')
        .send({ id: res.body.data[1]._id })

      expect(res.body.success).toBe(true)
    })

    test('解散团队', async () => {
      let res = await request('/api/group')
      res = await request('/api/group/delete', 'post')
        .send({ id: res.body.data[0]._id })

      expect(res.body.success).toBe(true)
    })

    test('解散团队前请先删除该团队下所有的项目', async () => {
      let res = await request('/api/group', 'get', soucheUser.token)

      await request('/api/project/create', 'post', soucheUser.token)
        .send({ group: res.body.data[0]._id, name: 'example', url: '/example' })

      res = await request('/api/group/delete', 'post', soucheUser.token)
        .send({ id: res.body.data[0]._id })

      expect(res.body.message).toBe('解散团队前请先删除该团队下所有的项目')
    })
  })
})
