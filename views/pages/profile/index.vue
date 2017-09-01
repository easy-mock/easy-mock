<template>
  <div class="em-profile">
    <em-header
      icon="edit"
      title="编辑资料"
      description="个性化设置">
    </em-header>
    <em-keyboard-short></em-keyboard-short>
    <Modal title="查看头像" v-model="visible" width="400">
      <img :src="form.headImg" style="width: 100%" v-show="form.headImg">
    </Modal>
    <transition name="fade">
      <div class="em-container" v-show="pageAnimated">
        <div class="em-profile__content">
          <Row :gutter="20">
            <Col span="18">
              <Form label-position="top" :model="form" :rules="rules" ref="form">
                <Form-item label="昵称">
                  <i-input v-model="form.nickName"></i-input>
                </Form-item>
                <Form-item label="密码">
                  <i-input type="password" v-model="form.password"></i-input>
                </Form-item>
                <Form-item label="确认密码" prop="passwordCheck">
                  <i-input type="password" v-model="form.passwordCheck"></i-input>
                </Form-item>
                <Form-item>
                  <Button type="primary" @click="update">更新资料</Button>
                </Form-item>
              </Form>
            </Col>
            <Col span="6">
              <p>头像</p>
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
                :on-format-error="handleFormatError"
                :action="uploadAPI">
                <Button type="ghost" icon="ios-cloud-upload-outline" long>上传新图片</Button>
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

export default {
  name: 'profile',
  data () {
    const validatePassCheck = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      visible: false,
      uploadAPI: config.uploadAPI,
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
  methods: {
    handleFormatError (file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
      })
    },
    handleSuccess (response, file, fileList) {
      this.form.headImg = response.path
    },
    update () {
      const data = {
        nick_name: this.form.nickName,
        head_img: this.form.headImg.replace(/http(s)?:/, '')
      }

      if (this.form.password) {
        data.password = this.form.password
      }

      this.$refs.form.validate((valid) => {
        if (valid) {
          api.u.update({ data }).then((res) => {
            if (res.data.success) {
              this.$Modal.success({
                title: '更新成功',
                content: '请重新登录，以完成数据同步。',
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
