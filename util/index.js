'use strict'

const path = require('path')
const config = require('config')
const rimraf = require('rimraf')
const moment = require('moment')
const bcrypt = require('bcryptjs')
const cp = require('./cp')

/**
 * 定时删除已经上传的过期文件
 */
exports.dropFileSchedule = function () {
  const conf = config.get('upload')
  const expireDay = conf.expire.day

  if (typeof expireDay === 'number' && expireDay > 0) {
    const expireTypes = conf.expire.types.map(type => `*${type}`).join(',')
    const date = moment().subtract(expireDay, 'days').format('YYYY/MM/DD')
    const uploadDir = path.resolve(__dirname, conf.dir, date)
    const commandPath = `${uploadDir}/{${expireTypes}}`

    rimraf(commandPath, () => {})
    setInterval(() => rimraf(commandPath, () => {}), 1000 * 60 * 60)
  }
}

/**
 * 加密字符串
 * @param str
 */

exports.bhash = function (str) {
  return cp(bcrypt.hash, str, 8)
}

/**
 * 对比原字符串与经过加密的字符串是否相同
 * @param str
 * @param hash
 */
exports.bcompare = function (str, hash) {
  return cp(bcrypt.compare, str, hash)
}

/**
 * Safe decodeURIComponent
 * @param text
 */
exports.safeDecodeURIComponent = function (text) {
  try {
    return decodeURIComponent(text)
  } catch (e) {
    return text
  }
}

exports.flatten = function (obj) {
  // https://github.com/brycebaril/node-flatnest/blob/master/flatten.js
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
