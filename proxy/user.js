'use strict'

const _ = require('lodash')
const { User } = require('../models')

const gravatar = [
  '//img.souche.com/20161230/png/58f22ad636a0f33bad8762688f78d425.png',
  '//img.souche.com/20161230/png/6cdcda90c2f86ba1f45393cf5b26e324.png',
  '//img.souche.com/20161230/png/f9d10bb683d940dd14dc1b1344e89568.png',
  '//img.souche.com/20161230/png/8bb4f0fd45ed6ae26533eadd85f0f7ea.png',
  '//img.souche.com/20161230/png/0795744371fd5869af6cab796bdacb95.png',
  '//img.souche.com/20161230/png/bc836261fbb654dda6b653e428014279.png',
  '//img.souche.com/20161230/png/fd9f8aecab317e177655049a49b64d02.png'
]

module.exports = class UserProxy {
  static newAndSave (name, password, nickName, headImg) {
    const user = new User()
    const len = gravatar.length

    user.name = name
    user.password = password
    user.nick_name = nickName || _.now()
    user.head_img = headImg || gravatar[_.random(0, len - 1)]

    return user.save()
  }

  static update (user) {
    return User.update({
      _id: user.id
    }, {
      $set: {
        nick_name: user.nick_name,
        head_img: user.head_img,
        password: user.password
      }
    })
  }

  static getByName (userName) {
    return User.findOne({ name: userName })
  }

  static getById (userId) {
    return User.findById(userId)
  }

  static find (query, opt) {
    return User.find(query, {}, opt)
  }
}
