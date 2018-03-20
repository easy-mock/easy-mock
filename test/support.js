'use strict'

const request = require('supertest')

const app = require('../app')
const models = require('../models')

class Support {
  static cleanCollections () {
    Object.keys(models).forEach((key) => {
      models[key].remove({}).exec()
    })
  }

  static login (name, password) {
    return request(app.listen())
      .post('/api/u/login')
      .send({ name, password })
      .then(res => res.body.data)
  }

  static createUser (name = 'admin', password = '123456') {
    return request(app.listen())
      .post('/api/u/register')
      .send({ name, password })
      .then(() => this.login(name, password))
  }

  static createRequest (server, token) {
    return function (url, method = 'get', ctoken = token) {
      return request(server)[method](url)
        .set('Authorization', 'Bearer ' + ctoken)
    }
  }
}

module.exports = Support
