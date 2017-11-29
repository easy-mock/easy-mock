'use strict'

const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const axios = require('axios')
const moment = require('moment')
const mkdirp = require('mkdirp')
const crypto = require('crypto')
const LRU = require('lru-cache')
const config = require('config')
const parse = require('co-busboy')
const concat = require('concat-stream')
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

exports.upload = function * () {
  const origin = this.request.origin
  const conf = config.get('upload')
  const hash = crypto.createHash('md5')
  const day = moment().format('YYYY/MM/DD')
  const uploadDir = path.resolve(__dirname, conf.dir, day)
  const handleLimit = function () {
    limitError = new Error('上传失败，超过限定大小')
    part && part.removeListener('limit', handleLimit)
  }
  const parts = parse(this, {
    limits: {
      fileSize: conf.size
    },
    checkFile: function (fieldname, file, filename) {
      const suffix = path.extname(filename).toLowerCase()
      file.on('limit', handleLimit)
      if (conf.types.indexOf(suffix) === -1) {
        return new Error(`上传失败，仅支持 ${conf.types.join('/').replace(/\./g, '')} 文件类型`)
      }
    }
  })
  let part, limitError, body

  if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)

  try {
    while ((part = yield parts)) {
      part.pipe(concat((fileContent) => {
        const suffix = path.extname(part.filename).toLowerCase()
        const fileName = hash.update(fileContent).digest('hex') + suffix
        const filePath = path.join(uploadDir, fileName)
        if (limitError) {
          body = this.util.refail(limitError.message)
        } else {
          fs.writeFileSync(filePath, fileContent)
          body = this.util.resuccess({
            path: new URL(path.join('upload', day, fileName), origin)
          })
        }
      }))
    }
  } catch (error) {
    body = this.util.refail(error && error.message)
  }

  this.body = body || this.util.refail('无文件上传')
}
