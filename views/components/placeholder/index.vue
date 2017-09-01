<template>
  <div class="em-placeholder">
    <transition name="fade">
      <div class="em-placeholder__content" v-show="visible">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
export default {
  name: 'EmPlaceholder',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      visible: false
    }
  },
  mounted () {
    this.handleVisible()
  },
  watch: {
    show: 'handleVisible'
  },
  methods: {
    handleVisible () {
      setTimeout(() => {
        this.visible = this.show
      }, 500)
    }
  }
}
</script>
