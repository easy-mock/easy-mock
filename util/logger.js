'use strict'

const fs = require('fs')
const uuid = require('uuid')
const path = require('path')
const mkdirp = require('mkdirp')
const moment = require('moment')
const koaPinoLogger = require('koa-pino-logger')
const multistream = require('pino-multi-stream').multistream

const streamOpt = {flags: 'a', encoding: 'utf8'}
const date = moment().format('YYYY-MM-DD')
const logDir = path.join(__dirname, '../logs')
let streams = [
  {level: 'info', stream: process.stdout},
  {level: 'error', stream: process.stderr}
]

/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') {
  if (!fs.existsSync(logDir)) mkdirp.sync(logDir)

  streams = [
    {level: 'info', stream: fs.createWriteStream(`logs/${date}-info.log`, streamOpt)},
    {level: 'error', stream: fs.createWriteStream(`logs/${date}-error.log`, streamOpt)}
  ]
}

module.exports = koaPinoLogger({
  name: 'Easy Mock',
  level: process.env.NODE_ENV === 'test' ? 'silent' : /* istanbul ignore next */ 'info',
  genReqId: req => req.headers['x-request-id'] || uuid.v4()
}, multistream(streams))
