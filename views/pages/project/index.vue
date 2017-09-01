<template>
  <div class="em-project">
    <em-placeholder :show="projects.length === 0">
      <Icon :type="keywords ? 'outlet' : 'happy-outline'"></Icon>
      <p>{{keywords ? '没有匹配到相关项目。' : page.placeholder}}</p>
    </em-placeholder>
    <em-keyboard-short></em-keyboard-short>
    <em-header
      :icon="page.icon"
      :title="page.title"
      :description="page.description">
      <Radio-group
        v-model="filterByAuthor"
        type="button"
        @on-change="handleFilter"
        v-if="page.type === 0">
        <Radio label="全部"></Radio>
        <Radio label="我创建的"></Radio>
        <Radio label="我加入的"></Radio>
      </Radio-group>
    </em-header>
    <Modal v-model="removeModal.show" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span> 删除确认</span>
      </p>
      <div>
        <p>出于某些原因，删除也许会失败。但如果你执意删除，必须知道此操作无法撤消，这将永久删除 <strong style="word-break:break-all;">
          {{(removeModal.project.user && removeModal.project.user.nick_name) || (removeModal.project.group && removeModal.project.group.name) }} / {{removeModal.project.name}}</strong>
        </p>
        <p>请输入项目名称以进行确认。</p>
        <i-input style="margin-top: 10px;" v-model="removeModal.inputModel" placeholder="项目名确认"></i-input>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long
          :disabled="removeModal.project.name !== removeModal.inputModel"
          @click="remove">删除</Button>
      </div>
    </Modal>
    <transition name="fade">
      <div class="em-container em-project__list" v-show="pageAnimated">
        <div class="ivu-row">
          <transition-group name="list-complete">
            <div
              class="ivu-col ivu-col-span-6 list-complete-item"
              v-for="(item, index) in projects"
              :key="index">
              <!-- 检查 user.id 防止闪烁 -->
              <div class="em-project__item"
                @click="go(item)"
                :class="{
                  'is-join': page.type === 2 || (page.type === 0 && user.id && item.user._id !== user.id),
                  'is-group': page.type === 1
                }">
                <div class="project-collect">
                  <transition name="zoom" mode="out-in">
                    <Icon :type="item.extend.is_workbench ? 'android-star' : 'android-star-outline'"
                          :key="item.extend.is_workbench"
                          @click.native.stop="handleWorkbench(item.extend)"></Icon>
                  </transition>
                </div>
                <h2>{{item.name}}</h2>
                <div class="project-description">{{item.description}}</div>
                <div class="project-url">{{item.url}}</div>
                <div class="project-member" v-if="page.type === 0">
                  <img :src="item.user.head_img">
                  <img
                    :src="img.head_img"
                    v-for="(img, i) in item.members"
                    v-if="i < 5"
                    :key="i">
                </div>
                <Button-group class="project-control">
                  <Button type="ghost" icon="link" title="复制项目地址" class="copy-url" @click="clip(item)"></Button>
                  <Button type="ghost" icon="ios-copy" title="克隆项目" style="width: 34%;" @click.stop="clone(item)"></Button>
                  <Button type="ghost" icon="trash-b" title="删除项目" @click.stop="removeConfirm(item)"></Button>
                </Button-group>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>
    <em-loading @loading="loading" ref="loading" v-if="page.type !== 2"></em-loading>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import config from 'config'
import Clipboard from 'clipboard'
import debounce from 'lodash/debounce'
import * as api from '../../api'

export default {
  name: 'project',
  data () {
    return {
      filterByAuthor: '全部',
      cliped: false,
      removeModal: {
        show: false,
        project: {},
        inputModel: ''
      }
    }
  },
  asyncData ({ store, route }) {
    store.commit('project/INIT_REQUEST')
    store.dispatch('project/INIT_PAGE', route)
    return store.dispatch('project/FETCH')
  },
  mounted () {
    this.$on('query', debounce((keywords) => {
      this.$store.dispatch('project/QUERY', keywords)
    }, 500))
  },
  computed: {
    page () {
      return this.$store.state.project.page
    },
    projects () {
      return this.$store.state.project.list
    },
    user () {
      return this.$store.state.user
    },
    keywords () {
      return this.$store.state.project.keywords
    }
  },
  watch: {
    '$route': function () {
      this.filterByAuthor = '全部'
      this.$store.commit('project/INIT_REQUEST')
      this.$store.dispatch('project/INIT_PAGE', this.$route)
      this.$store.dispatch('project/FETCH')
    }
  },
  methods: {
    go (project) {
      if (!this.cliped) {
        this.$router.push(`/project/${project._id}`)
      }
    },
    clip (project) {
      const clipboard = new Clipboard('.copy-url', {
        text () {
          return location.origin + config.mockPrefix + project._id + project.url
        }
      })
      this.cliped = true
      clipboard.on('success', (e) => {
        e.clearSelection()
        clipboard.destroy()
        this.cliped = false
        this.$Message.success('项目地址已复制到剪贴板')
      })
    },
    handleFilter (value) {
      let filterByAuthor = 0
      if (value === '我创建的') {
        filterByAuthor = 1
      } else if (value === '我加入的') {
        filterByAuthor = 2
      }
      this.$store.commit('project/INIT_REQUEST')
      this.$store.commit('project/SET_REQUEST_PARAMS', { filterByAuthor })
      this.$store.dispatch('project/FETCH')
    },
    handleWorkbench (projectExtend) {
      this.$store.dispatch('project/WORKBENCH', projectExtend)
    },
    removeConfirm (project) {
      this.removeModal.show = true
      this.removeModal.project = project
      this.removeModal.inputModel = ''
    },
    remove () {
      const projectId = this.removeModal.project._id
      this.$store.dispatch('project/REMOVE', projectId).then(() => {
        this.removeModal.show = false
        this.$Message.success(this.removeModal.project.name + ' 已删除')
        this.$store.commit('project/SET_REQUEST_PARAMS', { pageIndex: 1 })
        this.$store.dispatch('project/FETCH')
      })
    },
    clone (project) {
      return api.project.copy({
        data: { id: project._id }
      }).then((res) => {
        if (res.data.success) {
          this.$Message.success('克隆成功')
          this.$store.commit('project/SET_REQUEST_PARAMS', { pageIndex: 1 })
          this.$store.dispatch('project/FETCH')
        }
      })
    },
    loading () {
      this.$store.dispatch('project/FETCH').then((data) => {
        this.$refs.loading.stop()
        if (data && data.length === 0) {
          this.$refs.loading.destroy()
        }
      })
    }
  }
}
</script>
