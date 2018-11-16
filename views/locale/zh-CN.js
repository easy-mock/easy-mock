export default {
  confirm: {
    title: '提示'
  },
  p: {
    dashboard: {
      header: {
        title: '数据',
        description: '这里将实时显示应用的使用情况。'
      },
      total: {
        user: '累积用户 | 位',
        mock: '累积接口 | 个',
        project: '累积项目 | 个',
        mockUse: '接口累积调用 | 次'
      },
      today: {
        user: '新增用户 | 位',
        mock: '新增接口 | 个',
        project: '新增项目 | 个',
        mockUse: '今日接口累积调用 | 次'
      }
    },
    docs: {
      header: {
        title: '文档 | 更新日志',
        description: '阅读文档能使你完全掌握 Easy Mock 的使用。 | 更新永无止境，只为让你开心。'
      }
    },
    group: {
      header: {
        title: '团队项目',
        description: '这里将展示你所创建的以及加入的团队。'
      },
      modal: {
        tab: {
          create: '创建团队 | 团队名称 | 建议名字取特殊一点，防止别人误加入',
          join: '加入团队 | 团队名称 | 请输入团队名称',
          edit: '编辑团队 | 团队名称 | 建议名字取特殊一点，防止别人误加入'
        }
      },
      placeholder: '没有匹配到相关团队。| 想一起玩吗？快来创建团队呀。',
      keyboards: [{
        category: '操作',
        list: '新建团队'
      }],
      confirm: {
        delete: {
          content: '此操作将 <strong>解散</strong> 或 <strong>退出</strong> 团队 <strong>{name}</strong> , 是否继续?'
        }
      },
      create: {
        success: '创建成功'
      },
      update: {
        success: '更新成功'
      },
      remove: {
        success: '操作成功'
      },
      join: {
        success: '已加入 {groupName}',
        warning: '{groupName} 不存在'
      }
    },
    login: {
      description: '伪造数据，我们更高效 | 但，不仅于此',
      form: {
        button: '开始吧 | 登录',
        placeholder: '用户名，没有会自动注册哦 | LDAP 用户名',
        password: '密码'
      },
      about: 'Easy Mock 是什么？| 是一个可视化，并且能快速生成模拟数据的服务。',
      feature: [
        'Swagger | 这是一个重磅级特性，通过 Swagger 只需1秒就能创建好项目所有的 Mock 接口，效率瞬间提高了 99%。',
        'Mock.js | 也许你用过这个工具，很棒！现在 Easy Mock 内置了 Mock.js，我们可以更愉快的伪造数据了。',
        'Easy Mock CLI | CLI 是一个基于 Easy Mock 快速生成 api.js 的命令行工具。有了它，你再也不需要手动创建 api.js 了。',
        '文档 | 为了让你掌握 Easy Mock，我们提供了非常详尽的使用文档。如果你发现问题或是建议可以与我们进行反馈。',
        '响应式数据 | 想要数据联动那是不可能了，不过 Easy Mock 支持响应式数据。通过判断入参返回对应的数据。',
        '语法提示 | 你也许时常忘记 Mock.js 的语法，不过没关系。现在只需要在编辑器里输入 em 就能获得相应提示。'
      ],
      confirm: {
        register: {
          content: '该用户不存在, 是否根据当前输入的用户名和密码注册用户?注：请妥善保管好你的密码，目前无法提供找回密码的通道。',
          success: '注册成功'
        }
      }
    },
    new: {
      header: {
        title: '创建项目',
        description: '创建一个令人愉快的项目。'
      },
      form: {
        name: '归属 / 项目名 | 尽量简短表意。例：petstore',
        url: '项目基础 URL | 尽量简短表意。例：/nba',
        description: '项目描述 | 不填默认为项目名',
        swagger: 'Swagger Docs API | 可选 | 如果后台有提供 Swagger 文档（并且没有验证授权的问题）, 于是我们可以在此处填写 Swagger 的接口地址, Easy Mock 会自动基于此接口创建 Mock 接口.',
        member: ['邀请成员 协同编辑', '可选 | 团队项目下，该配置不生效', '用户昵称、用户名，支持模糊匹配'],
        confirm: '请输入项目名称以进行确认 | 项目名确认 | 出于某些原因，删除也许会失败。但如果你执意删除，必须知道此操作无法撤消，这将永久删除',
        button: {
          delete: '删除项目',
          create: '创建',
          update: '保存'
        },
        success: {
          create: '创建成功',
          update: '更新成功',
          delete: '{name} 已删除'
        },
        error: {
          groupIsNull: '请选择项目归属'
        }
      },
      formatError: '文件仅支持 JSON/YML 格式',
      uploadSuccess: '上传成功 | 上传成功，该文件将在 {date} 失效'
    },
    profile: {
      header: {
        title: '编辑资料',
        description: '个性化设置'
      },
      modal: {
        title: '查看头像'
      },
      form: {
        language: '语言',
        nickName: '昵称',
        password: '密码',
        passwordCheck: '确认密码',
        update: '更新资料',
        avatar: '头像',
        upload: '上传新图片'
      },
      formatError: '文件格式不正确 | 文件 {name} 格式不正确，请上传 jpg 或 png 格式的图片。',
      updateSuccess: '更新成功 | 请重新登录，以完成数据同步。',
      validateError: '两次输入密码不一致!'
    },
    project: {
      header: {
        title: ['个人项目', '{groupName}', '工作台'],
        description: ['这里将展示你的个人项目，当然也包括协同项目。', '欢迎来到{groupName}，与大家一起愉快的 Mock 吧。', '将正在进行的项目添加到工作台中以提高工作效率。']
      },
      placeholder: ['想早点回家吗？快来创建 Mock 呀。', '团队项目更适合多人协作，快来创建项目吧。', '想起飞吗？快去将项目添加到工作台呀。', '没有匹配到相关项目。'],
      filter: ['全部', '我创建的', '我加入的'],
      cloneSuccess: '克隆成功',
      copySuccess: '项目地址已复制到剪贴板',
      deleteSuccess: '{name} 已删除',
      modal: {
        delete: {
          title: '删除确认',
          description: '出于某些原因，删除也许会失败。但如果你执意删除，必须知道此操作无法撤消，这将永久删除 | 请输入项目名称以进行确认。',
          button: '删除',
          placeholder: '项目名确认'
        }
      },
      control: ['复制项目地址', '克隆项目', '删除项目']
    },
    detail: {
      header: {
        description: ['个人项目', '团队项目']
      },
      nav: ['接口列表', '设置'],
      workbench: '工作台',
      download: '打包下载 | 下载',
      member: '项目成员',
      keyboards: [
        { category: '导航' },
        { category: '操作', list: ['创建接口', '添加 / 移除工作台', '同步 Swagger'] }
      ],
      columns: ['描述', '操作'],
      action: ['预览接口', '编辑接口', '复制接口地址', '克隆', '删除'],
      copySuccess: '接口地址已复制到剪贴板',
      syncSwagger: {
        action: '同步 Swagger',
        warning: '请先在设置页配置 Swagger 接口地址',
        confirm: '该操作将同步最新 Swagger 接口，是否继续？',
        success: '同步成功',
        syncResult: '同步结果',
        syncFailed: {
          title: '部分接口同步失败',
          desc: '接口中存在语法错误，请检查是否为标准 JSON 格式（例：被忽略的双引号、定义方法等）。'
        }
      },
      remove: {
        confirm: ['该操作无法撤消，是否继续删除选中行? ', '该操作无法撤消，是否继续删除?'],
        success: '删除成功'
      },
      create: {
        action: '创建接口',
        success: '创建成功'
      },
      expand: {
        description: '描述',
        tab: ['请求参数', '响应参数'],
        columnsRequest: ['参数名', '描述', '参数类型', '数据类型'],
        columnsResponse: ['状态码', '描述'],
        defaultDescription: '太懒了，居然不写描述'
      },
      editor: {
        title: ['更新接口', '创建接口'],
        action: ['更新', '创建'],
        autoClose: '自动关闭',
        control: ['格式化', '预览', '关闭'],
        submit: {
          error: ['接口数据不能为空。', '请检查数据定义是否符合要求。'],
          updateSuccess: '更新成功'
        }
      }
    }
  },
  c: {
    keyboardShort: {
      modalTitle: '键盘快捷键',
      keyboards: [
        { category: '全局导航', list: ['个人项目', '团队项目', '工作台', '文档'] },
        { category: '全局操作', list: ['创建项目', '搜索'] }
      ]
    },
    layout: {
      menu: [
        ['我的项目', '个人项目', '团队项目'],
        '工作台', '数据', '文档',
        ['彩蛋', 'API 生成工具', 'Mock 语法'],
        ['编辑资料', '退出', '登录']
      ]
    },
    logOut: {
      text: '正在跳转...'
    }
  }
}
