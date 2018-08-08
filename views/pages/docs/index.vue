<template>
  <div class="em-docs">
    <em-header
      icon="ios-book"
      :title="page.title"
      :description="page.description">
    </em-header>
    <em-keyboard-short></em-keyboard-short>
    <Back-top>
      <em-add icon="arrow-up-c" :bottom="90"></em-add>
    </Back-top>
    <div class="em-container">
      <transition name="fade">
        <div class="em-docs__content" v-show="pageAnimated">
          <transition name="fade">
            <Affix :offset-top="70" @on-change="changeFixed" v-if="!isChangelog">
              <Menu mode="horizontal" class="em-docs__nav">
                <Submenu :name="'100-' + i" v-for="(parent, i) in nav" :key="i"
                  v-if="parent.children.length > 0">
                  <template slot="title">{{parent.title}}</template>
                  <Menu-group>
                    <Menu-item
                      :name="o"
                      v-for="(item, o) in parent.children"
                      :key="o"
                      @click.native="go(item.id)">
                      {{item.title}}
                    </Menu-item>
                  </Menu-group>
                </Submenu>
                <Menu-item
                  name="101"
                  @click.native="toChangelog">
                  <Badge dot :count="readChangelog ? '0' : '1'">
                    {{$tc('p.docs.header.title', 2)}}
                  </Badge>
                </Menu-item>
              </Menu>
            </Affix>
          </transition>
          <div class="docs-content"
            :class="{'is-fixed': isFixed, 'is-changelog': isChangelog}">
            <transition-group name="fade">
              <docs
                class="markdown-body"
                ref="doc"
                key="doc"
                v-show="!isChangelog">
              </docs>
              <changelog
                class="markdown-body"
                ref="changelog"
                key="changelog"
                v-show="isChangelog">
              </changelog>
            </transition-group>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import docs from './docs'
import docsZh from './docs.zh-CN'
import changelog from '../../../CHANGELOG'

export default {
  name: 'document',
  components: {
    changelog: {
      components: {
        changelog
      },
      render () {
        return <changelog ref="changeLog"></changelog>
      },
      mounted () {
        const lis = this.$refs.changeLog.$el.querySelectorAll('li')
        for (let len = lis.length, i = 0; i < len; i += 1) {
          lis[i].innerHTML = lis[i].innerHTML.replace(/#(\d+)/g, '<a href="https://github.com/easy-mock/easy-mock/issues/$1" target="_blank">#$1</a>')
        }
      }
    },
    docs: {
      components: {
        docs,
        docsZh
      },
      render () {
        const locale = this.$ls.get('locale') || 'zh-CN'
        if (locale === 'en') return <docs></docs>
        return <docs-zh></docs-zh>
      }
    }
  },
  data () {
    return {
      nav: [],
      isFixed: false,
      page: {
        title: '',
        description: ''
      }
    }
  },
  computed: {
    doc () {
      return this.$refs.doc
    },
    isChangelog () {
      return this.$route.path === '/changelog'
    },
    readChangelog () {
      return this.$store.state.app.readChangelog
    },
    appVersion () {
      return this.$store.state.app.version
    }
  },
  mounted () {
    const doc = this.doc
    const docNodes = doc.$el.children
    this.$nextTick(() => {
      const hash = location.hash
      if (hash) {
        location.href = hash
      }
    })
    for (let len = docNodes.length, i = 0; i < len; i += 1) {
      const node = docNodes[i]
      const tagName = node.tagName.toLowerCase()
      if ('h2 h3'.split(' ').indexOf(tagName) !== -1) {
        if (tagName === 'h2') {
          this.nav.push({
            title: node.innerText,
            children: []
          })
        } else {
          this.nav[this.nav.length - 1].children.push({
            id: node.id,
            title: node.innerText
          })
        }
      }
    }
    this.changeRoute()
  },
  watch: {
    '$route': 'changeRoute'
  },
  methods: {
    go (id) {
      location.href = '#' + id
    },
    changeFixed (isFixed) {
      this.isFixed = isFixed
    },
    toChangelog () {
      this.$store.commit('app/SET_READ_CHANGELOG', true)
      this.$ls.set('version', this.appVersion)
      this.$router.push('/changelog')
    },
    changeRoute () {
      this.isFixed = false
      if (this.isChangelog) {
        this.page.title = this.$tc('p.docs.header.title', 2)
        this.page.description = this.$tc('p.docs.header.description', 2)
      } else {
        this.page.title = this.$tc('p.docs.header.title', 1)
        this.page.description = this.$tc('p.docs.header.description', 1)
      }
    }
  }
}
</script>
