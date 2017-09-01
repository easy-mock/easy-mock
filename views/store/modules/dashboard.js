import * as api from '../../api'

export default {
  namespaced: true,
  state: {
    total: {
      userCount: 0,
      mockCount: 0,
      projectCount: 0,
      mockUseCount: 0
    },
    today: {
      userCount: 0,
      mockCount: 0,
      projectCount: 0,
      mockUseCount: 0
    },
    users: []
  },
  mutations: {
    SET_VALUE (state, { total, today, users }) {
      state.total = total
      state.today = today
      state.users = users
    }
  },
  actions: {
    FETCH ({ commit }) {
      return Promise.all([
        api.realtime.getList(),
        api.u.getList({
          params: {
            page_size: 36
          }
        })
      ]).then((result) => {
        if (result[0].data.success && result[1].data.success) {
          commit('SET_VALUE', {
            total: result[0].data.data.total,
            today: result[0].data.data.today,
            users: result[1].data.data
          })
        }
      })
    }
  }
}
