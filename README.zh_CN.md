<p align="center"><a href="https://easy-mock.com" target="_blank"><img width="100"src="http://img.souche.com/20170509/png/fff9d8506199c4bf8cc53bad9d849215.png"></a></p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D7.4.0-green.svg?style=flat" alt="Node.js Version"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/mongo-%3E%3D3.4.1-green.svg?style=flat" alt="MongoDB Version"></a>
  <a href="https://circleci.com/gh/easy-mock/easy-mock/tree/dev"><img src="https://img.shields.io/circleci/project/easy-mock/easy-mock/dev.svg" alt="Build Status"></a>
  <a href="https://codecov.io/github/easy-mock/easy-mock?branch=dev"><img src="https://img.shields.io/codecov/c/github/easy-mock/easy-mock/dev.svg" alt="Coverage Status"></a>
  <a href="http://standardjs.com"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="js-standard-style"></a>
  <a href="https://opensource.org/licenses/GPL-3.0"><img src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" alt="License"></a>
</p>

<p align="center">
  <b>特别感谢在线服务的服务器赞助商</b>
  <br><br>
  <a href="http://www.souche.com" target="_blank">
    <img src="http://img.souche.com/f2e/08aa2b695f6298302f767b2439db4537.png" width="200">
  </a>
</p>

## 介绍

> 如果没有内网部署的条件，推荐使用[在线服务](https://easy-mock.com)。

Easy Mock 是一个可视化，并且能快速生成**模拟数据**的持久化服务。

<p align="center">
  <a href="https://easy-mock.com" target="_blank">
    <img src="http://img.souche.com/f2e/313b36aaa7d0a3af08718c38a2869534.png" width="700px">
  </a>
</p>

## 特性

- 支持接口代理
- 支持快捷键操作
- 支持协同编辑
- 支持团队项目
- 支持 RESTful
- 支持 [Swagger](https://swagger.io) [1.2](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/1.2.md) & [2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
  - 基于 Swagger 快速创建项目
  - 支持显示接口入参与返回值
  - 支持显示实体类
- 支持灵活性与扩展性更高的响应式数据开发
- 支持 [Mock.js](http://mockjs.com/) 语法
- 支持 [restc](https://github.com/ElemeFE/restc) 方式的接口预览

## 链接

- [在线使用文档](https://easy-mock.com/docs)
- [Easy Mock CLI](https://github.com/easy-mock/easy-mock-cli) - 基于 Easy Mock 快速生成 api.js 的命令行工具。

## 快速开始

> 在开始之前，假设你已经成功安装了 [Node.js](https://nodejs.org)（**v7.4** 以上）和 [MongoDB](https://www.mongodb.com)（**v3.4** 以上）。

### 安装

```sh
$ git clone https://github.com/easy-mock/easy-mock.git
$ cd easy-mock && npm install
```

### 配置文件

找到 **config/default.json**，或者创建一个 **config/local.json** 文件，将如下需要替换的字段换成自己的配置即可。

> 不同环境会加载不同的配置文件，在此之前你应该对 [node-config](https://github.com/lorenwest/node-config) 有所了解。

```js
{
  "db": "mongodb://localhost/{数据库名}",
  "unsplashClientId": "可空。背景图配置，见下面说明。",
  "jwt": {
    "secret": "shared-secret"
  },
  "fe": {
    "publicPath": "/dist/",
    "APIPrefix": "http://127.0.0.1:7300/api",
    "uploadAPI": "你的上传接口地址，头像上传需要。",
    "storageNamespace": "cookies & localStorage 的命名空间。"
  }
}
```

**背景图配置：**

登录页的背景图服务目前支持 [Unsplash](https://unsplash.com/developers) 与 [Bing](http://bing.com)。

如果 `unsplashClientId` 配置留空，默认由 Bing 提供服务。

**注意：**

- `publicPath` 默认是 `'/dist/'`。如有需要，可以将其替换成自己的 CDN；
- 关于 `fe` 的配置，一旦发生改变应该重新执行 build 命令。

### 启动

```sh
$ npm run dev
# 访问 http://127.0.0.1:7300
```

## 更多命令

```sh
# 前端静态资源构建打包
$ npm run build

# 以生产环境方式启动，需要提前执行 build
$ npm run start

# 单元测试
$ npm run test

# 语法检测
$ npm run lint
```

## 服务器部署

> 在此之前请先配置好配置文件。

### PM2

当在内网服务器部署时，推荐使用 [PM2](https://github.com/Unitech/pm2) 来守护你的应用进程。

#### 全局安装 PM2

```sh
$ [sudo] npm install pm2 -g
```

#### 用 PM2 启动

> 在此之前，你应该已经完成了 build。

```sh
$ NODE_ENV=production pm2 start app.js
```

### 正确配置 APIPrefix

当在服务器上部署时，我们应该将 `APIPrefix` 配置成服务器的地址。

例如服务地址为 http://example.com 时，`APIPrefix` 应配置为 http://example.com/api。

## 版本发布

[Release](https://github.com/easy-mock/easy-mock/releases) 中记录了每个版本的详细更改。

## 贡献

Easy Mock 目前由[大搜车无线架构团队](http://f2e.souche.com/blog/)进行维护。如有问题，欢迎提出 [Issues](https://github.com/easy-mock/easy-mock/issues/new)，并通过 [Pull Request](https://github.com/easy-mock/easy-mock/pulls) 共同维护。不过在此之前，请务必阅读这份[贡献指南](https://github.com/easy-mock/easy-mock/blob/master/.github/CONTRIBUTING.md)。

## 实时反馈

实时问题可以加 QQ 群 595325417 进行反馈，当然也可以扫描下面的二维码加群。

<img src="http://img.souche.com/f2e/4cc362927ef7d1ba46de59097330955a.png" width="260px">

## 在使用的团队或公司

如有内网部署，请务必[告诉我们](https://github.com/easy-mock/easy-mock/issues/47)

* [大搜车](https://blog.souche.com/)
* [Ruff](https://ruff.io/zh-cn/)

## 核心贡献者

<table id="contributors">
<tr>
  <td>
    <a href="https://github.com/chuangker">
      <img src="https://avatars3.githubusercontent.com/u/7939566?v=4&s=100"><br><span>chuangker</span>
    </a>
  </td>
</tr>
</table>

## License

[GPL-3.0](https://opensource.org/licenses/GPL-3.0)
