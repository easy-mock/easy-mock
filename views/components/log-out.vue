<template>
  <transition name="fade">
    <p v-show="pageAnimated" style="padding: 20px;">{{$t('c.logOut.text')}}</p>
  </transition>
</template>

<script>
import cookie from 'react-cookie'
import config from 'config'

export default {
  beforeMount () {
    this.logOut()
  },
  methods: {
    logOut () {
      this.$ls.remove('user')
      cookie.remove(config.storageNamespace + 'token')
      this.$store.commit('user/SET_VALUE', {})
      this.$router.push('/login')
    }
  }
}
</script>
