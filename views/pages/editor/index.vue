<template>
  <div class="em-editor">
    <div class="em-editor__editor">
      <div ref="codeEditor"></div>
    </div>
    <div class="panel-info">
      <em-spots :size="10"></em-spots>
      <div class="wrapper">
        <h2>{{isEdit ? $t('p.detail.editor.title[0]') : $t('p.detail.editor.title[1]')}}</h2>
        <div class="em-editor__form">
          <Form label-position="top">
            <Form-item label="Method">
              <i-select v-model="temp.method">
                <Option v-for="item in methods" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </i-select>
            </Form-item>
            <Form-item label="URL">
              <i-input v-model="temp.url">
                <span slot="prepend">/</span>
              </i-input>
            </Form-item>
            <Form-item :label="$t('p.detail.columns[0]')">
              <i-input v-model="temp.description"></i-input>
            </Form-item>
            <Form-item :label="$t('p.detail.editor.autoClose')" v-if="isEdit">
              <i-switch v-model="autoClose"></i-switch>
            </Form-item>
            <Form-item>
              <Button type="primary" long @click="submit">{{isEdit ? $t('p.detail.editor.action[0]') : $t('p.detail.editor.action[1]')}}</Button>
            </Form-item>
          </Form>
        </div>
        <div class="em-editor__control">
          <div class="em-proj-detail__switcher">
            <ul>
              <li @click="format">{{$t('p.detail.editor.control[0]')}}</li>
              <li @click="preview" v-if="isEdit">{{$t('p.detail.editor.control[1]')}}</li>
              <li @click="close">{{$t('p.detail.editor.control[2]')}}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import * as api from '../../api'
import jsBeautify from 'js-beautify/js/lib/beautify'
let ace

if (typeof window !== 'undefined') {
  ace = require('brace')
  require('brace/mode/javascript')
  require('brace/theme/monokai')
  require('brace/ext/language_tools')
  require('brace/ext/searchbox')
  require('./snippets')
}

export default {
  name: 'editor',
  data () {
    return {
      codeEditor: null,
      autoClose: true,
      methods: [
        { label: 'get', value: 'get' },
        { label: 'post', value: 'post' },
        { label: 'put', value: 'put' },
        { label: 'delete', value: 'delete' },
        { label: 'patch', value: 'patch' }
      ],
      temp: {
        url: '',
        mode: '{"data": {}}',
        method: 'get',
        description: ''
      }
    }
  },
  computed: {
    mockData () {
      return this.$store.state.mock.editorData.mock
    },
    baseUrl () {
      return this.$store.state.mock.editorData.baseUrl
    },
    projectId () {
      return this.$route.params.projectId
    },
    isEdit () {
      return !!this.$route.params.id && this.mockData
    }
  },
  beforeRouteEnter (to, from, next) {
    if (from.matched.length === 0) { // 防止编辑页刷新导致的显示异常（直接进入项目主页）
      return next({
        path: `/project/${to.params.projectId}`,
        replace: true
      })
    }
    next()
  },
  mounted () {
    this.codeEditor = ace.edit(this.$refs.codeEditor)
    this.codeEditor.getSession().setMode('ace/mode/javascript')
    this.codeEditor.setTheme('ace/theme/monokai')
    this.codeEditor.setOption('tabSize', 2)
    this.codeEditor.setOption('fontSize', 15)
    this.codeEditor.setOption('enableLiveAutocompletion', true)
    this.codeEditor.setOption('enableSnippets', true)
    this.codeEditor.clearSelection()
    this.codeEditor.getSession().setUseWorker(false)
    this.codeEditor.on('change', this.onChange)
    this.codeEditor.commands.addCommand({
      name: 'save',
      bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
      exec: () => {
        this.submit()
      }
    })

    if (this.isEdit) {
      this.autoClose = true
      this.temp.url = this.mockData.url.slice(1) // remove /
      this.temp.mode = this.mockData.mode
      this.temp.method = this.mockData.method
      this.temp.description = this.mockData.description
    }

    this.$nextTick(() => {
      this.codeEditor.setValue(this.temp.mode)
      this.format()
    })
  },
  methods: {
    convertUrl (url) {
      const newUrl = '/' + url
      return newUrl === '/'
        ? '/'
        : newUrl.replace(/\/\//g, '/').replace(/\/$/, '')
    },
    format () {
      const context = this.codeEditor.getValue()
      let code = /^http(s)?/.test(context)
        ? context
        : jsBeautify.js_beautify(context, { indent_size: 2 })
      this.codeEditor.setValue(code)
    },
    onChange () {
      this.temp.mode = this.codeEditor.getValue()
    },
    close () {
      this.$store.commit('mock/SET_EDITOR_DATA', {mock: null, baseUrl: ''})
      this.$router.replace(`/project/${this.projectId}`)
    },
    submit () {
      const mockUrl = this.convertUrl(this.temp.url)

      try {
        const value = (new Function(`return ${this.temp.mode}`))() // eslint-disable-line
        if (!value) {
          this.$Message.error(this.$t('p.detail.editor.submit.error[0]'))
          return
        } else if (typeof value !== 'object') {
          throw new Error()
        }
      } catch (error) {
        if (!/^http(s)?:\/\//.test(this.temp.mode)) {
          this.$Message.error(error.message || this.$t('p.detail.editor.submit.error[1]'))
          return
        }
      }

      if (this.isEdit) {
        api.mock.update({
          data: {
            ...this.temp,
            id: this.mockData._id,
            url: mockUrl
          }
        }).then((res) => {
          if (res.data.success) {
            this.$Message.success(this.$t('p.detail.editor.submit.updateSuccess'))
            if (this.autoClose) this.close()
          }
        })
      } else {
        api.mock.create({
          data: {
            ...this.temp,
            url: mockUrl,
            project_id: this.projectId
          }
        }).then((res) => {
          if (res.data.success) {
            this.$Message.success(this.$t('p.detail.create.success'))
            this.close()
          }
        })
      }
    },
    preview () {
      window.open(this.baseUrl + this.mockData.url + '#!method=' + this.mockData.method)
    }
  }
}
</script>
