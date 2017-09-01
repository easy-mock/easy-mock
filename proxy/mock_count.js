'use strict'

const _ = require('lodash')
const moment = require('moment')

const m = require('../models')

const MockCountModel = m.MockCount

exports.newAndSave = function (mockId) {
  const mockCount = new MockCountModel()
  return MockCountModel.findOne({
    mock: mockId,
    create_at: {
      '$gte': moment().format('YYYY-MM-DD')
    }
  }).then((data) => {
    if (_.isEmpty(data)) {
      mockCount.mock = mockId
      mockCount.count = 1
      return mockCount.save()
    }
    data.count += 1
    return data.save()
  })
}
