'use strict'

const config = require('config')
const Router = require('koa-router')
const restc = require('restc').koa2()
const ratelimit = require('koa-ratelimit')
const {
  user,
  mock,
  util,
  group,
  project,
  dashboard
} = require('./controllers')
const baseUtil = require('./util')
const middleware = require('./middlewares')

const rateLimitConf = config.get('rateLimit')
const apiRouter = new Router({ prefix: '/api' })
const mockRouter = new Router({ prefix: '/mock' })
const rate = ratelimit({
  db: baseUtil.getRedis(),
  id: ctx => ctx.url,
  max: rateLimitConf.max,
  duration: rateLimitConf.duration,
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  }
})

exports.mock = mockRouter
  .all('*', middleware.mockFilter, rate, restc, mock.getMockAPI)

exports.api = apiRouter
  .get('/wallpaper', util.wallpaper)
  .post('/upload', util.upload)

  .get('/dashboard', dashboard.list)

  .get('/u', user.list)
  .post('/u/login', user.login)
  .post('/u/update', user.update)
  .post('/u/register', user.register)

  .get('/group', group.list)
  .post('/group/join', group.join)
  .post('/group/create', group.create)
  .post('/group/delete', group.delete)
  .post('/group/update', group.update)

  .get('/project', project.list)
  .post('/project/copy', project.copy)
  .post('/project/create', project.create)
  .post('/project/update', project.update)
  .post('/project/delete', project.delete)
  .post('/project/sync/swagger', project.syncSwagger)
  .post('/project/update_workbench', project.updateWorkbench)

  .get('/mock', mock.list)
  .get('/mock/by_projects', mock.getAPIByProjectIds)
  .post('/mock/create', mock.create)
  .post('/mock/update', mock.update)
  .post('/mock/delete', mock.delete)
  .post('/mock/export', mock.exportAPI)
