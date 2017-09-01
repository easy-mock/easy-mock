import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import mock from './modules/mock'
import group from './modules/group'
import project from './modules/project'
import dashboard from './modules/dashboard'
import wallpaper from './modules/wallpaper'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    modules: {
      mock,
      user,
      group,
      project,
      dashboard,
      wallpaper
    }
  })
}
