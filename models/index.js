'use strict'

const mongoose = require('mongoose')
const config = require('config')

mongoose.Promise = global.Promise
mongoose.connect(config.get('db'), {
  useMongoClient: true,
  poolSize: 20
}, (err) => {
  /* istanbul ignore if */
  if (err) {
    console.error('connect to %s error: ', config.get('db'), err.message)
    process.exit(1)
  }
})

module.exports = {
  User: require('./user'),
  Mock: require('./mock'),
  Group: require('./group'),
  Project: require('./project'),
  MockCount: require('./mock_count'),
  UserGroup: require('./user_group'),
  UserProject: require('./user_project')
}
