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
  const wallpaperAPI = unsplashClientId
    ? 'https://api.unsplash.com/photos/random?orientation=landscape&count=1&client_id=' + unsplashClientId
    : 'https://cn.bing.com/HPImageArchive.aspx?format=js&n=1'

  if (cache) {
    this.body = cache
    return
  }

  try {
    const res = yield axios.get(wallpaperAPI)
    this.body = unsplashClientId
      ? { type: 'unsplash', data: res.data }
      : { type: 'bing', data: res.data.images }
  } catch (error) {
    this.body = {
      type: 'bing',
      data: [{
        url: '/az/hprichbg/rb/SWFC_ZH-CN9558503653_1920x1080.jpg',
        copyrightlink: '/search?q=%e4%b8%8a%e6%b5%b7%e4%b8%96%e7%95%8c%e9%87%91%e8%9e%8d%e4%b8%ad%e5%bf%83&form=hpcapt&mkt=zh-cn'
      }]
    }
  }
  unsplashCache.set('one', this.body)
}
