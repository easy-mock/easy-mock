'use strict'

const _ = require('lodash')
const config = require('config')
const pathToRegexp = require('path-to-regexp')

const util = require('./')
const p = require('../proxy')

const projectProxy = p.Project
const mockProxy = p.Mock

exports.createExample = function (userId) {
  const commMode = config.get('mockExample.common')
  const randomMode = config.get('mockExample.random')
  const getFunction = config.get('mockExample.getFunction')
  const postFunction = config.get('mockExample.postFunction')

  const mocks = [
    {
      desc: '这只是一个响应 post 接口返回随机数据的例子',
      method: 'post',
      url: '/upload',
      mode: postFunction
    },
    {
      desc: '根据请求参数返回指定数据，试试在 url 上加 ?name={任意值}',
      method: 'get',
      url: '/query',
      mode: getFunction
    },
    {
      desc: '支持 restful 的 mock，替换 id 试试',
      method: 'get',
      url: '/restful/:id/list',
      mode: JSON.stringify(commMode)
    },
    {
      desc: '支持接口代理的 mock，试试在 url 上加 ?s={数字}',
      method: 'get',
      url: '/proxy',
      mode: 'https://api.m.sohu.com/autonews/pool/?n=%E6%96%B0%E9%97%BB&s=1'
    },
    {
      desc: '带随机数据的 mock',
      method: 'get',
      url: '/mock',
      mode: JSON.stringify(randomMode)
    },
    {
      desc: '普通的 mock',
      method: 'get',
      url: '/user',
      mode: JSON.stringify(commMode)
    }
  ]

  // 创建演示demo
  return projectProxy
    .newAndSave({
      user: userId,
      name: '演示项目',
      url: '/example',
      description: '已创建多种 Mock 类型，只需点击预览便可查看效果。亦可编辑，也可删除。'
    })
    .then(projects => mockProxy.newAndSave(mocks.map(item => ({
      project: projects[0].id,
      description: item.desc,
      method: item.method,
      url: item.url,
      mode: item.mode
    }))))
}

exports.getParams = function (mockUrl, reqUrl) {
  const params = {}
  const paramNames = []
  const api = pathToRegexp(mockUrl, paramNames)
  const captures = reqUrl.match(api).slice(1)

  _.forEach(captures, (c, index) => {
    if (paramNames[index]) {
      params[paramNames[index].name] = c ? util.safeDecodeURIComponent(c) : c
    }
  })

  return params
}
