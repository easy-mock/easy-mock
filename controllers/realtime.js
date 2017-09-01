'use strict'

const _ = require('lodash')
const moment = require('moment')
const config = require('config')
const LRU = require('lru-cache')
const cache = LRU({
  max: 1,
  maxAge: 1000 * 60 * 60
})

const { Mock: MockProxy } = require('../proxy')
const {
  Project: ProjectModel,
  Mock: MockModel,
  MockCount: MockCountModel,
  User: UserModel
} = require('../models')

// 查询 Mock 调用总量
function getUseTotalCount (query = {}) {
  return MockCountModel.aggregate(
    { $match: query },
    { $group: { _id: null, total: { $sum: '$count' } } }
  ).then(data => data[0] ? data[0].total : 0)
}

// 查询单个项目 Mock 调用量
function getUseCount (pageSize, mocks) {
  const query = [
    { $group: { _id: { mock: '$mock' }, total: { $sum: '$count' } } },
    { $project: { _id: 0, mock: '$_id.mock', total: 1 } },
    { $sort: { total: -1 } },
    { $limit: pageSize }
  ]
  if (mocks) {
    query.unshift({ $match: { mock: { $in: mocks } } })
  }
  return MockCountModel.aggregate(query)
}

exports.list = function * () {
  let result = cache.get('list')
  const query = {
    create_at: {
      '$gte': new Date(moment().format('YYYY-MM-DD'))
    }
  }

  if (!result) {
    const data = yield Promise.all([
      UserModel.count(),
      MockModel.count(),
      ProjectModel.count(),
      getUseTotalCount(),
      UserModel.count(query),
      MockModel.count(query),
      ProjectModel.count(query),
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

  this.body = this.util.resuccess(result)
}

exports.topProject = function * () {
  let mocks, useCounts
  let projects = []

  const keywords = this.checkQuery('keywords').value
  const pageSize = this.checkQuery('page_size')
    .empty().toInt().gt(0).default(config.get('pageSize')).value

  if (this.errors) {
    this.body = this.util.refail(null, 10001, this.errors)
    return
  }

  if (keywords) {
    const keyExp = new RegExp(keywords)
    const where = {
      $or: [
        { url: keyExp },
        { description: keyExp },
        { name: keyExp }
      ]
    }
    const projects = yield ProjectModel.find(where, { limit: pageSize })
    mocks = yield MockProxy.find({ project: { $in: projects.map(o => o.id) } })
    useCounts = yield getUseCount(pageSize, mocks.map(o => o._id))
  } else {
    useCounts = yield getUseCount(pageSize)
    mocks = yield MockProxy.find({
      _id: { $in: useCounts.map(o => o.mock) }
    })
  }

  mocks.forEach((mock) => {
    const project = mock.project
    const projectId = project.id
    const exProject = _.find(projects, ['id', projectId])
    const mockTotal = useCounts.filter(o => (o.mock.toString() === mock.id))[0]

    if (exProject && mockTotal && mockTotal.total) {
      exProject.total += mockTotal.total
    } else if (!exProject) {
      projects.push({
        id: projectId,
        name: project.name,
        description: project.description,
        total: (mockTotal && mockTotal.total) || 0
      })
    }
  })
  projects = _.sortBy(projects, [o => -o.total])

  this.body = this.util.resuccess(projects)
}
