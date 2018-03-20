'use strict'

const fs = require('fs')
const path = require('path')

const config = {
  db: 'mongodb://localhost/test-easy-mock',
  blackList: {
    projects: ['222222222233333333331212'],
    ips: ['127.0.0.1']
  },
  upload: {
    dir: '../public/upload/test',
    expire: {
      types: ['.json'],
      day: 1
    }
  }
}

fs.writeFileSync(path.resolve(__dirname, '../config/test.json'), JSON.stringify(config))
