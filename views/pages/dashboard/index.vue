<template>
  <div class="em-dashboard">
    <em-header
      :spots="6"
      icon="ios-speedometer"
      :title="$t('p.dashboard.header.title')"
      :description="$t('p.dashboard.header.description')">
    </em-header>
    <em-keyboard-short></em-keyboard-short>
    <div class="em-container em-dashboard__content">
      <Row :gutter="20">
        <Col span="12">
          <transition name="fadeLeft">
            <div class="em-dashboard__item em-dashboard__item--key"
              v-show="pageAnimated">
              <h2><Icon type="stats-bars"></Icon> {{$tc('p.dashboard.total.mockUse', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="total.mockUseCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.total.mockUse', 2)}}</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="cube"></Icon> {{$tc('p.dashboard.total.project', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="total.projectCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.total.project', 2)}}</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="link"></Icon> {{$tc('p.dashboard.total.mock', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="total.mockCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.total.mock', 2)}}</span>
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
              <h2><Icon type="person"></Icon> {{$tc('p.dashboard.total.user', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="total.userCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.total.user', 2)}}</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="12">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <em-spots :size="6"></em-spots>
              <h2><Icon type="person-add"></Icon> {{$tc('p.dashboard.today.user', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="today.userCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.today.user', 2)}}</span>
              </p>
            </div>
          </transition>
        </Col>
      </Row>
      <Row :gutter="20">
        <Col span="12">
          <transition name="fadeLeft">
            <div class="em-dashboard__item em-dashboard__item--key" v-show="pageAnimated">
              <h2><Icon type="stats-bars"></Icon> {{$tc('p.dashboard.today.mockUse', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="today.mockUseCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.today.mockUse', 2)}}</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="cube"></Icon> {{$tc('p.dashboard.today.project', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="today.projectCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.today.project', 2)}}</span>
              </p>
            </div>
          </transition>
        </Col>
        <Col span="6">
          <transition name="fadeRight">
            <div class="em-dashboard__item" v-show="pageAnimated">
              <h2><Icon type="link"></Icon> {{$tc('p.dashboard.today.mock', 1)}}</h2>
              <p class="number">
                <em-animated-integer :value="today.mockCount"></em-animated-integer>
                <span>{{$tc('p.dashboard.today.mock', 2)}}</span>
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
