<template>
  <transition name="fade">
    <div class="em-spots" v-show="pageAnimated">
      <span class="decorate"
        v-for="(item, index) in items"
        :key="index"
        :style="item">
      </span>
    </div>
  </transition>
</template>

<style>
@import './index.css';
</style>

<script>
const colors = [
  '#C91B00', '#E92224', '#FF5600', '#392673', '#E92224',
  '#392673', '#003E87', '#175AAB', '#0087E7'
]

export default {
  name: 'EmSpots',
  props: {
    size: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      items: []
    }
  },
  mounted () {
    this.$el.parentNode.style.position = 'relative'
    this.$el.parentNode.style.overflow = 'hidden'
    for (let i = 0; i < this.size; i++) {
      this.items.push(this.getItem(i, this.size))
    }
  },
  methods: {
    getItem (index, length) {
      const size = parseInt(Math.random() * 10 + 10, 10) + parseInt(Math.random() * 30 + 10, 10)
      const color = colors[parseInt(Math.random() * 10, 10)]
      const base = 100 / length
      const left = base * (index + 1)
      const style = {
        background: color,
        width: `${size}px`,
        height: `${size}px`,
        marginTop: `-${size / 2}px`,
        marginLeft: `-${size / 2}px`,
        top: `${Math.random() * 100}%`,
        left: `${left - (base / 2)}%`
      }
      return style
    }
  }
}
</script>
