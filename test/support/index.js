'use strict'

/* eslint prefer-rest-params: 0 */
const cofnig = require('config')
const koa = require('koa')

const m = require('../../models')
const app = require('../../app')
const routerPrefix = cofnig.get('routerPrefix')
const request = require('supertest').agent(app.listen())
const swaggerJSON = require('./swagger.json')

// 代理 Swagger
koa().use(function * () {
  this.body = swaggerJSON
}).listen(7400)

function createRequest (prefix) {
  prefix = prefix || ''
  return function (method, url, token, body) {
    return new Promise((resolve, reject) => {
      request[method](`${prefix}${url}`)
        .set('Authorization', `Bearer ${token || ''}`)
        .send(body || {})
        .expect(200, (err, res) => (err ? reject(err) : resolve(res.body)))
    })
  }
}

exports.request = request
exports.r = createRequest(routerPrefix.api)
exports.m = createRequest(routerPrefix.mock)

exports.createUser = function (body) {
  const newBody = Object.assign({}, {
    name: 'chuangker',
    nick_name: 'chuangker',
    password: '123456',
    head_img: 'example.com/head.jpg'
  }, body || {})

  return exports.r('post', '/u/register', '', newBody)
    .then(() => exports.r('post', '/u/login', '', {
      name: newBody.name,
      password: newBody.password
    }))
    .then(data => data.data)
}

// createProject
exports.cp = function (token) {
  return function (body) {
    const newBody = Object.assign({}, {
      name: 'project',
      url: '/project',
      description: '我是描述',
      swagger_url: 'http://127.0.0.1:7400'
    }, body)
    return exports.r('post', '/project/create', token, newBody)
  }
}

// getProject
exports.gp = function (token) {
  return function () {
    return exports.r('get', '/project', token)
  }
}

exports.cleanCollections = function () {
  Object.keys(m).forEach((key) => {
    m[key].remove({}).exec()
  })
}
