import Vue from 'vue'
import Vuex from 'vuex'

import { version } from '../../package.json'
import user from './modules/user'
import app from './modules/app'
import mock from './modules/mock'
import group from './modules/group'
import project from './modules/project'
import dashboard from './modules/dashboard'
import wallpaper from './modules/wallpaper'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    modules: {
      app: {
        state: {
          version: version,
          readChangelog: false
        },
        ...app
      },
      mock: {
        state: {
          list: [],
          project: {},
          keywords: '',
          pageIndex: 1,
          editorData: {
            mock: null,
            baseUrl: ''
          }
        },
        ...mock
      },
      user: {
        state: {
          id: '',
          name: '',
          nickName: '',
          headImg: '',
          token: ''
        },
        ...user
      },
      group: {
        state: {
          list: []
        },
        ...group
      },
      project: {
        state: {
          list: [],
          keywords: '',
          pageIndex: 1,
          projectType: '',
          groupId: '',
          filterByAuthor: 0
        },
        ...project
      },
      dashboard: {
        state: {
          total: {
            userCount: 0,
            mockCount: 0,
            projectCount: 0,
            mockUseCount: 0
          },
          today: {
            userCount: 0,
            mockCount: 0,
            projectCount: 0,
            mockUseCount: 0
          },
          users: []
        },
        ...dashboard
      },
      wallpaper: {
        state: {
          copyright: null,
          url: ''
        },
        ...wallpaper
      }
    }
  })
}
