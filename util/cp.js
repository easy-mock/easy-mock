'use strict'

const _ = require('lodash')

/**
 * 将 callback 转换成 promise
 * 约定: callback 模式下 回调参数只能有2个参数 第一个为err 第二个为实际对象
 * sum: 求和函数
 * sum(1, 2, 3, function(err, data){ console.log(data) }) => 6
 * cp(sum, 1, 2, 3).then(function(data){ console.log(data) }) => 6
 * @returns {Promise}
 */

module.exports = function () {
  const fn = arguments[0]
  const args = _.toArray(arguments).slice(1)
  return new Promise((resolve, reject) => {
    function callback (err, data) {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    }

    args.push(callback)

    fn.apply(null, args)
  })
}
