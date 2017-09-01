'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const bunyan = require('bunyan')

let logger

function Logger () {
  const uploadDir = path.join(__dirname, '../logs')

  if (!fs.existsSync(uploadDir)) {
    mkdirp.sync(uploadDir)
  }

  if (logger) {
    return logger
  }

  logger = bunyan.createLogger({
    name: 'easy-mock',
    serializers: bunyan.stdSerializers,
    streams: [
      {
        level: 'info',
        stream: process.stdout
      },
      {
        type: 'rotating-file',
        level: 'error',
        count: 3,
        path: path.join(uploadDir, 'error.log')
      }
    ]
  })

  return logger
}

module.exports = exports = new Logger()
