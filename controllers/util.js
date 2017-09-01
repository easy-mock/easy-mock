'use strict'

const axios = require('axios')
const LRU = require('lru-cache')
const config = require('config')
const unsplashClientId = config.get('unsplashClientId')
const unsplashCache = LRU({
  max: 1,
  maxAge: 1000 * 60 * 60
})

exports.proxy = function * () {
  const url = this.checkQuery('url').notEmpty().isUrl().value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  const data = yield axios.get(url).then(res => res.data)
  this.body = data
}

exports.wallpaper = function * () {
  const cache = unsplashCache.get('one')
  const bingAPI = 'https://cn.bing.com/HPImageArchive.aspx?format=js&n=1'
  const unsplashAPI = 'https://api.unsplash.com/photos/random?orientation=landscape&count=1&client_id=' + unsplashClientId

  if (cache) {
    this.body = cache
    return
  }

  if (unsplashClientId) {
    const res = yield axios.get(unsplashAPI)
    this.body = { type: 'unsplash', data: res.data }
  } else {
    const res = yield axios.get(bingAPI)
    this.body = { type: 'bing', data: res.data.images }
  }
  unsplashCache.set('one', this.body)
}
