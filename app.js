'use strict'

const _ = require('lodash')
const koa = require('koa')
const path = require('path')
const cors = require('koa-cors')
const config = require('config')
const error = require('koa-error')
const favicon = require('koa-favicon')
const validate = require('koa-validate')
const jwtMongo = require('koa-jwt-mongo')
const bodyParser = require('koa-bodyparser')
const pathToRegexp = require('path-to-regexp')
const staticCache = require('koa-static-cache')
const koaBunyanLogger = require('koa-bunyan-logger')

const logger = require('./util/log')
const middleware = require('./middlewares')
const routerConfig = require('./router-config')

const app = module.exports = koa()
const resolve = file => path.resolve(__dirname, file)
const isProd = process.env.NODE_ENV === 'production'

const serve = (pf, filePath, cache) => staticCache(resolve(filePath), {
  prefix: pf,
  gzip: true,
  dynamic: true,
  maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
})

validate(app)

const requestLogger = isProd
  ? koaBunyanLogger.requestLogger()
  : function * (next) {
    yield next
  }

app
  .use(favicon(path.join(__dirname, '/public/images/icon.png')))
  .use(serve('/dist', './dist'))
  .use(serve('/public', './public'))
  .use(serve('/upload', path.resolve(__dirname, 'config', config.get('upload').dir)))
  .use(koaBunyanLogger(logger))
  .use(koaBunyanLogger.requestIdContext())
  .use(requestLogger)
  .use(cors({
    methods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true,
    maxAge: 2592000
  }))
  .use(error())
  .use(bodyParser())
  .use(middleware.common)
  .use(middleware.error)
  .use(jwtMongo({
    uri: config.get('db'),
    jwtExp: config.get('jwt.expire'),
    collection: config.get('jwt.collection'),
    jwtOptions: {
      secret: config.get('jwt.secret'),
      key: config.get('jwt.key')
    },
    jwtUnless () {
      const path = this.path
      const prefix = `/${path.split('/')[1]}`
      return !(new RegExp(config.get('routerPrefix.api'))).test(prefix)
        ? true : _.some(config.get('publicAPIs').map(
          o => pathToRegexp(o).test(this.path)
        ), Boolean)
    }
  }))
  .use(routerConfig.mock.routes())
  .use(routerConfig.mock.allowedMethods())
  .use(routerConfig.api.routes())
  .use(routerConfig.api.allowedMethods())
  .use(middleware.view(app))

if (!module.parent) {
  app.listen(config.get('port'))
}
