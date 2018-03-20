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

const uploadConf = config.get('upload')
const unsplashClientId = config.get('unsplashClientId')
const unsplashCache = LRU({ max: 1, maxAge: 1000 * 60 * 60 })

module.exports = class UtilController {
  /**
   * 壁纸接口
   * @param Object ctx
   */

  static async wallpaper (ctx) {
    const cache = unsplashCache.get('one')
    const wallpaperAPI = unsplashClientId /* istanbul ignore next */
      ? 'https://api.unsplash.com/photos/random?orientation=landscape&count=1&client_id=' + unsplashClientId
      : 'https://cn.bing.com/HPImageArchive.aspx?format=js&n=1'

    if (cache) {
      ctx.body = cache
      return
    }

    try {
      const res = await axios.get(wallpaperAPI)
      ctx.body = unsplashClientId /* istanbul ignore next */
        ? ctx.util.resuccess({ type: 'unsplash', data: res.data })
        : ctx.util.resuccess({ type: 'bing', data: res.data.images })
    } catch (error) {
      ctx.body = ctx.util.resuccess({
        type: 'bing',
        data: [{
          url: '/az/hprichbg/rb/SWFC_ZH-CN9558503653_1920x1080.jpg',
          copyrightlink: '/search?q=%e4%b8%8a%e6%b5%b7%e4%b8%96%e7%95%8c%e9%87%91%e8%9e%8d%e4%b8%ad%e5%bf%83&form=hpcapt&mkt=zh-cn'
        }]
      })
    }
    unsplashCache.set('one', ctx.body)
  }

  /**
   * 文件上传
   * @param Object ctx
   */

  static async upload (ctx) {
    const origin = ctx.request.origin
    const expireDay = uploadConf.expire.day
    const hash = crypto.createHash('md5')
    const date = moment().format('YYYY/MM/DD')
    const uploadDir = path.resolve(__dirname, uploadConf.dir, date)
    const file = ctx.request.body.files.file
    const suffix = path.extname(file.name).toLowerCase()
    const now = (new Date()).getTime()
    const fileName = hash.update(now + Math.random().toString()).digest('hex') + suffix

    let reader, stream

    /* istanbul ignore if */
    if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)

    if (uploadConf.types.indexOf(suffix) === -1) {
      ctx.body = ctx.util.refail(`上传失败，仅支持 ${uploadConf.types.join('/').replace(/\./g, '')} 文件类型`)
      return
    }

    if (file.size > uploadConf.size) {
      ctx.body = ctx.util.refail('上传失败，超过限定大小')
      return
    }

    reader = fs.createReadStream(file.path)
    stream = fs.createWriteStream(path.join(uploadDir, fileName))
    reader.pipe(stream)

    ctx.body = ctx.util.resuccess({
      path: new URL(path.join('upload', date, fileName), origin).href,
      expire: expireDay > 0
        ? moment().add(expireDay, 'days').format('YYYY-MM-DD 00:00:00')
        : /* istanbul ignore next */ -1
    })
  }
}
