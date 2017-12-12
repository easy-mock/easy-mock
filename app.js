'use strict'

const Koa = require('koa')
const path = require('path')
const config = require('config')
const koaJwt = require('koa-jwt')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const onerror = require('koa-onerror')
const favicon = require('koa-favicon')
const validate = require('koa-validate')
const staticCache = require('koa-static-cache')

const util = require('./util')
const logger = require('./util/logger')
const middleware = require('./middlewares')
const routerConfig = require('./router-config')

const app = module.exports = new Koa()
const uploadConf = config.get('upload')
const jwtSecret = config.get('jwt.secret')

util.dropFileSchedule()
onerror(app)
validate(app)

app
  .use(favicon(path.join(__dirname, '/public/images/icon.png')))
  .use(serve('/dist', './dist'))
  .use(serve('/public', './public'))
  .use(serve('/upload', path.resolve(__dirname, 'config', uploadConf.dir)))
  .use(logger)
  .use(koaJwt({ secret: jwtSecret }).unless({
    path: [
      /^\/(public|dist|upload|mock)\//,
      '/api/u/login',
      '/api/u/register',
      '/api/mock/by_projects',
      '/api/mock/export',
      '/api/wallpaper'
    ]
  }))
  .use(cors({ credentials: true, maxAge: 2592000 }))
  .use(koaBody({ multipart: true }))
  .use(middleware.util)
  .use(routerConfig.mock.routes())
  .use(routerConfig.mock.allowedMethods())
  .use(routerConfig.api.routes())
  .use(routerConfig.api.allowedMethods())
  // .use(middleware.view(app))

app.proxy = config.get('proxy')

/* istanbul ignore if */
if (!module.parent) app.listen(config.get('port'))

function serve (prefix, filePath) {
  return staticCache(path.resolve(__dirname, filePath), {
    prefix: prefix,
    gzip: true,
    dynamic: true,
    maxAge: 60 * 60 * 24 * 30
  })
}
