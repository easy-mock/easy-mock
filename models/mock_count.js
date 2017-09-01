'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  mock: {
    type: Schema.Types.ObjectId,
    ref: 'Mock'
  },
  count: Number,
  create_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'mock_counts'
})

schema.index({ mock: 1, create_at: -1 })

module.exports = mongoose.model('MockCount', schema)
