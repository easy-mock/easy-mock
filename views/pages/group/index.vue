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
        <Tab-pane label="创建团队" name="create" :disabled="tabName === 'rename'">
          <Form :label-width="64">
            <Form-item label="团队名称">
              <i-input
                v-model="groupName"
                placeholder="建议名字取特殊一点，防止别人误加入"
                @on-enter="submit"
                ref="inputCreate"></i-input>
            </Form-item>
          </Form>
        </Tab-pane>
        <Tab-pane label="加入团队" name="join" :disabled="tabName === 'rename'">
          <Form :label-width="64">
            <Form-item label="团队名称">
              <i-input
                v-model="groupName"
                @on-enter="submit"
                placeholder="请输入团队名称"></i-input>
            </Form-item>
          </Form>
        </Tab-pane>
        <Tab-pane label="编辑团队" name="rename" :disabled="tabName !== 'rename'">
          <Form :label-width="64">
            <Form-item label="团队名称">
              <i-input
                v-model="groupName"
                @on-enter="submit"
                placeholder="建议名字取特殊一点，防止别人误加入"></i-input>
            </Form-item>
          </Form>
        </Tab-pane>
      </Tabs>
    </Modal>
    <em-placeholder :show="groups.length === 0">
      <Icon :type="keywords ? 'outlet' : 'happy-outline'"></Icon>
      <p>{{keywords ? '没有匹配到相关团队。' : '想一起玩吗？快来创建团队呀。'}}</p>
    </em-placeholder>
    <em-header
      icon="person-stalker"
      title="团队项目"
      description="这里将展示你所创建的以及加入的团队。">
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
          category: '操作',
          list: [
            { description: '新建团队', shorts: ['ctrl', 'c'] }
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
        this.$store.dispatch('group/ADD', this.groupName)
      } else if (this.tabName === 'join') {
        this.$store.dispatch('group/JOIN', this.groupName)
      } else {
        this.$store.dispatch('group/RENAME', {
          id: this.renameGroup._id,
          name: this.groupName
        })
      }
    },
    remove (group) {
      this.$Modal.confirm({
        title: '提示',
        content: `此操作将 <strong>解散</strong> 或 <strong>退出</strong> 团队 <strong>${group.name}</strong> , 是否继续?`,
        onOk: () => {
          this.$store.dispatch('group/REMOVE', group._id)
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
