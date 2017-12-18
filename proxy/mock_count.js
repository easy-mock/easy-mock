'use strict'

const moment = require('moment')

const { MockCount } = require('../models')

module.exports = class MockCountProxy {
  static async newAndSave (mockId) {
    let mockCount = await MockCount.findOne({
      mock: mockId,
      create_at: {
        '$gte': moment().format('YYYY-MM-DD')
      }
    })

    if (!mockCount) {
      mockCount = new MockCount()
      mockCount.mock = mockId
      mockCount.count = 1
      return mockCount.save()
    }

    mockCount.count += 1
    return mockCount.save()
  }
}
