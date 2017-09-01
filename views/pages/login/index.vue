<template>
  <div class="em-index">
    <transition name="zoom">
      <div class="em-index__login" v-if="page === 0">
        <img src="/public/images/easy-mock.png">
        <p>伪造数据，我们更高效</p>
        <p>但，不仅于此</p>
        <transition name="fadeUp" mode="out-in">
          <i-button type="primary" long @click.stop="start" v-if="!isLogin" key="start">开始吧</i-button>
          <i-button type="success" long @click.stop="login" v-else key="login">登录</i-button>
        </transition>
        <transition name="fadeLeft">
          <div v-show="isLogin" v-click-outside="onClickOutside">
            <i-input size="large" placeholder="用户名，没有会自动注册哦" ref="user" v-model="userName" @on-enter="login"></i-input>
            <i-input size="large" placeholder="密码" type="password" v-model="password" @on-enter="login"></i-input>
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
      </div>
      <transition name="fade">
        <div class="fullscreen-by" v-if="wallpaperCopyright">
          <div v-if="wallpaperCopyright.name === 'Bing'">
            <a :href="wallpaperCopyright.link" target="_blank">
              由 <strong>{{wallpaperCopyright.name}}</strong>
            </a> 提供
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
      <div class="about-btn" @click="page = 1">Easy Mock 是什么？</div>
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
            是一个可视化，并且能快速生成模拟数据的服务。
          </div>
        </transition-group>
        <Row :gutter="100">
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <img src="/public/images/icon-swagger.png" style="margin-left: 1px;">
                </div>
                <h2>Swagger</h2>
                <p>这是一个重磅级特性，通过 Swagger 只需1秒就能创建好项目所有的 Mock 接口，效率瞬间提高了 99%。</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <img src="/public/images/icon-mock.png" style="margin-left: 1px;">
                </div>
                <h2>Mock.js</h2>
                <p>也许你用过这个工具，很棒！现在 Easy Mock 内置了 Mock.js，我们可以更愉快的伪造数据了。</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <img src="/public/images/icon-command.png">
                </div>
                <h2>Easy Mock CLI</h2>
                <p>CLI 是一个基于 Easy Mock 快速生成 api.js 的命令行工具。有了它，你再也不需要手动创建 api.js 了。</p>
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
                <h2>文档</h2>
                <p>为了让你掌握 Easy Mock，我们提供了非常详尽的使用文档。如果你发现问题或是建议可以与我们进行反馈。</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <Icon type="ribbon-b"></Icon>
                </div>
                <h2>响应式数据</h2>
                <p>想要数据联动那是不可能了，不过 Easy Mock 支持响应式数据。通过判断入参返回对应的数据。</p>
              </div>
            </transition>
          </i-col>
          <i-col span="8">
            <transition name="zoom">
              <div v-show="featureVisible">
                <div class="feature-icon">
                  <Icon type="lightbulb"></Icon>
                </div>
                <h2>语法提示</h2>
                <p>你也许时常忘记 Mock.js 的语法，不过没关系。现在只需要在编辑器里输入 em 就能获得相应提示。</p>
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
import cookie from 'react-cookie'
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
          cookie.save(
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
            title: '提示',
            content: '该用户不存在, 是否根据当前输入的用户名和密码注册用户?注：请妥善保管好你的密码，目前无法提供找回密码的通道。',
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
          this.$Message.success('注册成功')
          this.login()
        }
      })
    }
  }
}
</script>
