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
  create_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'user_group'
})

schema.index({ group: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('UserGroup', schema)
