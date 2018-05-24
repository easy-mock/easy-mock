<template>
  <div class="em-profile">
    <em-header
      icon="edit"
      :title="$t('p.profile.header.title')"
      :description="$t('p.profile.header.description')">
    </em-header>
    <em-keyboard-short></em-keyboard-short>
    <Modal :title="$t('p.profile.modal.title')" v-model="visible" width="400">
      <img :src="form.headImg" style="width: 100%" v-show="form.headImg">
    </Modal>
    <transition name="fade">
      <div class="em-container" v-show="pageAnimated">
        <div class="em-profile__content">
          <Row :gutter="20">
            <Col span="18">
              <Form label-position="top" :model="form" :rules="rules" ref="form">
                <Form-item :label="$t('p.profile.form.language')">
                  <Select v-model="language">
                    <Option v-for="item in languageList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>
                </Form-item>
                <Form-item :label="$t('p.profile.form.nickName')">
                  <i-input v-model="form.nickName"></i-input>
                </Form-item>
                <Form-item :label="$t('p.profile.form.password')" v-show="!ldap">
                  <i-input type="password" v-model="form.password"></i-input>
                </Form-item>
                <Form-item :label="$t('p.profile.form.passwordCheck')" prop="passwordCheck" v-show="!ldap">
                  <i-input type="password" v-model="form.passwordCheck"></i-input>
                </Form-item>
                <Form-item>
                  <Button type="primary" @click="update">{{$t('p.profile.form.update')}}</Button>
                </Form-item>
              </Form>
            </Col>
            <Col span="6">
              <p>{{$t('p.profile.form.avatar')}}</p>
              <img
                class="avatar"
                :src="form.headImg"
                v-show="form.headImg"
                :alt="form.nickName"
                :title="form.nickName"
                @click="visible = true">
              <Upload
                :show-upload-list="false"
                :format="['jpg','jpeg','png']"
                :on-success="handleSuccess"
                :headers="uploadHeaders"
                :on-format-error="handleFormatError"
                :action="uploadAPI">
                <Button type="ghost" icon="ios-cloud-upload-outline" long>{{$t('p.profile.form.upload')}}</Button>
              </Upload>
            </Col>
          </Row>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import config from 'config'
import * as api from '../../api'
import languageMap from '../../locale/map'

export default {
  name: 'profile',
  data () {
    const validatePassCheck = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error(this.$t('p.profile.validateError')))
      } else {
        callback()
      }
    }

    return {
      ldap: config.ldap,
      visible: false,
      language: this.$ls.get('locale') || 'zh-CN',
      languageList: languageMap.list,
      uploadAPI: '/api/upload',
      form: {
        headImg: this.$store.state.user.headImg,
        nickName: this.$store.state.user.nickName,
        password: '',
        passwordCheck: ''
      },
      rules: {
        passwordCheck: [
          { trigger: 'blur', validator: validatePassCheck }
        ]
      }
    }
  },
  computed: {
    uploadHeaders () {
      return {
        Authorization: 'Bearer ' + this.$store.state.user.token
      }
    }
  },
  methods: {
    handleFormatError (file) {
      this.$Notice.warning({
        title: this.$tc('p.profile.formatError', 1),
        desc: this.$tc('p.profile.formatError', 2, { name: file.name })
      })
    },
    handleSuccess (response, file, fileList) {
      this.form.headImg = response.data.path
    },
    update () {
      const data = {
        nick_name: this.form.nickName,
        head_img: this.form.headImg
      }

      if (this.form.password) {
        data.password = this.form.password
      }

      this.$refs.form.validate((valid) => {
        if (valid) {
          api.u.update({ data }).then((res) => {
            if (res.data.success) {
              this.$ls.set('locale', this.language)
              this.$i18n.locale = this.language
              this.$Modal.success({
                title: this.$tc('p.profile.updateSuccess', 1),
                content: this.$tc('p.profile.updateSuccess', 2),
                onOk: () => {
                  this.$router.push('/log-out')
                }
              })
            }
          })
        }
      })
    }
  }
}
</script>
