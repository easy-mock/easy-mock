<template>
  <div class="em-group">
    <em-add icon="person-add" color="red" :bottom="90"
      @click.native="openModal"></em-add>
    <div v-shortkey="['ctrl', 'c']" @shortkey="openModal"></div>
    <em-keyboard-short v-model="keyboards"></em-keyboard-short>
    <Modal
      class-name="em-group-modal"
      v-model="modalShow"
      @on-ok="submit"
      :closable="false">
      <Tabs v-model="tabName">
        <Tab-pane
          :label="$tc('p.group.modal.tab.create', 0)"
          name="create" :disabled="tabName === 'rename'">
          <Form :label-width="64">
            <Form-item :label="$tc('p.group.modal.tab.create', 1)">
              <i-input
                v-model="groupName"
                :placeholder="$tc('p.group.modal.tab.create', 2)"
                @on-enter="submit"
                ref="inputCreate"></i-input>
            </Form-item>
          </Form>
        </Tab-pane>
        <Tab-pane
          :label="$tc('p.group.modal.tab.join', 0)"
          name="join" :disabled="tabName === 'rename'">
          <Form :label-width="64">
            <Form-item :label="$tc('p.group.modal.tab.join', 1)">
              <i-input
                v-model="groupName"
                @on-enter="submit"
                :placeholder="$tc('p.group.modal.tab.join', 2)"></i-input>
            </Form-item>
          </Form>
        </Tab-pane>
        <Tab-pane
          :label="$tc('p.group.modal.tab.edit', 0)"
          name="rename" :disabled="tabName !== 'rename'">
          <Form :label-width="64">
            <Form-item :label="$tc('p.group.modal.tab.edit', 1)">
              <i-input
                v-model="groupName"
                @on-enter="submit"
                :placeholder="$tc('p.group.modal.tab.edit', 2)"></i-input>
            </Form-item>
          </Form>
        </Tab-pane>
      </Tabs>
    </Modal>
    <em-placeholder :show="groups.length === 0">
      <Icon :type="keywords ? 'outlet' : 'happy-outline'"></Icon>
      <p>{{keywords ? $tc('p.group.placeholder', 1) : $tc('p.group.placeholder', 2)}}</p>
    </em-placeholder>
    <em-header
      icon="person-stalker"
      :title="$t('p.group.header.title')"
      :description="$t('p.group.header.description')">
    </em-header>
    <transition name="fade">
      <div class="em-container em-group__list" v-show="pageAnimated">
        <div class="ivu-row">
          <transition-group name="fadeUp">
            <div class="ivu-col ivu-col-span-6"
                v-for="(item, index) in groups" :key="index">
              <div
                class="em-group__item"
                @click="$router.push(`/group/${item._id}?name=${item.name}`)">
                <h2>{{item.name}}</h2>
                <Button-group class="group-control">
                  <Button type="ghost" icon="edit" @click.stop="rename(item)"></Button>
                  <Button type="ghost" icon="trash-b" @click.stop="remove(item)"></Button>
                </Button-group>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import debounce from 'lodash/debounce'

export default {
  name: 'group',
  data () {
    return {
      groupName: '',
      renameGroup: null,
      modalShow: false,
      tabName: 'create',
      keywords: '',
      keyboards: [
        {
          category: this.$t('p.group.keyboards[0].category'),
          list: [
            {
              description: this.$tc('p.group.keyboards[0].list', 0),
              shorts: ['ctrl', 'c']
            }
          ]
        }
      ]
    }
  },
  asyncData ({ store }) {
    return store.dispatch('group/FETCH')
  },
  mounted () {
    this.$on('query', debounce((keywords) => {
      this.keywords = keywords
    }, 500))
  },
  computed: {
    groups () {
      const list = this.$store.state.group.list
      const keywords = this.keywords
      return keywords
        ? list.filter(item => new RegExp(keywords, 'i').test(item.name))
        : list
    }
  },
  methods: {
    openModal () {
      this.tabName = 'create'
      this.groupName = ''
      this.modalShow = true
      this.$nextTick(() => {
        this.$refs.inputCreate.focus()
      })
    },
    submit () {
      this.modalShow = false
      if (this.tabName === 'create') {
        this.$store.dispatch('group/ADD', this.groupName).then(body => {
          if (body.success) this.$Message.success(this.$t('p.group.create.success'))
        })
      } else if (this.tabName === 'join') {
        this.$store.dispatch('group/JOIN', this.groupName).then(body => {
          if (body.success) {
            this.$Message.success(this.$t('p.group.join.success', {groupName: this.groupName}))
          } else {
            this.$Message.warning(this.$t('p.group.join.warning', {groupName: this.groupName}))
          }
        })
      } else {
        this.$store.dispatch('group/RENAME', {
          id: this.renameGroup._id,
          name: this.groupName
        }).then(body => {
          if (body.success) this.$Message.success(this.$t('p.group.update.success'))
        })
      }
    },
    remove (group) {
      this.$Modal.confirm({
        title: this.$t('confirm.title'),
        content: this.$t('p.group.confirm.delete.content', { name: group.name }),
        onOk: () => {
          this.$store.dispatch('group/REMOVE', group._id).then(body => {
            if (body.success) {
              this.$Message.success(this.$t('p.group.remove.success'))
            }
          })
        }
      })
    },
    rename (group) {
      this.tabName = 'rename'
      this.modalShow = true
      this.groupName = group.name
      this.renameGroup = group
    }
  }
}
</script>
