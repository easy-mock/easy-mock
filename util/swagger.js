'use strict'

/* eslint no-useless-escape: 0 */

const _ = require('lodash')
const path = require('path')
const axios = require('axios')
const flatnest = require('flatnest')
const swaggerTools = require('swagger-tools')

const jsf = require('./jsf')
const mockProxy = require('../proxy/mock')

const specV1 = swaggerTools.specs.v1

function requireAllProperties (definitions) {
  const newDef = {}

  _.forEach(definitions, (value, key) => {
    newDef[key] = Object.assign({}, value)
  })

  _.toPairs(newDef)
    .filter(definitionPair => !!definitionPair[1].properties || !!definitionPair[1].allOf)
    .forEach((definitionProps) => {
      const key = definitionProps[0]
      const value = definitionProps[1]
      if (value.properties) {
        newDef[key].required = Object.keys(value.properties)
      } else if (value.allOf) {
        // 针对 allOf 属性添加 required 属性
        _.forEach(value.allOf, (item, i) => {
          if (!item.properties) return
          newDef[key].allOf[i].required = Object.keys(item.properties)
        })
      }
    })

  return newDef
}

/**
 * 获取 model 下所有依赖对象
 * @param {any} model
 * @param {any} swaggerInfo
 * @returns
 */
function getRefModels (model, swaggerInfo) {
  const refModels = []

  function getType (model) {
    let type
    if (model.schema) {
      type = model.schema.type || model.schema.$ref
      type = type === 'array' ? (model.schema.items.type || model.schema.items.$ref) : type
    } else {
      type = model.type || model.$ref
      // string boolean array userModel
      type = type === 'array' ? (model.items.type || model.items.$ref) : type
    }

    type = type || ''

    // #/definitions/user => definitions.user
    type = type[0] === '#' ? type.slice(2).split('/').join('.') : type

    return type
  }

  function _getRefModels (model, swaggerInfo) {
    const type = getType(model)

    // 尝试获取依赖对象, 后面需要增加属性
    let depend = _.get(swaggerInfo, type)

    if (refModels.length === 0) {
      refModels.push(model)
    }

    if (depend) {
      depend = _.cloneDeep(depend)
      depend.properties = depend.properties || {}
      refModels.push(depend.properties)
      Object.keys(depend.properties).forEach((propertie) => {
        propertie = depend.properties[propertie]
        const propertieType = getType(propertie)
        // 防止对象自引用造成栈溢出
        if (propertieType !== type) {
          _getRefModels(propertie, swaggerInfo)
        }
      })
      // 放最后防止循环 _id_，对象别名
      depend.properties._id_ = type.split('.')[1]
    }
  }

  _getRefModels(model, swaggerInfo)

  return _.uniqBy(refModels, '_id_')
}

function createMode (definitions, response) {
  try {
    return JSON.stringify(jsf({
      definitions,
      response
    }).response || {})
  } catch (e) {
    return JSON.stringify({
      error: e.message
    })
  }
}

/**
 * 该方法同时兼容对 Swagger 1.2 2.0 的处理
 *
 * @param {ObjectId} projectId 项目 Id
 * @param {String} basePath
 * @param {Object} paths
 * @returns
 */
function createMock (projectId, swaggerInfo) {
  const {
    basePath = '/', paths, definitions
  } = swaggerInfo

  return mockProxy.find({
    project: projectId
  }).then((mocks) => {
    const newMockList = []
    const oldMockList = []
    const promises = []

    Object.keys(paths).forEach((api) => {
      const apiUrl = path.posix.join(basePath, api)
      // Object.keys(paths[api]) => ['get', 'post', ...]
      Object.keys(paths[api]).forEach((method) => {
        method = method.toLowerCase()

        let oldMode
        let newMode

        const operation = paths[api][method]
        const desc = operation.summary || operation.description
        const mock = _.find(mocks, {
          method,
          url: apiUrl
        })
        const parameters = JSON.stringify(
          (operation.parameters || []).map(o => getRefModels(o, swaggerInfo))
        )
        const responseModel = JSON.stringify(
          Object.keys(operation.responses).map((code) => {
            const res = operation.responses[code]
            res.code = code
            return getRefModels(res, swaggerInfo)
          })
        )
        const response = _.get(operation, 'responses["200"].schema')
        const mode = createMode(definitions, response)

        // 新建 mock
        if (!mock) {
          newMockList.push({
            mode,
            method,
            url: apiUrl,
            parameters,
            response_model: responseModel,
            description: desc,
            project: projectId
          })
          return
        }

        // 更新 mock
        // 比较 mode 是否被更新
        try {
          newMode = JSON.parse(mode)
          oldMode = JSON.parse(mock.mode)
          // flatnest.flatten({ cat: 'meow', dog: [{name: 'spot'}] })
          // =>
          // { 'cat': 'meow', 'dog[0].name': 'spot' }
          let newKeys = Object.keys(flatnest.flatten(newMode))
          let oldKeys = Object.keys(flatnest.flatten(oldMode))

          // 移除多余数组
          // [ 'data[0].item', 'data[1].item', 'data[2].item' ]
          // =>
          // [ 'data[0].item' ]
          newKeys = newKeys.filter(item => !/\[[1-9]\]/.test(item))
          oldKeys = oldKeys.filter(item => !/\[[1-9]\]/.test(item))

          // 移除 mock 语法
          // 'data|1-10.item' => 'data.item'
          // 'data|1-10[0].item' => 'data[0].item'
          oldKeys = oldKeys.map(o => o.replace(/(\|[^\[\.]*)/g, ''))

          mock.mode = _.xor(newKeys, oldKeys).length > 0 ? mode : mock.mode
        } catch (e) {
          mock.mode = mode || mock.mode
        }

        mock.url = apiUrl || mock.url
        mock.method = method || mock.method
        mock.description = desc || mock.description

        // 比较内容是否修改
        const mockDiff = _.xor(
          [
            mock.url, mock.method, mock.description, mock.mode,
            mock.parameters, mock.response_model
          ], [
            apiUrl, method, desc, JSON.stringify(oldMode),
            parameters, responseModel
          ]
        )

        if (mockDiff.length > 0) {
          mock.parameters = parameters
          mock.response_model = responseModel
          oldMockList.push(mock)
        }
      })
    })

    if (newMockList.length > 0) {
      promises.push(mockProxy.newAndSave(newMockList))
    }

    if (oldMockList.length > 0) {
      promises.push(mockProxy.updateMany(oldMockList))
    }

    return Promise.all(promises)
  })
}

const getSwaggerInfo = exports.getSwaggerInfo = function (path, params) {
  let r = {}
  if (params) {
    params.url = params.url.split('?')[0]
    r.url = `${params.url}${path}`
    r.headers = params.headers
  } else {
    r = path
  }
  r.url = `${r.url}?t=${_.now()}`
  return axios(r).then(res => res.data)
}

exports.create = function (project) {
  const swaggerUrl = project.swagger_url.split('?')[0]
  const params = {url: swaggerUrl}

  // 属性转换，解决 1.2 转换到 2.0 时无法对数组生成实体对象的问题
  // {items: {type: 'Action'}} => {items: {$ref: '#/definitions/Action'}}
  const _createMock = (projectId, docs) => {
    const definitions = docs.definitions
    if (!definitions) return createMock(projectId, docs)
    Object.keys(definitions).forEach((key) => {
      const definition = definitions[key]
      const properties = definition.properties || {}
      Object.keys(properties).forEach((key) => {
        const propertie = properties[key]
        if (propertie.items && definitions[propertie.items.type]) {
          const type = propertie.items.type || propertie.items.$ref
          propertie.items.$ref = `#/definitions/${type}`
          delete propertie.items.type
        }
      })
    })
    docs.definitions = requireAllProperties(docs.definitions)
    return createMock(projectId, docs)
  }

  return getSwaggerInfo(params)
    .then((swaggerDoc) => {
      const version = (swaggerDoc.swaggerVersion || swaggerDoc.swagger || '')[0]
      if (version === '1' && swaggerDoc.info) { // info 存在需要循环获取接口
        return Promise
          .all(swaggerDoc.apis.map(api => getSwaggerInfo(api.path, params)))
          .then(result => new Promise((resolve, reject) => {
            specV1.convert(swaggerDoc, result, true, (err, docs) => (
              err ? reject(err) : resolve(_createMock(project.id, docs))
            ))
          }))
      } else if (version === '2') {
        return _createMock(project.id, swaggerDoc)
      }
      return swaggerDoc
    })
}
