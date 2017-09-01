import * as api from '../../api'

export default {
  namespaced: true,
  state: {
    list: [],
    page: {
      description: '',
      placeholder: '',
      title: '',
      icon: '',
      type: 0 // 0.个人项目 1.团队项目 2.工作台
    },
    keywords: '',
    pageIndex: 1,
    projectType: '',
    groupId: '',
    filterByAuthor: 0
  },
  mutations: {
    SET_LIST (state, payload) {
      state.list = state.pageIndex === 1
        ? payload
        : state.list.concat(payload)
    },
    INIT_REQUEST (state) {
      state.groupId = ''
      state.keywords = state.keywords || ''
      state.filterByAuthor = 0
      state.pageIndex = 1
      state.projectType = ''
      state.list = []
    },
    SET_REQUEST_PARAMS (state, payload) {
      state.groupId = payload.groupId || state.groupId
      state.pageIndex = payload.pageIndex || state.pageIndex
      state.projectType = payload.projectType || state.projectType
      state.filterByAuthor = payload.filterByAuthor || state.filterByAuthor
      state.keywords = payload.keywords !== undefined ? payload.keywords : state.keywords
    },
    SET_PAGE (state, payload) {
      state.page = payload
    }
  },
  actions: {
    INIT_PAGE ({ commit, rootState }, route) {
      switch (route.fullPath) {
        case '/workbench':
          commit('SET_PAGE', {
            title: '工作台',
            description: '将正在进行的项目添加到工作台中以提高工作效率。',
            placeholder: '想起飞吗？快去将项目添加到工作台呀。',
            icon: 'code-working',
            type: 2
          })
          commit('SET_REQUEST_PARAMS', {
            projectType: 'workbench'
          })
          break
        case '/':
          commit('SET_PAGE', {
            title: '个人项目',
            description: '这里将展示你的个人项目，当然也包括协同项目。',
            placeholder: '想早点回家吗？快来创建 Mock 呀。',
            icon: 'person',
            type: 0
          })
          break
        default:
          const groupName = (route.query && route.query.name) || '团队项目'
          commit('SET_PAGE', {
            title: groupName,
            description: `欢迎来到${groupName}，与大家一起愉快的 Mock 吧。`,
            placeholder: '团队项目更适合多人协作，快来创建项目吧。',
            icon: 'person-stalker',
            type: 1
          })
          commit('SET_REQUEST_PARAMS', {
            groupId: route.params.id
          })
          break
      }
    },
    FETCH ({ commit, state }) {
      return api.project.getList({
        params: {
          page_size: 30,
          page_index: state.pageIndex,
          keywords: state.keywords,
          type: state.projectType,
          group: state.groupId,
          filter_by_author: state.filterByAuthor
        }
      }).then((res) => {
        if (res.data.success) {
          commit('SET_LIST', res.data.data)
          state.pageIndex += 1
          commit('SET_REQUEST_PARAMS', { pageIndex: state.pageIndex })
          return res.data.data
        }
      })
    },
    REMOVE ({ dispatch }, projectId) {
      return api.project.delete({ data: { id: projectId } })
    },
    WORKBENCH (context, projectExtend) {
      projectExtend.is_workbench = !projectExtend.is_workbench
      return api.project.updateWorkbench({
        data: {
          id: projectExtend._id,
          status: projectExtend.is_workbench
        }
      })
    },
    QUERY ({ commit, dispatch }, keywords) {
      commit('SET_REQUEST_PARAMS', { keywords, pageIndex: 1 })
      dispatch('FETCH')
    }
  }
}
