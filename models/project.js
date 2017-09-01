'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  name: String,
  url: String,
  description: {
    type: String,
    default: ''
  },
  swagger_url: {
    type: String,
    default: ''
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  create_at: {
    type: Date,
    default: Date.now
  }
})

schema.index({ user: 1, members: 1, create_at: -1 })

module.exports = mongoose.model('Project', schema)
