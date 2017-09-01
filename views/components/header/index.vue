<template>
  <transition name="fade">
    <div
      class="em-header"
      :class="{'em-header--fixed': isFixed}"
      v-show="pageAnimated">
      <Affix @on-change="changeFixed">
        <div class="em-header__content">
          <transition name="fade">
            <em-spots :size="spots" v-if="routeChanged"></em-spots>
          </transition>
          <div class="em-container">
            <Row>
              <i-col class="logo" span="1">
                <transition name="fade">
                  <Icon :type="icon" v-show="routeChanged"></Icon>
                </transition>
              </i-col>
              <i-col span="16" class="em-header__info">
                <transition-group name="fade">
                  <h2 key="a" v-show="routeChanged">{{title}}</h2>
                  <p key="b" v-show="routeChanged">{{description}}</p>
                </transition-group>
              </i-col>
              <i-col span="6" class="em-header__control">
                <slot v-if="!nav"></slot>
              </i-col>
            </Row>
          </div>
          <div class="em-header__nav" v-if="nav">
            <div class="em-container">
              <div style="float: right;">
                <div
                  class="em-header__nav__item"
                  :class="{'is-active': value === item.title}"
                  v-for="(item, i) in nav"
                  :key="i"
                  @click="$emit('input', item.title)">
                  <Icon :type="item.icon" v-if="item.icon"></Icon> {{item.title}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Affix>
    </div>
  </transition>
</template>

<style>
@import './index.css';
</style>

<script>
export default {
  name: 'EmHeader',
  props: {
    title: String,
    description: String,
    icon: String,
    spots: Number,
    nav: Array,
    value: {}
  },
  data () {
    return {
      routeChanged: true,
      isFixed: false
    }
  },
  watch: {
    title: function () {
      this.routeChanged = false
      this.$nextTick(() => {
        this.routeChanged = true
      })
    }
  },
  methods: {
    changeFixed (isFixed) {
      this.isFixed = isFixed
    }
  }
}
</script>
