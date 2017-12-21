<template>
  <transition name="fade">
    <p v-show="pageAnimated" style="padding: 20px;">{{$t('c.logOut.text')}}</p>
  </transition>
</template>

<script>
import Cookies from 'universal-cookie'
import config from 'config'

export default {
  beforeMount () {
    this.logOut()
  },
  methods: {
    logOut () {
      const cookies = new Cookies()
      this.$ls.remove('user')
      cookies.remove(config.storageNamespace + 'token')
      this.$store.commit('user/SET_VALUE', {})
      this.$router.push('/login')
    }
  }
}
</script>
