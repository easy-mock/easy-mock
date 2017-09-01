'use strict'

const jsf = require('json-schema-faker')

jsf.option({
  failOnInvalidTypes: false,
  defaultInvalidTypeProduct: ''
})

// Core formats only: date-time, email, hostname, ipv4, ipv6 and uri
// Custom formats
jsf.format('date', () => '@date')
jsf.format('byte', () => '@string')
jsf.format('binary', () => '@string')
jsf.format('password', () => '@string')
jsf.format('float', () => '@float')
jsf.format('double', () => '@float')
jsf.format('int32', () => '@integer')
jsf.format('int64', () => '@integer')

module.exports = jsf
