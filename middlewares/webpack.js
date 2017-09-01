'use strict'

const expressMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

function middleware (doIt, req, res) {
  const originalEnd = res.end

  return function (done) {
    res.end = function () {
      originalEnd.apply(this, arguments)
      done(null, 0)
    }
    doIt(req, res, () => done(null, 1))
  }
}

exports.dev = function (compiler, option) {
  const doIt = expressMiddleware(compiler, option)
  const fun = function * (next) {
    const ctx = this
    ctx.webpack = doIt
    const req = this.req
    const runNext = yield middleware(doIt, req, {
      end: (content) => {
        ctx.body = content
      },
      setHeader: () => {
        ctx.set.apply(ctx, arguments)
      }
    })
    if (runNext) {
      yield * next
    }
  }

  fun.fileSystem = doIt.fileSystem

  return fun
}

exports.hot = function (compiler, option) {
  const action = webpackHotMiddleware(compiler, option)
  return function * (next) {
    const nextStep = yield middleware(action, this.req, this.res)
    if (nextStep && next) {
      yield * next
    }
  }
}
