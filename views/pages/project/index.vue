<template>
  <div class="em-project">
    <em-placeholder :show="projects.length === 0">
      <Icon :type="keywords ? 'outlet' : 'happy-outline'"></Icon>
      <p>{{keywords ? $t('p.project.placeholder[3]') : page.placeholder}}</p>
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
        <Radio :label="$t('p.project.filter[0]')"></Radio>
        <Radio :label="$t('p.project.filter[1]')"></Radio>
        <Radio :label="$t('p.project.filter[2]')"></Radio>
      </Radio-group>
    </em-header>
    <Modal v-model="removeModal.show" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span> {{$t('p.project.modal.delete.title')}}</span>
      </p>
      <div>
        <p>{{$tc('p.project.modal.delete.description', 1)}} <strong style="word-break:break-all;">
          {{(removeModal.project.user && removeModal.project.user.nick_name) || (removeModal.project.group && removeModal.project.group.name) }} / {{removeModal.project.name}}</strong>
        </p>
        <p>{{$tc('p.project.modal.delete.description', 2)}}</p>
        <i-input style="margin-top: 10px;" v-model="removeModal.inputModel"
          :placeholder="$t('p.project.modal.delete.placeholder')"></i-input>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long
          :disabled="removeModal.project.name !== removeModal.inputModel"
          @click="remove">{{$t('p.project.modal.delete.button')}}</Button>
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
                  <Button type="ghost" icon="link" :title="$t('p.project.control[0]')" class="copy-url" @click="clip(item)"></Button>
                  <Button type="ghost" icon="ios-copy" :title="$t('p.project.control[1]')" style="width: 34%;" @click.stop="clone(item)"></Button>
                  <Button type="ghost" icon="trash-b" :title="$t('p.project.control[2]')" @click.stop="removeConfirm(item)"></Button>
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
import Clipboard from 'clipboard'
import debounce from 'lodash/debounce'
import * as api from '../../api'

export default {
  name: 'project',
  data () {
    return {
      filterByAuthor: this.$t('p.project.filter[0]'),
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
      const route = this.$route
      switch (route.fullPath) {
        case '/workbench':
          return {
            title: this.$t('p.project.header.title[2]'),
            description: this.$t('p.project.header.description[2]'),
            placeholder: this.$t('p.project.placeholder[2]'),
            icon: 'code-working',
            type: 2 // 0.个人项目 1.团队项目 2.工作台
          }
        case '/':
          return {
            title: this.$t('p.project.header.title[0]'),
            description: this.$t('p.project.header.description[0]'),
            placeholder: this.$t('p.project.placeholder[0]'),
            icon: 'person',
            type: 0
          }
        default:
          const groupName = (route.query && route.query.name) || ''
          return {
            title: this.$t('p.project.header.title[1]', { groupName }),
            description: this.$t('p.project.header.description[1]', {groupName}),
            placeholder: this.$t('p.project.placeholder[1]'),
            icon: 'person-stalker',
            type: 1
          }
      }
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
      this.filterByAuthor = this.$t('p.project.filter[0]')
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
          return location.origin + '/mock/' + project._id + project.url
        }
      })
      this.cliped = true
      clipboard.on('success', (e) => {
        e.clearSelection()
        clipboard.destroy()
        this.cliped = false
        this.$Message.success(this.$t('p.project.copySuccess'))
      })
    },
    handleFilter (value) {
      let filterByAuthor = 0
      if (value === this.$t('p.project.filter[1]')) {
        filterByAuthor = 1
      } else if (value === this.$t('p.project.filter[2]')) {
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
        this.$Message.success(this.$t('p.project.deleteSuccess', { name: this.removeModal.project.name }))
        this.$store.commit('project/SET_REQUEST_PARAMS', { pageIndex: 1 })
        this.$store.dispatch('project/FETCH')
      })
    },
    clone (project) {
      return api.project.copy({
        data: { id: project._id }
      }).then((res) => {
        if (res.data.success) {
          this.$Message.success(this.$t('p.project.cloneSuccess'))
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
