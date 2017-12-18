'use strict'

const example = {
  base: JSON.stringify({
    'success': true,
    'data': [{
      'user': {
        'name': '演示用'
      }
    }]
  }),
  random: JSON.stringify({
    'success': true,
    'data': {
      'projects|3-10': [{
        'name': '演示用',
        'url': '@url',
        'email': '@email',
        'address': '@county(true)',
        'string|1-10': '★',
        'number|1-100': 100,
        'boolean|1-2': true,
        'object|2': {
          '310000': '上海市',
          '320000': '江苏省',
          '330000': '浙江省'
        }
      }]
    }
  }),
  get: '{ success :true, data: { default: "hah", _req: function({ _req }) { return _req }, name: function({ _req }) { return _req.query.name || this.default }}}',
  post: '{ data: { img: function({ _req, Mock }) { return _req.body.fileName + "_" + Mock.mock("@image") }}}',
  res: '{success: true, data: {name: "hh"}, _res: {status: 400, data: {success: false}, cookies: {test: "true"}, headers: {Power: "easy-mock"}}}'
}

module.exports = {
  examples: [
    {
      desc: '这只是一个响应 post 接口返回随机数据的例子',
      method: 'post',
      url: '/upload',
      mode: example.post
    },
    {
      desc: '根据请求参数返回指定数据，试试在 url 上加 ?name={任意值}',
      method: 'get',
      url: '/query',
      mode: example.get
    },
    {
      desc: '支持 restful 的 mock，替换 id 试试',
      method: 'get',
      url: '/restful/:id/list',
      mode: example.base
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
      mode: example.random
    },
    {
      desc: '自定义响应的 mock',
      method: 'get',
      url: '/',
      mode: example.res
    }
  ]
}
