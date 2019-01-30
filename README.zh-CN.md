<p align="center"><a href="https://easy-mock.com" target="_blank"><img width="100"src="http://img.souche.com/20170509/png/fff9d8506199c4bf8cc53bad9d849215.png"></a></p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D8.9.1-green.svg?style=flat" alt="Node.js Version"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/mongo-%3E%3D3.4.1-green.svg?style=flat" alt="MongoDB Version"></a>
  <a href="https://redis.io"><img src="https://img.shields.io/badge/redis-%3E%3D4.0-green.svg?style=flat" alt="Redis Version"></a>
  <a href="https://circleci.com/gh/easy-mock/easy-mock/tree/dev"><img src="https://circleci.com/gh/easy-mock/easy-mock/tree/dev.svg?style=svg" alt="Build Status"></a>
  <a href="https://codecov.io/github/easy-mock/easy-mock?branch=dev"><img src="https://img.shields.io/codecov/c/github/easy-mock/easy-mock/dev.svg" alt="Coverage Status"></a>
  <a href="http://standardjs.com"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="js-standard-style"></a>
  <a href="https://opensource.org/licenses/GPL-3.0"><img src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" alt="License"></a>
  <a href="https://discord.gg/DdhQnaS"><img src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" alt="Chat"></a>
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
- 支持 [Swagger](https://swagger.io) | OpenAPI Specification ([1.2](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/1.2.md) & [2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) & [3.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md))
  - 基于 Swagger 快速创建项目
  - 支持显示接口入参与返回值
  - 支持显示实体类
- 支持灵活性与扩展性更高的响应式数据开发
- 支持自定义响应配置（例：status/headers/cookies）
- 支持 [Mock.js](http://mockjs.com/) 语法
- 支持 [restc](https://github.com/ElemeFE/restc) 方式的接口预览

## 链接

- [在线使用文档](https://easy-mock.com/docs)
- [Easy Mock CLI](https://github.com/easy-mock/easy-mock-cli) - 基于 Easy Mock 快速生成 api.js 的命令行工具。

## 快速开始

> 在开始之前，假设你已经成功安装了 [Node.js](https://nodejs.org)（**v8.x, ~~不支持 v10.x~~**）& [MongoDB](https://www.mongodb.com)（**>= v3.4**）& [Redis](https://redis.io)（**>= v4.0**）。

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
  "port": 7300,
  "host": "0.0.0.0",
  "pageSize": 30,
  "proxy": false,
  "db": "mongodb://localhost/easy-mock",
  "unsplashClientId": "",
  "redis": {
    "keyPrefix": "[Easy Mock]",
    "port": 6379,
    "host": "localhost",
    "password": "",
    "db": 0
  },
  "blackList": {
    "projects": [], // projectId，例："5a4495e16ef711102113e500"
    "ips": [] // ip，例："127.0.0.1"
  },
  "rateLimit": { // https://github.com/koajs/ratelimit
    "max": 1000,
    "duration": 1000
  },
  "jwt": {
    "expire": "14 days",
    "secret": "shared-secret"
  },
  "upload": {
    "types": [".jpg", ".jpeg", ".png", ".gif", ".json", ".yml", ".yaml"],
    "size": 5242880,
    "dir": "../public/upload",
    "expire": {
      "types": [".json", ".yml", ".yaml"],
      "day": -1
    }
  },
  "ldap": {
    "server": "", // 设置 server 代表启用 LDAP 登录。例："ldap://localhost:389" 或 "ldaps://localhost:389"（使用 SSL）
    "bindDN": "", // 用户名，例："cn=admin,dc=example,dc=com"
    "password": "",
    "filter": {
      "base": "", // 查询用户的路径，例："dc=example,dc=com"
      "attributeName": "" // 查询字段，例："mail"
    }
  },
  "fe": {
    "copyright": "",
    "storageNamespace": "easy-mock_",
    "timeout": 25000,
    "publicPath": "/dist/"
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

## 版本发布

[Release](https://github.com/easy-mock/easy-mock/releases) 中记录了每个版本的详细更改。

## 贡献

Easy Mock 目前由[大搜车无线架构团队](http://f2e.souche.com/blog/)进行维护。如有问题，欢迎提出 [Issues](https://github.com/easy-mock/easy-mock/issues/new)，并通过 [Pull Request](https://github.com/easy-mock/easy-mock/pulls) 共同维护。不过在此之前，请务必阅读这份[贡献指南](https://github.com/easy-mock/easy-mock/blob/master/.github/CONTRIBUTING.md)。

## 实时反馈

实时问题可以加 QQ 群 595325417 进行反馈，当然也可以扫描下面的二维码加群。

<img src="http://img.souche.com/f2e/4cc362927ef7d1ba46de59097330955a.png" width="260px">

## 在使用的团队或公司

如有内网部署，请务必[告诉我们](https://github.com/easy-mock/easy-mock/issues/47)

* [Souche inc | 大搜车](https://blog.souche.com/)
* [Ruff](https://ruff.io/zh-cn/)
* [Qiniu | 七牛](https://qiniu.com/)
* [Head Spring | 恒达时讯](http://www.hdsxtech.com/)
* [Digital Union | 数字联盟](https://www.shuzilm.cn/)
* [CityTogo | 兔狗家装](http://tugou.com/)
* [Mistong | 铭师堂](http://www.mistong.com/)
* [Tuotuo Internet | 妥妥网络](https://www.finger66.com/web)
* [Straight flush | 同花顺](http://www.10jqka.com.cn/)
* [360 Enterprise Security | 360企业安全集团](http://www.360.net/)
* [MeiTuan | 美团网](http://www.meituan.com)
* [Wenba. Inc | 上海谦问万答吧云计算科技有限公司 AI学部门](http://www.ailearn100.com/)
* [PPMoney | 万惠集团](https://www.ppmoney.com/)
* [Mysoft Yunke | 明源云客](http://www.myunke.com/)
* [GeekPark | 极客公园](http://geekpark.net/)
* [Enation Soft Co., Ltd | 易族智汇（北京）科技有限公司](http://www.javamall.com.cn/)
* [Harmony Cloud | 杭州谐云科技有限公司](http://harmonycloud.cn/)
* [China Literature | 阅文集团](http://ir.yuewen.com/cn/)
* [huodongxing | 活动行](http://www.huodongxing.com)
* [kinhom | 金海马商业集团](http://www.kinhom.com/)
* [yuntongxun | 北京容联易通信息技术有限公司](http://www.yuntongxun.com/)
* [YHD | 1号店](http://www.yhd.com/)
* [51NB | 51信用卡](https://web.u51.com/u51-pc)
* [Yunlai inc | 云来网络](http://www.yunlai.cn/)
* [wozaijia | 我在家家居](http://www.wozaijia.com/)
* [FOR U TRUCKING | 福佑卡车](https://www.fuyoukache.com/)
* [GUANLAN NETWORKS(HANGZHOU) CO.,LTD | 丁香园](http://www.dxy.cn/)
* [Bindo Labs Limited](https://bindopos.com/en/)
* [Value Simplex | 熵简科技](http://valuesimplex.com)
* [Shanghai Mingyun | 上海明运](http://www.mingluck.com/)
* [Feidai | 深圳飞贷金融科技](https://www.feidai.com/)
* [cibfintech | 兴业数字金融](http://www.cibfintech.com)
* [广州三人行壹佰教育](http://www.100.com)
* [bangdao-tech | 邦道科技](https://www.bangdao-tech.com/)
* [CGB | 广发银行](www.cgbchina.com.cn)
* [Budiot | 萌发物联&玖竹科技](https://www.budiot.com.cn)
* [ZTE | 中兴通讯股份有限公司](https://www.zte.com.cn)
* [Envision Digital | 远景智能](https://developer.envisioncn.com/devportal/index.html#/main)
* [Jianshu | 简书](https://www.jianshu.com)
* [HYPERS | 宏路数据](https://www.hypers.com/)
* [yunlong tech | 成都云隆科技有限公司](http://www.yunlongtech.com/)
* [taojiujiu tech | 涛舅舅网络科技有限公司](http://www.tao-jiujiu.com/)
* [shunfeng tongcheng tech | 北京顺丰同城科技有限公司](http://www.sf-yoohoo.com)
* [bread finance | 面包财经](https://www.mbcaijing.com)
* [Jimi | 机蜜](https://www.jimistore.com)
* [zhongan | 众安科技信息技术服务有限公司](https://www.zhongan.io)
* [verystar | 上海费芮网络科技有限公司](https://www.verystar.net)
* [lanren | 懒人听书](https://www.lrts.me)
* [IBPS | 广州流辰信息技术有限公司](http://www.bpmhome.cn)
* [StarZP | 星众派](http://www.xzpql.com/)
* [Shijiazhuang banknote printing corporation | 石家庄印钞有限公司](http://sjzyc.cbpm.cn)

## Core Contributors

<table id="contributors">
<tr>
  <td>
    <a href="https://github.com/chuangker">
      <img src="https://avatars3.githubusercontent.com/u/7939566?v=4&s=100"><br><span>chuangker</span>
    </a>
  </td>
  <td>
    <a href="https://github.com/XadillaX">
      <img src="https://avatars0.githubusercontent.com/u/2842176?v=4&s=100"><br><span>XadillaX</span>
    </a>
  </td>
  <td>
    <a href="https://github.com/ostoc">
      <img src="https://avatars2.githubusercontent.com/u/3025708?v=4&s=100"><br><span>ostoc</span>
    </a>
  </td>
  <td>
    <a href="https://github.com/xinyu198736">
      <img src="https://avatars3.githubusercontent.com/u/897401?v=4&s=100"><br><span>xinyu198736</span>
    </a>
  </td>
</tr>
</table>

## License

[GPL-3.0](https://opensource.org/licenses/GPL-3.0)
