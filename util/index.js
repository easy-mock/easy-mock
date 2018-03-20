'use strict'

const _ = require('lodash')
const path = require('path')
const config = require('config')
const rimraf = require('rimraf')
const Redis = require('ioredis')
const moment = require('moment')
const bcrypt = require('bcryptjs')
const pathToRegexp = require('path-to-regexp')
const { MockCountProxy } = require('../proxy')

const redisConf = config.get('redis')
const redis = new Redis(redisConf.port, redisConf.host, {
  keyPrefix: '[Easy Mock]'
})

module.exports = class BaseUtil {
  /**
   * 初始化操作
   */

  static async init () {
    this.dropFileSchedule()
    this.mockUseCountSchedule()
  }

  /**
   * 获取 redis 实例
   */

  static getRedis () {
    return redis
  }

  /**
   * 加密字符串
   * @param String str
   */

  static bhash (str) {
    return bcrypt.hashSync(str, 8)
  }

  /**
   * 对比原字符串与经过加密的字符串是否相同
   * @param String str
   * @param String hash
   */

  static bcompare (str, hash) {
    return bcrypt.compareSync(str, hash)
  }

  /**
   * 安全的 decodeURIComponent
   * @param String str
   */

  static safeDecodeURIComponent (str) {
    try {
      return decodeURIComponent(str)
    } catch (e) {
      return str
    }
  }

  /**
   * 解析出 params 对象
   *
   * /user/nick (/user/:name) => { name: 'nick' }
   *
   * @param String restURL /user/:name
   * @param String fullURL /user/nick
   */

  static params (restURL, fullURL) {
    const params = {}
    const paramNames = []
    const api = pathToRegexp(restURL, paramNames)
    const captures = fullURL.match(api)

    if (!captures) return {}

    captures.slice(1).forEach((value, i) => {
      /* istanbul ignore else */
      if (paramNames[i]) {
        params[paramNames[i].name] = this.safeDecodeURIComponent(value)
      }
    })

    return params
  }

  /**
   * 定时删除已经上传的过期文件
   */

  static dropFileSchedule () {
    const conf = config.get('upload')
    const expireDay = conf.expire.day

    /* istanbul ignore else */
    if (typeof expireDay === 'number' && expireDay > 0) {
      const expireTypes = conf.expire.types.map(type => `*${type}`).join(',')
      const date = moment().subtract(expireDay, 'days').format('YYYY/MM/DD')
      const uploadDir = path.resolve(__dirname, '../config', conf.dir, date)
      const commandPath = `${uploadDir}/{${expireTypes}}`

      rimraf(commandPath, _.noop)
      setInterval(() => rimraf(commandPath, _.noop), 1000 * 60 * 60)
    }
  }

  static mockUseCountSchedule () {
    async function run () {
      const len = await redis.llen('mock.count')
      if (len === 0) return
      const mockIds = await redis.lrange('mock.count', -len, len)
      await redis.ltrim('mock.count', 0, -(len + 1))
      await MockCountProxy.newAndSave(mockIds)
    }

    run()
    setInterval(run, 1000 * 10)
  }

  /**
   * Flatten/Nest Javascript objects
   * https://github.com/brycebaril/node-flatnest/blob/master/flatten.js
   * @param Object obj
   */

  /* istanbul ignore next */
  static flatten (obj) {
    const flattened = {}
    const circlular = []
    const circLoc = []

    function _route (prefix, value) {
      let i, len, keys, circularCheck, loc

      if (value == null) {
        if (prefix === '') {
          return
        }
        flattened[prefix] = null
        return
      }
      if (typeof value === 'object') {
        circularCheck = circlular.indexOf(value)
        if (circularCheck >= 0) {
          loc = circLoc[circularCheck] || 'this'
          flattened[prefix] = '[Circular (' + loc + ')]'
          return
        }
        circlular.push(value)
        circLoc.push(prefix)

        if (Array.isArray(value)) {
          len = value.length
          if (len === 0) _route(prefix + '[]', null)
          for (i = 0; i < len; i++) {
            _route(prefix + '[' + i + ']', value[i])
          }
          return
        }
        keys = Object.keys(value)
        len = keys.length
        if (prefix) prefix = prefix + '____'
        if (len === 0) _route(prefix, null)
        for (i = 0; i < len; i++) {
          _route(prefix + keys[i], value[keys[i]])
        }
        return
      }
      flattened[prefix] = value
    }

    _route('', obj)

    return flattened
  }
}
