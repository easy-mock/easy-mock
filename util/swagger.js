'use strict'

/* eslint no-useless-escape: 0 */

const _ = require('lodash')
const path = require('path')
const Mock = require('mockjs')
const swaggerParserMock = require('swagger-parser-mock')

const flatten = require('./').flatten
const mockProxy = require('../proxy/mock')

function createMock (projectId, swaggerDocs) {
  const { basePath = '/', paths } = swaggerDocs

  return mockProxy.find({ project: projectId }).then((apis) => {
    const newAPIs = []
    const oldAPIs = []
    const promises = []

    for (let url in paths) {
      const fullAPIPath = path.posix.join(basePath, url)
      for (let method in paths[url]) {
        method = method.toLowerCase()

        const operation = paths[url][method]
        const desc = operation.summary || operation.description
        const api = _.find(apis, { method, url: fullAPIPath })
        const mode = _.get(operation, 'responses["200"].example') || _.get(operation, 'responses["default"].example') || '{}'
        let responseModel, parameters

        for (let code in operation.responses) {
          const response = operation.responses[code]
          response.example = response.example ? Mock.mock(JSON.parse(response.example)) : ''
        }
        responseModel = JSON.stringify(operation.responses)
        parameters = JSON.stringify(
          (operation.parameters || []).map(parameter => {
            parameter.example = parameter.example ? Mock.mock(JSON.parse(parameter.example)) : ''
            return parameter
          })
        )

        if (!api) {
          newAPIs.push({
            mode,
            method,
            url: fullAPIPath,
            parameters,
            response_model: responseModel,
            description: desc,
            project: projectId
          })
          continue
        }

        // flatten({ cat: 'meow', dog: [{name: 'spot'}] }) => { 'cat': 'meow', 'dog[0]____name': 'spot' }
        let newKeys = Object.keys(flatten(JSON.parse(mode)))
        let oldKeys = Object.keys(flatten(JSON.parse(api.mode)))

        api.parameters = parameters
        api.url = fullAPIPath || api.url
        api.method = method || api.method
        api.response_model = responseModel
        api.description = desc || api.description
        newKeys = newKeys.filter(key => !/\[[1-9]\d*\]/.test(key))
        oldKeys = oldKeys.filter(key => !/\[[1-9]\d*\]/.test(key)) // [ 'data[0].item', 'data[1].item', 'data[2].item' ] => [ 'data[0]____item' ]
          .map(o => o.replace(/\|[^_\[]*(__)?/g, '$1')) // 'data|1-10.item' => 'data____item' 'data|1-10[0].item' => 'data[0]____item'
        api.mode = _.xor(newKeys, oldKeys).length > 0 ? mode : api.mode

        oldAPIs.push(api)
      }
    }

    if (newAPIs.length > 0) {
      promises.push(mockProxy.newAndSave(newAPIs))
    }

    if (oldAPIs.length > 0) {
      promises.push(mockProxy.updateMany(oldAPIs))
    }

    return Promise.all(promises)
  })
}

exports.create = function (project) {
  return swaggerParserMock(project.swagger_url)
    .then(docs => createMock(project.id, docs))
}
