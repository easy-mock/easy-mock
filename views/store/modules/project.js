import * as api from '../../api'

export default {
  namespaced: true,
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
    }
  },
  actions: {
    INIT_PAGE ({ commit, rootState }, route) {
      switch (route.fullPath) {
        case '/workbench':
          commit('SET_REQUEST_PARAMS', {
            projectType: 'workbench'
          })
          break
        default:
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
