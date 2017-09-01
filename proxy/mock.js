'use strict'

const _ = require('lodash')

const m = require('../models')

const MockModel = m.Mock

exports.newAndSave = function (docs) {
  return MockModel.insertMany(docs)
}

exports.getById = function (mockId) {
  return MockModel.findById(mockId).populate('project')
}

exports.find = function (query, opt) {
  return MockModel.find(query, {}, opt).populate('project')
}

exports.findOne = function (query, opt) {
  return MockModel.findOne(query, {}, opt).populate('project')
}

exports.updateById = function (mock) {
  return MockModel.update({
    _id: mock.id
  }, {
    $set: {
      url: mock.url,
      mode: mock.mode,
      method: mock.method,
      parameters: mock.parameters,
      description: mock.description,
      response_model: mock.response_model
    }
  })
}

exports.updateMany = function (docs) {
  if (!_.isArray(docs)) {
    docs = [docs]
  }
  return Promise.all(docs.map(item => exports.updateById(item)))
}

exports.delByIds = function (mockIds) {
  return MockModel.remove({
    _id: {
      $in: mockIds
    }
  })
}

exports.del = function (query) {
  return MockModel.remove(query)
}
