'use strict'

const _ = require('lodash')
const config = require('config')
const jwt = require('jsonwebtoken')

const util = require('../util')
const mockUtil = require('../util/mock')
const ft = require('../models/fields_table')
const { UserProxy, ProjectProxy, MockProxy } = require('../proxy')

const jwtSecret = config.get('jwt.secret')
const jwtExpire = config.get('jwt.expire')

module.exports = class UserController {
  /**
   * 用户注册
   * @param Object ctx
   */

  static async register (ctx) {
    const name = ctx.checkBody('name').notEmpty().len(4, 20).value
    const password = ctx.checkBody('password').notEmpty().len(6, 20).value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    let user = await UserProxy.getByName(name)

    if (user) {
      ctx.body = ctx.util.refail('用户名已被使用')
      return
    }

    const newPassword = util.bhash(password)

    user = await UserProxy.newAndSave(name, newPassword)

    await ProjectProxy
      .newAndSave({
        user: user.id,
        name: '演示项目',
        url: '/example',
        description: '已创建多种 Mock 类型，只需点击预览便可查看效果。亦可编辑，也可删除。'
      })
      .then(projects => {
        const projectId = projects[0].id
        const apis = mockUtil.examples.map(item => ({
          project: projectId,
          description: item.desc,
          method: item.method,
          url: item.url,
          mode: item.mode
        }))
        MockProxy.newAndSave(apis)
      })

    ctx.body = ctx.util.resuccess()
  }

  /**
   * 用户登录
   * @param Object ctx
   */

  static async login (ctx) {
    const name = ctx.checkBody('name').notEmpty().value
    const password = ctx.checkBody('password').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const user = await UserProxy.getByName(name)

    if (!user) {
      ctx.body = ctx.util.refail('用户不存在')
      return
    }

    const verifyPassword = util.bcompare(password, user.password)

    if (!verifyPassword) {
      ctx.body = ctx.util.refail('用户名或密码错误')
      return
    }

    user.token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpire })

    ctx.body = ctx.util.resuccess(_.pick(user, ft.user))
  }

  /**
   * 更新用户信息
   * @param Object ctx
   */

  static async update (ctx) {
    const password = ctx.checkBody('password').empty().len(6, 20).value
    const nickName = ctx.checkBody('nick_name').empty().len(2, 20).value
    const headImg = ctx.checkBody('head_img').empty().isUrl(null, { allow_underscores: true, allow_protocol_relative_urls: true }).value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const user = await UserProxy.getById(ctx.state.user.id)

    user.nick_name = nickName || /* istanbul ignore next */ user.nick_name
    user.head_img = headImg || /* istanbul ignore next */ user.head_img
    user.password = password ? util.bhash(password) : /* istanbul ignore next */ user.password

    await UserProxy.update(user)

    ctx.body = ctx.util.resuccess()
  }

  /**
   * 获取用户列表
   * @param Object ctx
   */

  static async list (ctx) {
    const pageSize = ctx.checkQuery('page_size')
      .empty().toInt().gt(0).default(config.get('pageSize')).value
    const pageIndex = ctx.checkQuery('page_index')
      .empty().toInt().gt(0).default(1).value
    const keywords = ctx.query.keywords

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const opt = {
      skip: (pageIndex - 1) * pageSize,
      limit: pageSize,
      sort: '-create_at'
    }

    const where = {
      _id: {
        $ne: ctx.state.user.id
      }
    }

    if (keywords) {
      const keyExp = new RegExp(keywords)
      where.$or = [{
        name: keyExp
      }, {
        nick_name: keyExp
      }]
    }

    const users = await UserProxy.find(where, opt)

    ctx.body = ctx.util.resuccess(
      users.map(user => _.pick(user, ft.user))
    )
  }
}
