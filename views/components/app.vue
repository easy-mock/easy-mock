<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
    <Modal v-model="visible" title="Choose Language"
      :closable="false" :mask-closable="false">
      <Select v-model="language">
        <Option v-for="item in languageList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <div slot="footer">
        <Button type="primary" @click="settingLanguage" long>OK</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import languageMap from '../locale/map'

export default {
  data () {
    return {
      visible: false,
      language: this.locale || 'zh-CN',
      languageList: languageMap.list
    }
  },
  computed: {
    locale () {
      return this.$ls.get('locale')
    },
    appVersion () {
      return this.$store.state.app.version
    }
  },
  mounted () {
    if (this.appVersion === this.$ls.get('version')) {
      this.$store.commit('app/SET_READ_CHANGELOG', true)
    }
    if (this.locale) return
    this.visible = true
  },
  methods: {
    settingLanguage () {
      this.$ls.set('locale', this.language)
      this.$i18n.locale = this.language
      this.visible = false
    }
  }
}
</script>
