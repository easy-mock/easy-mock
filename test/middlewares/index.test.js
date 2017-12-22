'use strict'

const Koa = require('koa')
const request = require('supertest')
const middleware = require('../../middlewares')

describe('test/middlewares/index.test.js', () => {
  test('ipFilter', async () => {
    const app = new Koa()
    app
      .use((ctx, next) => {
        ctx.request.ip = '127.0.0.1'
        return next()
      })
      .use(middleware.util)
      .use(middleware.ipFilter)
    const res = await request(app.callback()).get('/')
    expect(res.body.message).toBe('请求频率太快，已被限制访问')
  })
})
