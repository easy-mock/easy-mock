'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const schema = new Schema({
  nick_name: String,
  head_img: String,
  name: String,
  password: String,
  create_at: {
    type: Date,
    default: Date.now
  }
})

schema.index({ name: 1 }, { unique: true })

module.exports = mongoose.model('User', schema)
