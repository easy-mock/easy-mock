import Vue from 'vue'
import iView from 'iview'
import config from 'config'
import VueLocalStorage from 'vue-ls'
import { sync } from 'vuex-router-sync'
import vClickOutside from 'v-click-outside'

import '../styles/index.css'
import { initAPI } from '../api'
import { createStore } from '../store'
import { createRouter } from '../router-config'
import App from '../components/app'
import Add from '../components/add'
import Spots from '../components/spots'
import Header from '../components/header'
import Loading from '../components/loading'
import Placeholder from '../components/placeholder'
import ShapeShifter from '../components/shape-shifter'
import KeyboardShort from '../components/keyboard-short'
import AnimatedInteger from '../components/animated-integer'

if (typeof window !== 'undefined') {
  Vue.use(require('vue-shortkey'), {
    prevent: ['input', 'textarea']
  })
}

Vue.use(iView)
Vue.use(vClickOutside)
Vue.use(VueLocalStorage, {
  namespace: config.storageNamespace
})
Vue.component(Add.name, Add)
Vue.component(Spots.name, Spots)
Vue.component(Header.name, Header)
Vue.component(Loading.name, Loading)
Vue.component(Placeholder.name, Placeholder)
Vue.component(Placeholder.name, Placeholder)
Vue.component(ShapeShifter.name, ShapeShifter)
Vue.component(KeyboardShort.name, KeyboardShort)
Vue.component(AnimatedInteger.name, AnimatedInteger)

Vue.mixin({
  data () {
    return {
      pageAnimated: false
    }
  },
  mounted () {
    this.pageAnimated = true
  }
})

export function createApp () {
  const store = createStore()
  const router = createRouter()
  sync(store, router)
  initAPI(router)
  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })
  return { app, router, store }
}
