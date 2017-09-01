'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  is_workbench: { // 工作台
    type: Boolean,
    default: false
  },
  create_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'user_project'
})

schema.index({ project: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('UserProject', schema)
