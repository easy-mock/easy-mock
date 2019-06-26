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
  <b>Thanks to Souche Inc. which provides the server to hold an online service.</b>
  <br><br>
  <a href="http://www.souche.com" target="_blank">
    <img alt="Souche Inc." src="http://img.souche.com/f2e/08aa2b695f6298302f767b2439db4537.png" width="200">
  </a>
</p>

## Links

- [简体中文介绍](README.zh-CN.md)
- [Online Manual](https://easy-mock.com/docs)
- [Easy Mock CLI](https://github.com/easy-mock/easy-mock-cli) - A command line
  tool to generate an **api.js** file quickly based on **Easy Mock**.

## Introduction

> If you're unable to deploy an **Easy Mock** service by yourself, the
> [online service](https://easy-mock.com) is recommended.

Easy Mock is a persistent service that generates mock data quickly and provids
visualization view.

<p align="center">
  <a href="https://easy-mock.com" target="_blank">
    <img src="http://img.souche.com/f2e/313b36aaa7d0a3af08718c38a2869534.png" width="700px">
  </a>
</p>

## Features

- Support API proxying
- Convenient shortcuts
- Support Collaborative editing
- Support team project
- Support RESTful
- Support [Swagger](https://swagger.io) | OpenAPI Specification ([1.2](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/1.2.md) & [2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) & [3.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md))
  - Create project quickly based on Swagger
  - Support displaying parameters and the return value
  - Support displaying class model
- More flexible and extensible in response data
- Support for custom response configuration (example: status/headers/cookies)
- Use [Mock.js](http://mockjs.com/) schema
- Support [restc](https://github.com/ElemeFE/restc) to preview API

## Quick Start

> Before starting, we assume that you're already have installed
> [Node.js](https://nodejs.org) (**v8.x, ~~v10.x is not supported~~**) & [MongoDB](https://www.mongodb.com) (**>= v3.4**) & [Redis](https://redis.io)（**>= v4.0**）.

### Installation

```shell
$ git clone https://github.com/easy-mock/easy-mock.git
$ cd easy-mock && npm install
```

### Configuration

Find **config/default.json** or create **config/local.json** to overwrite some
configuration.

> Easy Mock will load different configuration files according to your
> environment. Reference to [node-config](https://github.com/lorenwest/node-config)
> to get more information because Easy Mock uses node-config as its
> configuration module.

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
    "projects": [], // projectId, e.g."5a4495e16ef711102113e500"
    "ips": [] // ip, e.g. "127.0.0.1"
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
    "server": "", // Set server to enable LDAP login. e.g. "ldap://localhost:389" or "ldaps://localhost:389"（use SSL）
    "bindDN": "", // Username，e.g. "cn=admin,dc=example,dc=com"
    "password": "",
    "filter": {
      "base": "", // Base where we can search for users，e.g. "dc=example,dc=com"
      "attributeName": "" // e.g. "mail" or "email" etc.
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

**Note**:

- The default value of `publicPath` is `'/dist/'`. You can replace it to your
  own CDN if necessary.
- If you changed some configuration of `fe`, you should run `build` command
  to adapt that changes.

**Background**:

Easy Mock supports two background service,
[Unsplash](https://unsplash.com/developers) and [Bing](http://bing.com).

If you leave `unsplashClientId` blank, the background will be provided by Bing.

### Launch

```sh
$ npm run dev
# Visit http://127.0.0.1:7300
```

## More Commands

```sh
# Build front-end assets
$ npm run build

# Run Easy Mock as production environment (You should run `build` first)
$ npm run start

# Run unit test
$ npm run test

# Test lint
$ npm run lint
```

## Deployment

> Please configure your configuration files before this step.

### PM2

We're recommending you to use [PM2](https://github.com/Unitech/pm2) as your
daemon process.

#### Install PM2 Globally

```sh
$ [sudo] npm install pm2 -g
```

#### Launch via PM2

> You should run `build` before this step.

```sh
$ NODE_ENV=production pm2 start app.js
```

## Releases

Refer to [Release](https://github.com/easy-mock/easy-mock/releases) and you'll
get all the releases and theirs changelog.

## Contributing

Easy Mock is now maintained by
[Mobi-Architecture team of Souche Inc](http://f2e.souche.com/blog/). If you
have any question about this project, you're welcome to post
[Issues](https://github.com/easy-mock/easy-mock/issues/new) or make some
[Pull Requests](https://github.com/easy-mock/easy-mock/pulls). Before
contributing, we think you'd better read the
[contributing guide](https://github.com/easy-mock/easy-mock/blob/master/.github/CONTRIBUTING.md).

## Real-Time Feedback

You may make some real-time feedback via [QQ group](http://en.qq.com/).

> QQ is the most popular IM software in China and you can get it downloaded via
> http://en.qq.com/.

The QQ group number is **595325417**, and here's the QR code of the group:

<img src="http://img.souche.com/f2e/4cc362927ef7d1ba46de59097330955a.png" width="260px">

## Who Deployed Easy Mock

If you deployed Easy Mock in your own server, please [tell us](https://github.com/easy-mock/easy-mock/issues/47)

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
* [Changhong | 长虹](http://cn.changhong.com)
* [bihukeji | 壁虎科技](http://www.91bihu.com)
* [beibeibang | 贝贝帮](https://www.babybang123.com/)
* [BiHu | 壁虎科技](http://www.91bihu.com/)
* [lifebyte | lifebyte](https://www.lifebyte.com.au/)
* [ECNU | 华东师范大学](https://www.ecnu.edu.cn)
* [Elemvision | 中科视元科技（杭州）有限公司](http://www.elemvision.com)
* [fenqile | 分期乐](https://m.fenqile.com/)
* [efeet | 广州一丈网络科技有限公司](http://www.efeet.cn)
* [Rocoinfo | 大诚若谷](http://www.rocoinfo.com)
* [ankerjiedian | 街电](http://www.jiediankeji.com/)
* [cloudbae | 云宝宝大数据产业发展有限责任公司](http://www.cloudbae.cn)

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
