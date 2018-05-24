## 更新日志

### 1.6.0
*2018-05-24*

**Bug Fixes**
- 改善 Swagger 同步失败时的提示信息，#144

**New Features**
- 接口数据编辑器支持快捷键保存（win: 'Ctrl-S', mac: 'Command-S'），#139
- redis 支持更多配置项，#157
- 支持 LDAP 登录，#138

### 1.5.1
*2018-01-17*

**Bug Fixes**
- 修复因 `BaseURL` 引起的 404

### 1.5.0
*2018-01-16*
> 从这个版本开始启用 **redis** 并升级至 **koa2**，升级前请注意以下事项。

- redis `(>= v4.0)`
- Node.js `(>= v8.9.1)`
- 配置文件优化后（以 `config/default.json` 为准），移除多余配置（如：APIPrefix）并新增一些配置（如：rateLimit），按需完善即可。

**New Features**
- 支持配置 `proxy`
- 支持配置 `host`
- 支持请求速率配置
- 支持黑名单配置
- 支持上传 `yaml` 文件

**Refactorings**
- 升级至 koa2
- 当团队可用时，新建项目不再默认选中归属

**Bug Fixes**
- 修复在 `proxy` 模式下，`{xx}` 无法被解析的问题
- 修复在接口列表页下无法添加至工作台的问题

### 1.4.0
*2017-12-01*

**New Features**
- 新增上传接口，#52
- 支持配置上传文件的过期时间(天)
- 支持上传 OAS 文档 (JSON/YML)，#70 #112

### 1.3.6
*2017-11-24*

**New Features**
- 支持 OAS 3.0，#6 #120

**Bug Fixes**
- 修复因 `patch` 方式请求导致失败的问题，#121

### 1.3.5
*2017-11-17*

**New Features**
- login 页支持显示版权信息

### 1.3.4
*2017-11-17*

**New Features**
- 支持配置并显示版权信息
- 支持 `Access-Control-Allow-Credentials` 配置

### 1.3.3
*2017-11-06*

**Bug Fixes**
- 修复因 `while (true) {}` 引起的崩溃问题，#113

### 1.3.2
*2017-11-02*

> 注意：该版本更新后，之前的请求参数，响应参数等信息会异常显示（再次同步 Swagger 即可解决）。

**New Features**
- 版本更新时，文档与更新日志会添加徽标提醒

**Bug Fixes**
- 修复由快捷键引起的无法复制的问题，#32

**Refactorings**
- Swagger 相关代码已迁移至 [Swagger Parser Mock](https://github.com/easy-mock/swagger-parser-mock) 模块，#48 #71 #109

### 1.3.1
*2017-10-17*

**Bug Fixes**
- 修复全屏编辑导航栏显示的问题，#98

### 1.3.0
*2017-09-28*

**New Features**
- 支持国际化
- 支持自定义响应配置，#78
- 接口列表页新增返回顶部按钮
- 更新日志新增问题锚点

**Bug Fixes**
- 修复 state 单例的问题
- 修复 jwt.secret 配置错误的问题
- 修复由 bcrypt 引起的无法安装的问题
- 修复团队项目下邀请成员导致 500 的问题，#33
- 修复邀请成员输入框无法匹配用户名的问题，#45
- 修复由 wallpaper 接口引起的 login 页错误的问题，#39
- 修复由系统路径造成的通过 swagger 创建接口引发路径错误的问题

### 1.2.3
*2017-08-31*

**Bug Fixes**
- 修复接口数据正则表达式失效的问题

**New Features**
- 前端新增 JSON 验证

### 1.2.2
*2017-08-30*

**Refactorings**
- 调整 /dashboard 页最近新增用户条数
- 调整 editor 字号为 15px
- 调整接口列表字号

**Bug Fixes**
- 修复无法统计今日接口累积调用的问题

### 1.2.1
*2017-08-29*

**Performance Improvements**

- 优化 unsplash 图片宽度

### 1.2.0
*2017-08-28*

**New Features**
- 支持 restc 方式的预览
- 新增 `/wallpaper` 接口
- 代理接口支持 Restful 风格的参数
- 支持按创建者获取项目列表

**Bug Fixes**
- 修复项目成员无法编辑项目和接口的问题
- 修复当项目和接口 url 为 `/` 时返回 404 的问题
- 修复因数据模型死循环造成内存泄漏的问题

**Performance Improvements**
- 优化统计接口，增加缓存策略

**Refactorings**
- 前端整体重构
- 接口 `/proxy/cross` 调整为 `/proxy`

### 1.1.11

- 增加 `easy-mock-cli` 导航
- 支持向数据模型的 Function 中注入 Mock 对象
- 重构接口无某类型数据时隐藏相应 Tab
- 优化文档

### 1.1.10

**Bug Fixes**
- 由于缺少 `definitions` 字段导致无法创建接口的问题
- 无法通过 `/project/create/:groupId/by_swagger` 创建项目的问题

### 1.1.9

**Bug Fixes**
- 基于 Swagger 创建 Mock 造成栈溢出的问题
- 参数 Model 被重复创建的问题

### 1.1.8

**New Features**
- 全屏模式编辑下支持 `保存` `格式化` 操作
- 静态资源走 CDN

**Bug Fixes**
- 基于 Swagger 创建 Mock 造成栈溢出的问题
- Swagger allOf 属性无法生成完整数据结构的问题

**Refactorings**
- 基于 Swagger 创建 Mock 的实现
- 基于 Swagger 创建 Mock 失败时将返回具体错误信息
- 团队搜索采用绝对匹配

### 1.1.7

**New Features**
- 添加 _req.params 对象

### 1.1.6

**Bug Fixes**
- 无法基于 Swagger 2.0 创建的问题
- 当 Mock Url 为 / 时无法访问的问题

### 1.1.5

**New Features**
- 查看数据使用量
- 在 Swagger Docs API 旁添加文档锚点

**Bug Fixes**
- BaseUrl 不支持2级以上的问题
- 数据模型格式化失败的问题
- 无法基于 Swagger 2.0 创建的问题

**Refactorings**
- 点击按钮退出全屏

### 1.1.4

**New Features**
- 登录页可取消自动创建用户的流程
- 从统计中跳转进项目

**Bug Fixes**
- 不支持花括号分隔符的问题
- 因包版本不同导致无法编译的问题
- 搜索无法统计 Mock 使用量的问题

### 1.1.3

**Bug Fixes**
- 头像上传没有去掉 `URL` 前缀的问题

### 1.1.2

**New Features**
- 支持根据 `响应数据` 生成 `JavaScript Class Model`
- 支持查看 `Mock 排行榜`

### 1.1.1

**Refactorings**
- `/project/create/:groupId/by_swagger` 支持更新操作

### 1.1.0

**New Features**
- 支持 `JSONP`

**Bug Fixes**
- `swagger_url` 不支持下划线的问题

### 1.0.0

**Bug Fixes**
- 无法更新头像的问题
- `Element UI` 造成的服务端渲异常问题

**Performance Improvements**
- Client
    - 优化体积大小

### 1.0.0-rc.9

**New Features**
- 支持在 `Mock Handler Function` 里获取 `Request` 对象

### 1.0.0-rc.8

**Bug Fixes**
- 无法更新接口参数的问题
- 无法支持 `Swagger 1.2 Model` 为数组的问题

### 1.0.0-rc.7

**New Features**
- 支持基于 `Swagger 2.0` 的创建
- 支持基于 `Swagger` 创建的参数显示
- 支持全屏编辑数据
- 支持数据预加载

**Bug Fixes**
- 无法上传头像的问题

**Refactorings**
- 重构用户身份信息过期的授权方式

### 1.0.0-rc.6

**Bug Fixes**
- 当 `Swagger` 某接口字段类型异常时无法生成文档的问题

**Performance Improvements**
- Server
    - 基于 `Swagger` 创建项目方式的实现
- Client
    - 基于 `Swagger` 创建项目时，不再支持传递 `Cookie`

### 1.0.0-rc.5

**New Features**
- 支持`团队管理`
- 支持`团队类型项目`
- 支持复制团队项目到个人项目
- 以 `Swagger` 创建团队项目

**Bug Fixes**
- 以 `/api` 开头出现的授权失效问题

**Performance Improvements**
- Client
    - 预览
    - 面包屑
    - 文档

### 1.0.0-rc.4

**New Features**
- 新增通过 `Project Ids` 获取 Mock 列表

### 1.0.0-rc.3

**New Features**
- 新增工作台
- 新增文档
- 新增 `Loading` 状态
- 支持 `HTTPS`

**Bug Fixes**
- 修复因窗口宽度导致元素展示不正确的问题
- 修复 Mock 不支持正则和方法的问题
- 修复更新接口查重不正确的问题

**Refactorings**
- 重构 Swagger 更新逻辑，支持增量覆盖式更新
- Project Mock 支持批量插入
- 替换字段 `id` 为 `_id`
- 去掉外键的 `_id`

**Performance Improvements**
- Server
    - 优化删除接口，支持批量删除
    - 添加索引
- Client
    - 优化布局
    - `项目` 和 `Mock` 更新后同步本地数据

### 1.0.0-rc.2

**New Features**
- 增加 `X-Request-Id` 响应头
- 接入单点登录，内网允许并且只允许通过单点登录完成授权
- 增加用户注销接口
- 增加分页显示
- 增加数据统计
- 增加数据导出

**Bug Fixes**
- 修复由 ElementUI 引起的 SSR 渲染失败的问题
- 修复 Safari 上的一些 Bug

**Refactorings**
- Mock Router
- 身份信息持久化

**Performance Improvements**
- Server
    - 优化异常处理
    - 优化响应数据结构
    - 入参验证
    - 错误提示
    - `token` 过期时间变为 `7天`
    - 优化头像生成策略
- Client
    - 配合响应数据结构的优化
    - 介绍页头图切换源地址，加快响应速度
    - 取消编辑后自动关闭弹窗的特性
    - 优化部分页面的元素位置与操作逻辑
    - 优化搜索体验

### 1.0.0-rc.1

**New Features**
- 支持快速复制以创建新项目
- 新增主页，用于介绍 Easy Mock

**Performance Improvements**
- Server
    - 新增代理接口，可实现 `get` 方式的跨域请求
    - `token` 过期时间变为 `2小时`
- Client
    - 完善面包屑导航
    - 优化登录背景获取方式
    - 优化Mock页的创建名称
    - 设置请求超时为 `25s`
    - 优化编辑页头像显示方式
    - 替换头像上传接口

### 1.0.0-rc.0

**New Features**
- 支持创建以项目为单位的 `Mock List`
- 支持简单的数据模型( 纯 `JSON` 对象)
- 支持以 [Mock.js](http://mockjs.com/) 为基础的数据模型
- 支持结合 `Swagger` 快速创建 `Mock List`
- 支持接口代理
- 支持快捷键创建 `Project` 和 `Mock`
- 支持邀请成员，协同编辑
- 支持 `Restful`
- 支持快速复制以创建新接口
