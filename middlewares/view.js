'use strict'

const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const cookie = require('react-cookie')
const { createBundleRenderer } = require('vue-server-renderer')

let renderer
const resolve = file => path.resolve(__dirname, file)
const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const template = fs.readFileSync(resolve('../views/index.html'), 'utf-8')

function createRenderer (bundle, options) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(bundle, Object.assign(options, {
    template,
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    // this is only needed when vue-server-renderer is npm-linked
    basedir: resolve('../dist'),
    // recommended for performance
    runInNewContext: false
  }))
}

module.exports = function (app) {
  if (isTest) {
    return function * (next) {
      yield next
    }
  }

  let readyPromise

  if (isProd) {
    const bundle = require('../dist/vue-ssr-server-bundle.json')
    const clientManifest = require('../dist/vue-ssr-client-manifest.json')
    renderer = createRenderer(bundle, {
      clientManifest
    })
  } else {
    readyPromise = require('../build/setup-dev-server')(app, (bundle, options) => {
      renderer = createRenderer(bundle, options)
    })
  }

  const getHTML = (context, s) => new Promise((resolve, reject) => {
    const cb = (error, html) => {
      if (error) {
        return reject(error)
      }
      resolve(html)
      if (!isProd) {
        this.log.info(`whole request: ${Date.now() - s}ms`)
      }
    }
    if (isProd) {
      renderer.renderToString(context, cb)
    } else {
      readyPromise.then(() => {
        renderer.renderToString(context, cb)
      })
    }
  })

  return function * () {
    const s = Date.now()
    const context = { url: this.url }
    const handleError = err => {
      if (err.code === 404) {
        this.status = 404
        this.body = '404 | Page Not Found'
      } else if (err.code === 401) {
        this.status = 302
        this.redirect('/login')
      } else {
        this.status = 500
        this.body = '500 | Internal Server Error'
        this.log.error(`error during render : ${this.url}`)
        this.log.error(err.stack)
      }
    }

    this.type = 'html'
    cookie.setRawCookie(this.header.cookie)
    // cookie.save = this.cookies.set.bind(this)

    try {
      this.body = yield getHTML(context, s)
    } catch (error) {
      handleError(error)
    }
  }
}
