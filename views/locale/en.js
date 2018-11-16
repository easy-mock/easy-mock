export default {
  confirm: {
    title: 'Notification'
  },
  p: {
    dashboard: {
      header: {
        title: 'Dashboard',
        description: 'Display your application usage in real time.'
      },
      total: {
        user: 'Total Users | ',
        mock: 'Total Mocks | ',
        project: 'Total Projects | ',
        mockUse: 'Total Mock Usage | '
      },
      today: {
        user: 'New Users | ',
        mock: 'New Mocks | ',
        project: 'New Projects | ',
        mockUse: 'Mock Usage Today | '
      }
    },
    docs: {
      header: {
        title: 'Docs | Release Notes',
        description: 'Read docs and use Easy Mock like pro. | Never stop updating.'
      }
    },
    group: {
      header: {
        title: 'Team Projects',
        description: 'Teams you created or joined.'
      },
      modal: {
        tab: {
          create: 'Create New Team | Name | Make your team name spical to avoid accidently access',
          join: 'Join a Team | Name | Please type team name',
          edit: 'Edit Team | Name | Make your team name spical to avoid accidently access'
        }
      },
      placeholder: 'Not matched team founded. | Create your first team to start cooperating :)',
      keyboards: [{
        category: 'Action',
        list: 'Create New Teams'
      }],
      confirm: {
        delete: {
          content: 'You will <strong>dismiss</strong> or <strong>quit</strong> team <strong>{name}</strong> , are you sure?'
        }
      },
      create: {
        success: 'Create success'
      },
      update: {
        success: 'Update success'
      },
      remove: {
        success: 'Remove success'
      },
      join: {
        success: 'Alread joined {groupName}',
        warning: '{groupName} not exsit'
      }
    },
    login: {
      description: 'Mock more efficiently | ',
      form: {
        button: 'Let\'go | Login',
        placeholder: 'Username, will register if user doesn\'t exsit | LDAP Username',
        password: 'Password'
      },
      about: 'What is Easy Mock? | A vitrual API mock up tool, and generate mock up data.',
      feature: [
        'Swagger | Kickass feature, using Swagger to create Mock API in few seconds, increase efficiency up to 99%.',
        'Mock.js | Maybe you used this tool, greate! Now Easy Mock integrated Mock.js, it mockes up data more fast.',
        'Easy Mock CLI | CLI helps you to generate api.js file. No need write api.js manualy.',
        'Docs | We provide comprehensive documents to help you master Easy Mock. Contact us, if you found bugs or have feedback.',
        'Responsive Data | Easy Mock suport responsive data. It reponses data based on request query parameters.',
        'Syntax Lint | Forget syntax of Mock.js? No problem. Now type em in editor for syntax lint.'
      ],
      confirm: {
        register: {
          content: 'User does\'t exsit, do you want create a new user with this username and password? Notice: You cannot retrieve your password if you forget in this version',
          success: 'Register Success'
        }
      }
    },
    new: {
      header: {
        title: 'Create New Project',
        description: 'Start your next amazing new project'
      },
      form: {
        name: 'Belongs To / Project Name | Make it shot and expressive, e.g.：petstore',
        url: 'Base URL | Make it shot and expressive, e.g.：/nba',
        description: 'Description | Will be project name if null',
        swagger: 'Swagger Docs API | Optional | If backend provides Swagger Doc (without authentication error), Easy Mock will create Mock based on Swagger API address you provide.',
        member: ['Ask people join for collaboration', 'Optional | Lose effectiveness under team project', 'Support fuzzy search, user nickname, username'],
        confirm: 'Please type in the name of the project to confirm. | Project name | This action <strong>CANNOT<strong> be undone. This will permanently delete project:',
        button: {
          delete: 'Delete Project',
          create: 'Create Project',
          update: 'Save'
        },
        success: {
          create: 'Create Success',
          update: 'Update Success',
          delete: '{name} is deleted'
        },
        error: {
          groupIsNull: 'Please select the project belongs to'
        }
      },
      formatError: 'File only supports JSON/YML format',
      uploadSuccess: 'Upload Success | Upload Success, The file will expire at {date}'
    },
    profile: {
      header: {
        title: 'Edit Profile',
        description: 'Personalize your profile'
      },
      modal: {
        title: 'View Profile Picture'
      },
      form: {
        language: 'Language',
        nickName: 'Nick Name',
        password: 'Password',
        passwordCheck: 'Confirm password',
        update: 'Update Profile',
        avatar: 'Profile Picture',
        upload: 'Upload New Picture'
      },
      formatError: 'Unsupported picture formate | {name} is not support, please upload *.jpg or *.png picture.',
      updateSuccess: 'Update Success | Please login again to check changes.',
      validateError: 'Password is not matching!'
    },
    project: {
      header: {
        title: ['Personal Project', '{groupName}', 'Work Station'],
        description: ['Here are all your personal projects, also projects you are working with.', 'Welcome join group {groupName}, Let\'s Mock up together.', 'Add projects to Work Station for faster access.']
      },
      placeholder: ['Wanna finish work faster? Let\'s Mock up。', 'Team Project is perfect for cooperation.', 'Wanna work faster? Add to projects to Work Station.', 'No match founded'],
      filter: ['All', 'Created', 'Joined'],
      cloneSuccess: 'Copy Success',
      copySuccess: 'Project address is in clipboard',
      deleteSuccess: '{name} is deleted',
      modal: {
        delete: {
          title: 'Confirm Delete',
          description: 'Please type in the name of the project to confirm. | This action <strong>CANNOT<strong> be undone. This will permanently delete project:',
          button: 'Delete',
          placeholder: 'Project name'
        }
      },
      control: ['Copy Project Address', 'Copy Project', 'Delete Project']
    },
    detail: {
      header: {
        description: ['Personal Project', 'Team Project']
      },
      nav: ['Mock List', 'Setting'],
      workbench: 'Work Station',
      download: 'Downlaod as zip file | Download',
      member: 'Member List',
      keyboards: [
        { category: 'Navigation' },
        { category: 'Action', list: ['Create new Mock', 'Add / Remove Work Station', 'Sync with Swagger'] }
      ],
      columns: ['Description', 'Action'],
      action: ['Preview Mock', 'Edit Mock', 'Copy Mock Address', 'Copy', 'Delete'],
      copySuccess: 'Project address is in clipboard',
      syncSwagger: {
        action: 'Sync Swagger',
        warning: 'Please set up Swagger API address in settings page',
        confirm: 'This will sync Swagger API, do you want contiune?',
        success: 'Sync Success',
        syncResult: '同步结果',
        syncFailed: {
          title: '部分接口同步失败',
          desc: '接口中存在语法错误，请检查是否为标准 JSON 格式（例：被忽略的双引号、定义方法等）。'
        }
      },
      remove: {
        confirm: ['This action <strong>CANNOT<strong> be undone. Are you sure want to delete selected row?', 'This action <strong>CANNOT<strong> be undone. Do you want contiune?'],
        success: 'Delete Success'
      },
      create: {
        action: 'Create Mock',
        success: 'Create Success'
      },
      expand: {
        description: 'Description',
        tab: ['Request Parameters', 'Response Parameters'],
        columnsRequest: ['Parameter', 'Description', 'Parameter Type', 'Data Type'],
        columnsResponse: ['Status Code', 'Description'],
        defaultDescription: 'Too layz to inlude a description'
      },
      editor: {
        title: ['Update Mock', 'Create New Mock'],
        action: ['Updae', 'Create'],
        autoClose: 'Auto Close',
        control: ['Format', 'Preview', 'Close'],
        submit: {
          error: ['Mock data can\'t be null', 'Please check data definiation is correct.'],
          updateSuccess: 'Update Success'
        }
      }
    }
  },
  c: {
    keyboardShort: {
      modalTitle: 'Keyboard Shortcuts',
      keyboards: [
        { category: 'Global Navigations', list: ['Personal Projects', 'Team Projects', 'Work Station', 'Docs'] },
        { category: 'Global Actions', list: ['Create New Project', 'Search'] }
      ]
    },
    layout: {
      menu: [
        ['Project', 'Personal Project', 'Team Project'],
        'Work Station', 'Dashboard', 'Docs',
        ['More', 'API Generator', 'Mock Syntax'],
        ['Edit Profile', 'Logout', 'Login']
      ]
    },
    logOut: {
      text: 'Redirecting...'
    }
  }
}
