<template>
  <div class="em-dashboard">
    <em-header
      :spots="6"
      icon="ios-speedometer"
      title="数据"
      description="这里将实时显示应用的使用情况。">
    </em-header>
    <em-keyboard-short></em-keyboard-short>
    <div class="em-container em-dashboard__content">
      <Row :gutter="20">
        <Col span="12">
          <transition name="fadeLeft">
            <div class="em-dashboard__item em-dashboard__item--key"
              v-show="pageAnimated">
              <h2><Icon type="stats-bars"></Icon> 接口累积调用</h2>
              <p class="number">
                <em-animated-integer :value="total.mockUseCount"></em-animated-integer>
                <span>次</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="cube"></Icon> 累积项目</h2>
              <p class="number">
                <em-animated-integer :value="total.projectCount"></em-animated-integer>
                <span>个</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="link"></Icon> 累积接口</h2>
              <p class="number">
                <em-animated-integer :value="total.mockCount"></em-animated-integer>
                <span>个</span>
              </p>
            </div>
          </transition>
        </Col>
      </Row>
      <Row :gutter="20">
        <Col span="12">
          <transition name="fadeLeft">
            <div class="em-dashboard__item em-dashboard__item--key" v-show="pageAnimated">
              <em-spots :size="6"></em-spots>
              <h2><Icon type="person"></Icon> 累积用户</h2>
              <p class="number">
                <em-animated-integer :value="total.userCount"></em-animated-integer>
                <span>位</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="12">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <em-spots :size="6"></em-spots>
              <h2><Icon type="person-add"></Icon> 新增用户</h2>
              <p class="number">
                <em-animated-integer :value="today.userCount"></em-animated-integer>
                <span>位</span>
              </p>
            </div>
          </transition>
        </Col>
      </Row>
      <Row :gutter="20">
        <Col span="12">
          <transition name="fadeLeft">
            <div class="em-dashboard__item em-dashboard__item--key" v-show="pageAnimated">
              <h2><Icon type="stats-bars"></Icon> 今日接口累积调用</h2>
              <p class="number">
                <em-animated-integer :value="today.mockUseCount"></em-animated-integer>
                <span>次</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="cube"></Icon> 新增项目</h2>
              <p class="number">
                <em-animated-integer :value="today.projectCount"></em-animated-integer>
                <span>个</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="link"></Icon> 新增接口</h2>
              <p class="number">
                <em-animated-integer :value="today.mockCount"></em-animated-integer>
                <span>个</span>
              </p>
            </div>
          </transition>
        </Col>
      </Row>
      <transition name="fadeUp">
        <div class="em-dashboard__users" v-show="pageAnimated">
          <Row>
            <i-col span="6">
              <em-spots :size="6"></em-spots>
              <div class="em-dashboard__users__title"><Icon type="quote"></Icon></div>
            </i-col>
            <i-col span="18">
              <Row :gutter="10" style="padding: 0 10px;">
                <i-col span="2" v-for="(item, i) in users" :key="i">
                  <img :src="item.head_img" :title="item.nick_name">
                </i-col>
              </Row>
            </i-col>
          </Row>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
export default {
  name: 'dashboard',
  computed: {
    total () {
      return this.$store.state.dashboard.total
    },
    today () {
      return this.$store.state.dashboard.today
    },
    users () {
      return this.$store.state.dashboard.users
    }
  },
  asyncData ({ store }) {
    return store.dispatch('dashboard/FETCH')
  }
}
</script>
