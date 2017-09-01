<template>
  <div class="em-keyboard-short"
      v-shortkey="['shift', '?']" @shortkey="show">
    <Modal
      v-model="visible"
      title="键盘快捷键"
      :transfer="false">
      <div class="em-keyboard-short__content">
        <Row :gutter="20">
          <i-col :span="12">
            <div>
              <h2>全局导航</h2>
              <ul>
                <li>
                  <code class="keyboard-short">p</code>
                  个人项目
                </li>
                <li>
                  <code class="keyboard-short">g</code>
                  团队项目
                </li>
                <li>
                  <code class="keyboard-short">w</code>
                  工作台
                </li>
                <li>
                  <code class="keyboard-short">d</code>
                  文档
                </li>
              </ul>
            </div>
            <div>
              <h2>全局操作</h2>
              <ul>
                <li>
                  <code class="keyboard-short">n</code>
                  创建项目
                </li>
                <li>
                  <code class="keyboard-short">s</code>
                  搜索
                </li>
              </ul>
            </div>
          </i-col>
          <i-col :span="12">
            <div v-for="(item, index) in value" :key="index">
              <h2>{{item.category}}</h2>
              <ul>
                <li v-for="(item, index) in item.list" :key="index">
                  <code
                    class="keyboard-short"
                    v-for="(short, i) in item.shorts"
                    :key="i">{{short}}</code>
                  {{item.description}}
                </li>
              </ul>
            </div>
          </i-col>
        </Row>
      </div>
    </Modal>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
export default {
  name: 'EmKeyboardShort',
  data () {
    return {
      visible: false
    }
  },
  props: {
    value: {
      type: Array
    }
  },
  methods: {
    show () {
      this.visible = !this.visible
    }
  }
}
</script>
