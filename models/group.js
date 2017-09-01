'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    unique: true
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

schema.index({ user: 1, create_at: -1 })
schema.index({ name: 1 }, { unique: true })

module.exports = mongoose.model('Group', schema)
