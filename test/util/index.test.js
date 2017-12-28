'use strict'

const util = require('../../util')
const rimraf = require('rimraf')

jest.useFakeTimers()
jest.mock('rimraf', () => jest.fn())

describe('test/util/index.test.js', () => {
  test('params', () => {
    let params = util.params('/api/:user/:id', '/api/souche/123')
    expect(params).toEqual({
      user: 'souche',
      id: '123'
    })

    params = util.params('/api/:user/:id', '/api/a%AFc/123')

    expect(params).toEqual({
      user: 'a%AFc',
      id: '123'
    })

    params = util.params('/api/:user/:id', '/api/123')

    expect(params).toEqual({})
  })

  test('dropFileSchedule', () => {
    util.dropFileSchedule()
    jest.runOnlyPendingTimers()
    expect(rimraf.mock.calls.length).toBe(2)
  })
})
