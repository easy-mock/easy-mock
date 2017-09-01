'use strict'

const cp = require('./cp')
const bcrypt = require('bcrypt-nodejs')

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
