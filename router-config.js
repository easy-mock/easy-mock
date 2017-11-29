'use strict'

const config = require('config')
const restc = require('restc').koa()
const router = require('koa-router')

const user = require('./controllers/user')
const mock = require('./controllers/mock')
const util = require('./controllers/util')
const group = require('./controllers/group')
const project = require('./controllers/project')
const realtime = require('./controllers/realtime')

const routerPrefix = config.get('routerPrefix')

exports.mock = router({ prefix: routerPrefix.mock })
  .all('*', restc, mock.getMock)

exports.api = router({ prefix: routerPrefix.api })
  .get('/proxy', util.proxy)
  .get('/wallpaper', util.wallpaper)
  .post('/upload', util.upload)

  .get('/realtime', realtime.list)
  .get('/realtime/top/project', realtime.topProject)

  .get('/u', user.list)
  .post('/u/login', user.login)
  .post('/u/update', user.update)
  .post('/u/logout', user.logout)
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
  .post('/project/update_swagger', project.updateSwagger)
  .post('/project/update_workbench', project.updateWorkbench)

  .get('/mock', mock.list)
  .get('/mock/by_projects', mock.byProjects)
  .post('/mock/create', mock.create)
  .post('/mock/update', mock.update)
  .post('/mock/delete', mock.delete)
  .post('/mock/export', mock.exportMock)
