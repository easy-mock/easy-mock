'use strict'

const fs = require('fs')
const path = require('path')
const config = require('config')
const moment = require('moment')

const app = require('../../app')
const spt = require('../support')

jest.mock('lru-cache', () => {
  return function () {
    return {
      set: () => {},
      get: jest.fn()
        .mockImplementationOnce(() => ({
          code: 200,
          success: true,
          message: 'success',
          data: {
            type: 'bing',
            data: [{
              url: 'http://cache.com/l.png',
              copyrightlink: 'http://cache.com/l.png'
            }]
          }
        }))
    }
  }
})

jest.mock('axios', () => ({
  get: jest.fn()
    .mockImplementationOnce(() => Promise.resolve({
      data: {
        images: [{
          url: 'http://bing.com/l.png',
          copyrightlink: 'http://bing.com/l.png'
        }]
      }
    }))
    .mockImplementationOnce(() => Promise.reject()) // eslint-disable-line
}))

describe('test/controllers/util.test.js', () => {
  let request, user

  afterAll(() => spt.cleanCollections())
  beforeAll(async () => {
    user = await spt.createUser()
    request = spt.createRequest(app.listen(), user.token)
  })

  describe('wallpaper', () => {
    test('从缓存获取', async () => {
      const res = await request('/api/wallpaper')

      const data = res.body.data
      expect(data.data).toHaveLength(1)
      expect(data.data[0]).toEqual({
        url: 'http://cache.com/l.png',
        copyrightlink: 'http://cache.com/l.png'
      })
      expect(data.type).toBe('bing')
    })

    test('获取 Bing 的壁纸', async () => {
      const res = await request('/api/wallpaper')

      const data = res.body.data
      expect(data.data).toHaveLength(1)
      expect(data.data[0]).toEqual({
        url: 'http://bing.com/l.png',
        copyrightlink: 'http://bing.com/l.png'
      })
      expect(data.type).toBe('bing')
    })

    test('异常处理', async () => {
      const res = await request('/api/wallpaper')

      const data = res.body.data

      expect(data.data).toHaveLength(1)
      expect(data.data[0]).toEqual({
        url: '/az/hprichbg/rb/SWFC_ZH-CN9558503653_1920x1080.jpg',
        copyrightlink: '/search?q=%e4%b8%8a%e6%b5%b7%e4%b8%96%e7%95%8c%e9%87%91%e8%9e%8d%e4%b8%ad%e5%bf%83&form=hpcapt&mkt=zh-cn'
      })
      expect(data.type).toBe('bing')
    })
  })

  describe('upload', () => {
    const uploadConf = config.get('upload')
    test('文件类型错误', async () => {
      const res = await request('/api/upload', 'post')
        .attach('file', Buffer.from('upload'), 'upload.js')

      expect(res.body.message).toBe(`上传失败，仅支持 ${uploadConf.types.join('/').replace(/\./g, '')} 文件类型`)
    })

    test('大小限制', async () => {
      const res = await request('/api/upload', 'post')
        .attach('file', Buffer.alloc(uploadConf.size + 1), 'upload.jpg')

      expect(res.body.message).toBe('上传失败，超过限定大小')
    })

    test('图片上传', async () => {
      const res = await request('/api/upload', 'post')
        .attach('file', Buffer.from('upload'), 'upload.jpg')

      const data = res.body.data
      const filePath = path.resolve(__dirname, '../../config', uploadConf.dir, data.path.match(/\/upload\/(.*)/)[1])

      expect(data.expire).toBe(moment().add(uploadConf.expire.day, 'days').format('YYYY-MM-DD 00:00:00'))
      expect(res.body.message).toBe('success')
      expect(fs.existsSync(filePath)).toBe(true)
    })
  })
})
