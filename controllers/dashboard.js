'use strict'

const moment = require('moment')
const LRU = require('lru-cache')

const { Project, Mock, MockCount, User } = require('../models')

const cache = LRU({ max: 1, maxAge: 1000 * 60 * 60 })

/**
 * 获取 Mock 使用次数
 */

function getUseTotalCount (query = {}) {
  return MockCount.aggregate(
    { $match: query },
    { $group: { _id: null, total: { $sum: '$count' } } }
  ).then(data => data[0] ? /* istanbul ignore next */ data[0].total : 0)
}

module.exports = class DashboardController {
  /**
   * 仪表板
   * @param Object ctx
   */

  static async list (ctx) {
    let result = cache.get('list')
    const query = {
      create_at: {
        '$gte': new Date(moment().format('YYYY-MM-DD'))
      }
    }

    if (!result) {
      const data = await Promise.all([
        User.count(),
        Mock.count(),
        Project.count(),
        getUseTotalCount(),
        User.count(query),
        Mock.count(query),
        Project.count(query),
        getUseTotalCount(query)
      ])

      result = {
        total: {
          userCount: data[0],
          mockCount: data[1],
          projectCount: data[2],
          mockUseCount: data[3]
        },
        today: {
          userCount: data[4],
          mockCount: data[5],
          projectCount: data[6],
          mockUseCount: data[7]
        }
      }

      cache.set('list', result)
    }

    ctx.body = ctx.util.resuccess(result)
  }
}
