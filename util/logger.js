'use strict'

const fs = require('fs')
const uuid = require('uuid')
const path = require('path')
const mkdirp = require('mkdirp')
const moment = require('moment')
const pinoTee = require('pino-tee')
const koaPinoLogger = require('koa-pino-logger')

const stream = pinoTee(process.stdin)
const date = moment().format('YYYY-MM-DD')
const logDir = path.join(__dirname, '../logs')
const streamOpt = {flags: 'a', encoding: 'utf8'}
const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

if (isProd) {
  if (!fs.existsSync(logDir)) mkdirp.sync(logDir)

  const errorStream = fs.createWriteStream(`logs/${date}-error.log`, streamOpt)
  const infoStream = fs.createWriteStream(`logs/${date}-info.log`, streamOpt)

  stream.tee(errorStream, line => line.level >= 50)
  stream.tee(infoStream, line => line.level >= 30 && line.level < 50)
  stream.pipe(process.stdout)
}

module.exports = koaPinoLogger({
  name: 'Easy Mock',
  prettyPrint: !isProd,
  level: isTest ? 'error' : 'info',
  genReqId: req => req.headers['x-request-id'] || uuid.v4()
}, isProd ? stream : process.stdout)
