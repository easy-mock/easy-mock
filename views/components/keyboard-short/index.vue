<template>
  <div class="em-keyboard-short"
      v-shortkey="['shift', '?']" @shortkey="show">
    <Modal
      v-model="visible"
      :title="$t('c.keyboardShort.modalTitle')"
      :transfer="false">
      <div class="em-keyboard-short__content">
        <Row :gutter="20">
          <i-col :span="12">
            <div>
              <h2>{{$t('c.keyboardShort.keyboards[0].category')}}</h2>
              <ul>
                <li>
                  <code class="keyboard-short">p</code>
                  {{$t('c.keyboardShort.keyboards[0].list[0]')}}
                </li>
                <li>
                  <code class="keyboard-short">g</code>
                  {{$t('c.keyboardShort.keyboards[0].list[1]')}}
                </li>
                <li>
                  <code class="keyboard-short">w</code>
                  {{$t('c.keyboardShort.keyboards[0].list[2]')}}
                </li>
                <li>
                  <code class="keyboard-short">d</code>
                  {{$t('c.keyboardShort.keyboards[0].list[3]')}}
                </li>
              </ul>
            </div>
            <div>
              <h2>{{$t('c.keyboardShort.keyboards[1].category')}}</h2>
              <ul>
                <li>
                  <code class="keyboard-short">n</code>
                  {{$t('c.keyboardShort.keyboards[1].list[0]')}}
                </li>
                <li>
                  <code class="keyboard-short">s</code>
                  {{$t('c.keyboardShort.keyboards[1].list[1]')}}
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
