<template>
  <transition name="fade">
    <div class="em-container" v-show="pageAnimated">
      <div class="em-new__content">
        <Form label-position="top" :model="form" ref="formValidate">
          <Form-item label="归属 / 项目名">
            <template slot="label">
              归属 / 项目名
              <Tooltip content="尽量简短表意。例：petstore">
                <Icon type="help-circled"></Icon>
              </Tooltip>
            </template>
            <Row>
              <Col span="7">
                <Form-item>
                  <i-select v-model="form.groupId" :disabled="isEdit">
                    <Option v-for="item in groups" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </i-select>
                </Form-item>
              </Col>
              <Col span="1" style="text-align: center">/</Col>
              <Col span="16">
                <Form-item>
                  <i-input v-model="form.projectName" placeholder="example" ref="projectName"></i-input>
                </Form-item>
              </Col>
            </Row>
          </Form-item>
          <Form-item label="URL">
            <template slot="label">
              项目基础 URL
              <Tooltip content="尽量简短表意。例：/nba">
                <Icon type="help-circled"></Icon>
              </Tooltip>
            </template>
            <i-input v-model="projectUrl" placeholder="example">
              <span slot="prepend">/</span>
            </i-input>
          </Form-item>
          <Form-item label="项目描述"  class="em-new__form-hr">
            <i-input v-model="form.projectDesc" placeholder="不填默认为项目名"></i-input>
          </Form-item>
          <Form-item label="Swagger Docs API">
            <template slot="label">
              Swagger Docs API
              <span>(可选)</span>
            </template>
            <i-input v-model="form.projectSwagger" placeholder="http://example.com/swagger.json"></i-input>
            <p class="em-new__form-description">
            如果后台有提供 Swagger 文档（并且没有验证授权的问题）, 于是我们可以在此处填写 Swagger 的接口地址,
            Easy Mock 会自动基于此接口创建 Mock 接口. <router-link to="/docs#swagger"><Icon type="help-circled"></Icon></router-link>
            </p>
          </Form-item>
          <Form-item label="邀请成员" class="em-new__form-hr">
            <template slot="label">
              邀请成员 协同编辑
              <span>({{isGroup ? '团队项目下，该配置不生效' : '可选'}})</span>
            </template>
            <i-select
              v-model="form.projectMembers"
              multiple
              filterable
              remote
              :disabled="isGroup"
              placeholder="用户昵称、用户名，支持模糊匹配"
              :remote-method="remote"
              :loading="remoteLoading">
              <Option v-for="option in users"
                :value="option.value"
                :key="option.value">{{option.label}}</Option>
            </i-select>
          </Form-item>
          <Form-item :class="{'em-new__form-hr': isEdit}">
            <Button type="primary" long @click="submit">{{isEdit ? '保存' : '创建'}}</Button>
          </Form-item>
          <Form-item label="请输入项目名称以进行确认" v-if="isEdit">
            <i-input v-model="confirmName" placeholder="项目名确认"></i-input>
            <p class="em-new__form-description">
            出于某些原因，删除也许会失败。但如果你执意删除，必须知道此操作无法撤消，这将永久删除 <strong style="word-break:break-all;">
              {{(projectData.user && projectData.user.nick_name) || (projectData.group && projectData.group.name) }} / {{projectData.name}}
            </strong>
            </p>
          </Form-item>
          <Form-item v-if="isEdit">
            <Button type="error" long @click="remove" :disabled="confirmName !== projectData.name">删除项目</Button>
          </Form-item>
        </Form>
      </div>
    </div>
  </transition>
</template>

<style>
@import './index.css';
</style>

<script>
import * as api from '../../api'

export default {
  name: 'newProject',
  data () {
    return {
      remoteLoading: false,
      users: [],
      groups: [],
      projectUrl: '',
      confirmName: '',
      form: {
        groupId: '',
        projectId: '',
        projectName: '',
        projectUrl: '',
        projectDesc: '',
        projectSwagger: '',
        projectMembers: []
      }
    }
  },
  props: {
    projectData: null
  },
  mounted () {
    const proj = this.projectData
    this.$nextTick(() => {
      this.$refs.projectName.focus()
    })
    if (proj) {
      this.remoteLoading = true // 回填文案显示异常，应该是 iview 的 bug
      this.users = proj.members.map(member => ({
        value: member._id,
        label: member.nick_name
      }))
      this.form.projectId = proj._id
      this.form.projectName = proj.name
      this.form.projectDesc = proj.description
      this.form.projectSwagger = proj.swagger_url
      this.projectUrl = proj.url.slice(1) // remove /
      this.$nextTick(() => {
        this.remoteLoading = false
        this.form.projectMembers = this.users.map(u => u.value)
      })
      if (proj.group) {
        this.groups = [{ value: proj.group._id, label: proj.group.name }]
        this.form.groupId = proj.group._id
      } else {
        this.groups = [{ value: proj.user._id, label: proj.user.nick_name }]
        this.form.groupId = proj.user._id
      }
    } else {
      this.fetchGroup()
      this.form.groupId = this.user.id
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isEdit () {
      return !!this.projectData
    },
    isGroup () {
      if (this.projectData) {
        return !!this.projectData.group
      } else {
        return this.form.groupId !== this.user.id
      }
    }
  },
  methods: {
    convertUrl (url) {
      const newUrl = '/' + url
      return newUrl === '/'
        ? '/'
        : newUrl.replace(/\/\//g, '/').replace(/\/$/, '')
    },
    fetchGroup () {
      api.group.getList().then((res) => {
        if (res.data.success) {
          this.groups = [{ value: this.user.id, label: this.user.nickName }].concat(
            res.data.data.map(o => ({
              value: o._id,
              label: o.name
            }))
          )
        }
      })
    },
    submit () {
      const data = {
        id: this.form.projectId,
        name: this.form.projectName,
        group: this.form.groupId,
        swagger_url: this.form.projectSwagger,
        description: this.form.projectDesc,
        url: this.convertUrl(this.projectUrl),
        members: this.isGroup ? [] : this.form.projectMembers
      }

      if (this.isEdit) {
        api.project.update({ data }).then((res) => {
          if (res.data.success) {
            this.$Message.success('更新成功')
            this.$store.commit('mock/SET_REQUEST_PARAMS', {pageIndex: 1})
            this.$store.dispatch('mock/FETCH', this.$route)
          }
        })
      } else {
        if (data.group === this.user.id) {
          data.group = ''
        }

        api.project.create({
          data: data
        }).then((res) => {
          if (res.data.success) {
            this.$Message.success('创建成功')
            if (data.group) {
              const group = this.groups.filter(item => item.value === data.group)[0]
              this.$router.push(`/group/${group.value}?name=${group.label}`)
            } else {
              this.$router.push('/')
            }
          }
        })
      }
    },
    remote (query) {
      if (query) {
        this.remoteLoading = true
        api.u.getList({
          params: {
            keywords: query
          }
        }).then((res) => {
          this.remoteLoading = false
          if (res.data.success) {
            const list = res.data.data.map(item => {
              return {
                value: item._id,
                label: item.nick_name,
                userName: item.name
              }
            })
            this.users = list.filter(item => {
              const nickName = item.label.toLowerCase()
              const userName = item.userName.toLowerCase()
              const q = query.toLowerCase()
              return nickName.indexOf(q) > -1 || userName.indexOf(q) > -1
            })
          }
        })
      } else {
        this.users = []
      }
    },
    remove () {
      const projectId = this.projectData._id
      this.$store.dispatch('project/REMOVE', projectId).then(() => {
        this.$Message.success(this.projectData.name + ' 已删除')
        this.$router.push('/')
      })
    }
  }
}
</script>
