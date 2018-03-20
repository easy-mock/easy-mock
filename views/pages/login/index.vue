<template>
  <div class="em-index">
    <transition name="zoom">
      <div class="em-index__login" v-if="page === 0">
        <img src="/public/images/easy-mock.png">
        <p>{{$tc('p.login.description', 1)}}</p>
        <p>{{$tc('p.login.description', 2)}}</p>
        <transition name="fadeUp" mode="out-in">
          <i-button type="primary" long @click.stop="start" v-if="!isLogin" key="start">{{$tc('p.login.form.button', 1)}}</i-button>
          <i-button type="success" long @click.stop="login" v-else key="login">{{$tc('p.login.form.button', 2)}}</i-button>
        </transition>
        <transition name="fadeLeft">
          <div v-show="isLogin" v-click-outside="onClickOutside">
            <i-input size="large"
              :placeholder="$tc('p.login.form.placeholder', 1)"
              ref="user" v-model="userName" @on-enter="login"></i-input>
            <i-input size="large"
              :placeholder="$tc('p.login.form.placeholder', 2)"
              type="password" v-model="password" @on-enter="login"></i-input>
          </div>
        </transition>
      </div>
    </transition>

    <div class="em-index__section em-index__section--login" style="z-index: 6"
      :class="{'is-old': page > 0}">
      <transition name="fade">
        <div
          class="fullscreen"
          :class="{'is-login': isLogin}"
          ref="wallpaper"
          v-show="wallpaperVisible"></div>
      </transition>
      <div class="links">
        <router-link to="/docs" class="link">Document</router-link>
        <a href="https://github.com/easy-mock/easy-mock-cli" target="_blank" class="link">CLI</a>
        <a href="https://github.com/easy-mock/easy-mock" target="_blank" class="link">GitHub</a>
        <p v-if="copyright">{{copyright}}</p>
      </div>
      <transition name="fade">
        <div class="fullscreen-by" v-if="wallpaperCopyright">
          <div v-if="wallpaperCopyright.name === 'Bing'">
            Photo by
            <a :href="wallpaperCopyright.link" target="_blank">
              <strong>{{wallpaperCopyright.name}}</strong>
            </a>
          </div>
          <div v-else>
            Photo by
            <a :href="wallpaperCopyright.link" target="_blank">
              <strong>{{wallpaperCopyright.name}}</strong>
            </a>
            <strong> / </strong>
            <a href="https://unsplash.com" target="_blank">
              <strong>Unsplash</strong>
            </a>
            <a :href="wallpaperCopyright.link" target="_blank" class="avatar">
              <img :src="wallpaperCopyright.profileImage">
            </a>
          </div>
        </div>
      </transition>
      <div class="about-btn" @click="page = 1">{{$tc('p.login.about', 1)}}</div>
    </div>

    <div class="em-index__section section-about" style="z-index: 5"
      :class="{'is-old': page > 1}">
      <em-shape-shifter v-if="page === 1"></em-shape-shifter>
      <div class="feature-list">
        <transition-group name="fadeDown">
          <div
            class="section-title"
            key="a"
            v-show="featureVisible">
            Easy Mock
          </div>
          <div
            class="section-description"
            key="b"
            v-show="featureVisible">
            {{$tc('p.login.about', 2)}}
          </div>
        </transition-group>
        <Row :gutter="100">
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <img src="/public/images/icon-swagger.png" style="margin-left: 1px;">
                </div>
                <h2>{{$tc('p.login.feature[0]', 1)}}</h2>
                <p>{{$tc('p.login.feature[0]', 2)}}</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <img src="/public/images/icon-mock.png" style="margin-left: 1px;">
                </div>
                <h2>{{$tc('p.login.feature[1]', 1)}}</h2>
                <p>{{$tc('p.login.feature[1]', 2)}}</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <img src="/public/images/icon-command.png">
                </div>
                <h2>{{$tc('p.login.feature[2]', 1)}}</h2>
                <p>{{$tc('p.login.feature[2]', 2)}}</p>
              </div>
            </transition>
          </i-col>
        </Row>
        <Row :gutter="100">
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <Icon type="ios-book"></Icon>
                </div>
                <h2>{{$tc('p.login.feature[3]', 1)}}</h2>
                <p>{{$tc('p.login.feature[3]', 2)}}</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <Icon type="ribbon-b"></Icon>
                </div>
                <h2>{{$tc('p.login.feature[4]', 1)}}</h2>
                <p>{{$tc('p.login.feature[4]', 2)}}</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <Icon type="lightbulb"></Icon>
                </div>
                <h2>{{$tc('p.login.feature[5]', 1)}}</h2>
                <p>{{$tc('p.login.feature[5]', 2)}}</p>
              </div>
            </transition>
          </i-col>
        </Row>
      </div>
    </div>

    <div class="em-index__pagination">
      <div class="dot" :class="{'active': page === 0}" @click="page = 0"></div>
      <div class="dot" :class="{'active': page === 1}" @click="page = 1"></div>
    </div>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import config from 'config'
import Cookies from 'universal-cookie'
import * as api from '../../api'
let resizeTimer

export default {
  name: 'index',
  data () {
    return {
      isLogin: false,
      page: 0,
      userName: this.$ls.get('last-user'),
      password: '',
      copyright: config.copyright,
      featureVisible: false,
      wallpaperVisible: false
    }
  },
  asyncData ({ store }) {
    return store.dispatch('wallpaper/FETCH')
  },
  mounted () {
    const img = new Image()
    img.src = this.$store.state.wallpaper.url
    img.onload = () => {
      this.wallpaperVisible = true
      this.$nextTick(() => {
        this.$refs.wallpaper.style.background = `url(${img.src})`
        this.$refs.wallpaper.style.backgroundSize = 'cover'
        this.$refs.wallpaper.style.backgroundPosition = '50% 50%'
      })
    }
  },
  computed: {
    wallpaperCopyright () {
      return this.$store.state.wallpaper.copyright
    }
  },
  watch: {
    page: function (current) {
      clearTimeout(resizeTimer)
      if (current === 1) {
        resizeTimer = setTimeout(() => {
          this.featureVisible = true
        }, 3000)
      } else {
        this.featureVisible = false
      }
    }
  },
  methods: {
    onClickOutside () {
      if (!this.userName && !this.password) {
        this.isLogin = false
      }
    },
    start () {
      this.isLogin = true
      this.$nextTick(() => {
        this.$refs.user.focus()
      })
    },
    login () {
      const cookies = new Cookies()
      api.u.login({
        messageUnless: ['用户不存在'],
        data: {
          name: this.userName,
          password: this.password
        }
      }).then(res => {
        const body = res.data
        if (body.success) {
          this.$store.commit('user/SET_VALUE', body.data)
          this.$ls.set('user', body.data)
          this.$ls.set('last-user', this.userName)
          cookies.set(
            config.storageNamespace + 'token',
            body.data.token,
            {
              path: '/',
              maxAge: 60 * 60 * 24 * 31
            }
          )
          this.$router.push('/')
        }
      }).catch((res) => {
        if (res.data.message === '用户不存在') {
          this.$Modal.confirm({
            title: this.$t('confirm.title'),
            content: this.$t('p.login.confirm.register.content'),
            onOk: () => {
              this.register()
            }
          })
        }
      })
    },
    register () {
      api.u.register({
        data: {
          name: this.userName,
          password: this.password
        }
      }).then((res) => {
        if (res.data.success) {
          this.$Message.success(this.$t('p.login.confirm.register.success'))
          this.login()
        }
      })
    }
  }
}
</script>
