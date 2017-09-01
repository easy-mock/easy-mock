<template>
  <div class="em-shape-shifter">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
let shapeShifter
let resizeTimer

if (typeof window !== 'undefined') {
  shapeShifter = require('./shape-shifter')
}

export default {
  name: 'EmShapeShifter',
  mounted () {
    shapeShifter.init(this.$refs.canvas, 'mock so easy')
    resizeTimer = setTimeout(() => {
      shapeShifter.UI.reset()
    }, 2000)
  },
  beforeDestroy () {
    clearTimeout(resizeTimer)
  }
}
</script>

<style>
.em-shape-shifter {
  position: relative;
}

.em-shape-shifter canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
