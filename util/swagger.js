'use strict'

/* eslint no-useless-escape: 0 */

const _ = require('lodash')
const path = require('path')
const Mock = require('mockjs')
const swaggerParserMock = require('swagger-parser-mock')

const util = require('./')
const { MockProxy } = require('../proxy')

async function createMock (projectId, swaggerDocs) {
  /* istanbul ignore next */
  const { basePath = '/', paths } = swaggerDocs

  const apis = await MockProxy.find({ project: projectId })

  const newAPIs = []
  const oldAPIs = []
  const promises = []
  const errorURLs = []

  const OPERATION_METHODS = [
    'get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'
  ]

  for (let url in paths) {
    const fullAPIPath = path.posix.join(basePath, url)
    for (let method in paths[url]) {
      method = method.toLowerCase()

      if (OPERATION_METHODS.indexOf(method) < 0) continue

      const operation = paths[url][method]
      const desc = operation.summary || /* istanbul ignore next */ operation.description
      const api = _.find(apis, { method, url: fullAPIPath })
      const mode = _.get(operation, 'responses["200"].example') || _.get(operation, 'responses["default"].example') || '{}'
      let responseModel, parameters

      for (let code in operation.responses) {
        const response = operation.responses[code]
        response.example = response.example ? Mock.mock(JSON.parse(response.example)) : ''
      }
      responseModel = JSON.stringify(operation.responses)
      parameters = JSON.stringify(
        _.map(operation.parameters, parameter => {
          try {
            parameter.example = parameter.example ? Mock.mock(JSON.parse(parameter.example)) : ''
          } catch (error) {
            // parameters 共有参数是引用类型。变一个，所有用到该参数接口都会同步
            // 例如：
            // 第一次 JSON.parse(parameter.example)
            //     - '"@string"' => 'ywe@yd$#'
            // 第二次 JSON.parse(parameter.example)
            //     - 'ywe@yd$#' => error: Unexpected token V in JSON at position 0
            // {
            //   "paths": {
            //     ...
            //     "parameters": [{
            //       "required": true,
            //       "type": "string",
            //       "name": "postfix",
            //       "in": "path"
            //     }]
            //     ...
            //   }
            // }
            parameter.example = parameter.example
          }
          return parameter
        })
      )

      /* istanbul ignore else */
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

      // util.flatten({ cat: 'meow', dog: [{name: 'spot'}] }) => { 'cat': 'meow', 'dog[0]____name': 'spot' }
      let newKeys = Object.keys(util.flatten(JSON.parse(mode)))
      let oldKeys

      try {
        oldKeys = Object.keys(util.flatten(JSON.parse(api.mode)))
        newKeys = newKeys.filter(key => !/\[[1-9]\d*\]/.test(key))
        oldKeys = oldKeys.filter(key => !/\[[1-9]\d*\]/.test(key)) // [ 'data[0].item', 'data[1].item', 'data[2].item' ] => [ 'data[0]____item' ]
          .map(o => o.replace(/\|[^_\[]*(__)?/g, '$1')) // 'data|1-10.item' => 'data____item' 'data|1-10[0].item' => 'data[0]____item'
        api.mode = _.xor(newKeys, oldKeys).length === 0 || oldKeys.filter(key => key.startsWith('__arr__')) ? /* istanbul ignore next */ api.mode : mode
      } catch (error) {
        // errorURLs.push(`${api.method.toUpperCase()}-${api.url}`)
      }

      api.method = method
      api.url = fullAPIPath
      api.description = desc
      api.parameters = parameters
      api.response_model = responseModel

      oldAPIs.push(api)
    }
  }

  /* istanbul ignore else */
  if (newAPIs.length > 0) promises.push(MockProxy.newAndSave(newAPIs))

  /* istanbul ignore else */
  if (oldAPIs.length > 0) promises.push(MockProxy.updateMany(oldAPIs))

  return Promise.all(promises).then(() => errorURLs)
}

module.exports = class SwaggerUtil {
  static async create (project) {
    // 不验证 tls 证书
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    const docs = await swaggerParserMock(project.swagger_url)
    return createMock(project.id, docs)
  }
}
