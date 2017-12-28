'use strict'

const _ = require('lodash')
const moment = require('moment')

const { MockCount } = require('../models')

module.exports = class MockCountProxy {
  static newAndSave (mockIds) {
    const group = _.groupBy(mockIds)
    const date = moment().format('YYYY-MM-DD')

    Object.keys(group).forEach(async mockId => {
      await MockCount.update(
        {mock: mockId, create_at: date},
        {$inc: { count: group[mockId].length }},
        {upsert: true}
      )
    })
  }
}
