<template>
  <div class="em-proj-detail">
    <em-header
      icon="cube"
      :title="project.name"
      :description="page.description"
      :nav="nav"
      v-model="pageName">
    </em-header>
    <editor v-model="editor"></editor>
    <div v-shortkey="['tab']" @shortkey="handleKeyTab()"></div>
    <em-keyboard-short v-model="keyboards"></em-keyboard-short>
    <Back-top>
      <em-add icon="arrow-up-c" :bottom="90"></em-add>
    </Back-top>
    <transition name="fade" mode="out-in">
      <project v-if="pageName === '设置'" key="a" :project-data="project"></project>
      <div
        class="em-container"
        v-if="pageAnimated && pageName === '接口列表'"
        key="b">
        <div class="em-proj-detail__info">
          <Row>
            <Col span="19">
              <em-spots :size="6"></em-spots>
              {{project.description}}
              <p class="tag">
                <span>Base URL</span>
                {{baseUrl}}
              </p>
              <p class="tag">
                <span>Project ID</span>
                {{project._id}}
              </p>
            </Col>
            <Col span="5">
              <div>
                <img :src="group ? '/public/images/group-default.png' : project.user.head_img" />
                <p class="author">{{group ? group.name : project.user.nick_name}}</p>
              </div>
            </Col>
          </Row>
        </div>
        <div class="em-proj-detail__switcher">
          <ul>
            <li @click="openEditor()" v-shortkey="['ctrl', 'c']" @shortkey="openEditor()">
              <Icon type="plus-round"></Icon> 创建接口
            </li>
            <li @click="handleWorkbench" v-shortkey="['ctrl', 'w']" @shortkey="handleWorkbench">
              <transition name="zoom" mode="out-in">
                <Icon :type="project.extend.is_workbench ? 'android-star' : 'android-star-outline'"
                  :key="project.extend.is_workbench"></Icon>
              </transition>
              工作台
            </li>
            <li @click="updateBySwagger" v-shortkey="['ctrl', 's']" @shortkey="updateBySwagger">
              <Icon type="loop"></Icon> 同步 Swagger
            </li>
            <li @click="download"><Icon type="code-download"></Icon> 打包下载</li>
          </ul>
        </div>
        <div class="em-proj-detail__members" v-if="project.members.length">
          <em-spots :size="6"></em-spots>
          <h2><Icon type="person-stalker"></Icon> 项目成员</h2>
          <Row :gutter="20">
            <Col span="2" v-for="(item, index) in project.members" :key="index">
              <img :src="item.head_img" :title="item.nick_name"/>
            </Col>
          </Row>
        </div>
        <Table
          border
          :columns="columns"
          :data="list"
          @on-selection-change="selectionChange"
          :highlight-row="true"></Table>
      </div>
    </transition>
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
import Editor from './editor'
import Project from '../new/project'
import MockExpand from './mock-expand'

export default {
  name: 'projectDetail',
  data () {
    return {
      pageName: '接口列表',
      selection: [],
      keywords: '',
      nav: [
        { title: '接口列表', icon: 'android-list' },
        { title: '设置', icon: 'gear-a' }
      ],
      editor: {
        show: false
      },
      keyboards: [
        {
          category: '导航',
          list: [
            { description: '接口列表/设置', shorts: ['tab'] }
          ]
        },
        {
          category: '操作',
          list: [
            { description: '创建接口', shorts: ['ctrl', 'c'] },
            { description: '添加 / 移除工作台', shorts: ['ctrl', 'w'] },
            { description: '同步 Swagger', shorts: ['ctrl', 's'] }
          ]
        },
        {
          category: '编辑界面（非编辑状态有效）',
          list: [
            { description: '关闭', shorts: ['ctrl', 'x'] },
            { description: '格式化', shorts: ['ctrl', 'f'] },
            { description: '预览（只在更新时生效）', shorts: ['ctrl', 'v'] }
          ]
        }
      ],
      columns: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(MockExpand, {
              props: {
                mock: params.row
              }
            })
          }
        },
        { type: 'selection', width: 60, align: 'center' },
        {
          title: 'Method',
          width: 110,
          key: 'method',
          filters: [
            { label: 'get', value: 'get' },
            { label: 'post', value: 'post' },
            { label: 'put', value: 'put' },
            { label: 'delete', value: 'delete' },
            { label: 'patch', value: 'patch' }
          ],
          filterMethod (value, row) {
            return row.method.indexOf(value) > -1
          },
          render: (h, params) => {
            const color = {
              get: 'blue',
              post: 'green',
              delete: 'red',
              put: 'yellow',
              patch: ''
            }
            return <tag class="method-tag" color={color[params.row.method]}>
              {params.row.method.toUpperCase()}
            </tag>
          }
        },
        { title: 'URL', width: 420, ellipsis: true, sortable: true, key: 'url' },
        { title: '描述', ellipsis: true, key: 'description' },
        {
          title: '操作',
          key: 'action',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return (
              <div>
                <Button-group>
                  <i-button size="small" title="预览接口" onClick={this.preview.bind(this, params.row)}><icon type="eye"></icon></i-button>
                  <i-button size="small" title="编辑接口" onClick={this.openEditor.bind(this, params.row)}><icon type="edit"></icon></i-button>
                  <i-button size="small" title="复制接口地址" class="copy-url" onClick={this.clip.bind(this, params.row.url)}><icon type="link"></icon></i-button>
                </Button-group>
                <dropdown>
                  <i-button size="small"><icon type="more"></icon></i-button>
                  <dropdown-menu slot="list">
                    <dropdown-item nativeOnClick={this.clone.bind(this, params.row)}><icon type="ios-copy"></icon> 克隆</dropdown-item>
                    <dropdown-item nativeOnClick={this.download.bind(this, params.row._id)}><icon type="ios-download"></icon> 下载</dropdown-item>
                    <dropdown-item nativeOnClick={this.remove.bind(this, params.row._id)}><icon type="trash-b"></icon> 删除</dropdown-item>
                  </dropdown-menu>
                </dropdown>
              </div>
            )
          }
        }
      ]
    }
  },
  asyncData ({ store, route }) {
    store.commit('mock/INIT_REQUEST')
    return store.dispatch('mock/FETCH', route).then((data) => {
      store.commit('mock/SET_PAGE', {
        description: data.project.user ? '个人项目' : '团队项目'
      })
    })
  },
  mounted () {
    this.$on('query', debounce((keywords) => {
      this.keywords = keywords
    }, 500))
  },
  computed: {
    project () {
      return this.$store.state.mock.project
    },
    list () {
      const list = this.$store.state.mock.list
      const reg = this.keywords && new RegExp(this.keywords, 'i')
      return reg
        ? list.filter(item => (
          reg.test(item.name) || reg.test(item.url) || reg.test(item.method)
        ))
        : list
    },
    page () {
      return this.$store.state.mock.page
    },
    baseUrl () {
      const baseUrl = location.origin + config.mockPrefix + this.project._id
      return this.project.url === '/' ? baseUrl : baseUrl + this.project.url
    },
    group () {
      return this.project.group
    }
  },
  methods: {
    handleKeyTab () {
      this.pageName = this.pageName === '设置' ? '接口列表' : '设置'
    },
    clip (mockUrl) {
      const clipboard = new Clipboard('.copy-url', {
        text: () => {
          return this.baseUrl + mockUrl
        }
      })
      clipboard.on('success', (e) => {
        e.clearSelection()
        clipboard.destroy()
        this.$Message.success('接口地址已复制到剪贴板')
      })
    },
    preview (mock) {
      window.open(this.baseUrl + mock.url + '#!method=' + mock.method)
    },
    selectionChange (selection) {
      this.selection = selection
    },
    download (mockId) {
      if (typeof mockId === 'string') {
        const ids = this.selection.length
          ? this.selection.map(item => item._id)
          : [mockId]
        api.mock.export(ids)
      } else {
        api.mock.export(this.project._id)
      }
    },
    updateBySwagger () {
      if (!this.project.swagger_url) {
        this.$Message.warning('请先在设置页配置 Swagger 接口地址')
        return
      }
      this.$Modal.confirm({
        title: '提示',
        content: '该操作将同步最新 Swagger 接口，是否继续？',
        onOk: () => {
          api.project.updateSwagger({
            data: { id: this.project._id }
          }).then((res) => {
            if (res.data.success) {
              this.$Message.success('同步成功')
              this.$store.commit('mock/SET_REQUEST_PARAMS', {pageIndex: 1})
              this.$store.dispatch('mock/FETCH', this.$route)
            }
            return res
          })
        }
      })
    },
    remove (mockId) {
      const ids = this.selection.length
        ? this.selection.map(item => item._id)
        : [mockId]
      this.$Modal.confirm({
        title: '提示',
        content: '该操作无法撤消，' + (ids.length > 1 ? '是否继续删除选中行?' : '是否继续删除?'),
        onOk: () => {
          api.mock.delete({
            data: { ids }
          }).then((res) => {
            if (res.data.success) {
              this.$Message.success('删除成功')
              this.$store.commit('mock/SET_REQUEST_PARAMS', { pageIndex: 1 })
              this.$store.dispatch('mock/FETCH', this.$route)
            }
          })
        }
      })
    },
    handleWorkbench () {
      this.$store.dispatch('project/WORKBENCH', this.project.extend)
    },
    clone (mock) {
      this.$store.dispatch('mock/CREATE', {
        route: this.$route,
        ...mock,
        url: `${mock.url}_copy_${new Date().getTime()}`
      })
    },
    openEditor (mock) {
      this.editor = mock || {}
      this.$set(this.editor, 'show', true)
    }
  },
  components: {
    Project,
    Editor
  }
}
</script>
