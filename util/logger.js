'use strict'

const fs = require('fs')
const uuid = require('uuid')
const path = require('path')
const mkdirp = require('mkdirp')
const moment = require('moment')
const koaPinoLogger = require('koa-pino-logger')
const multistream = require('pino-multi-stream').multistream

const date = moment().format('YYYY-MM-DD')
const logDir = path.join(__dirname, '../logs')
let streams = [
  {level: 'info', stream: process.stdout},
  {level: 'error', stream: process.stderr}
]
let logger

/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') {
  if (!fs.existsSync(logDir)) mkdirp.sync(logDir)

  streams = [
    {level: 'info', stream: fs.createWriteStream(`logs/${date}-info.log`)},
    {level: 'error', stream: fs.createWriteStream(`logs/${date}-error.log`)}
  ]
}

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  logger = async (ctx, next) => {
    await next()
  }
} else {
  logger = koaPinoLogger({
    name: 'Easy Mock',
    genReqId: req => req.headers['x-request-id'] || uuid.v4()
  }, multistream(streams))
}

module.exports = logger
