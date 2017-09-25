import * as api from '../../api'

export default {
  namespaced: true,
  mutations: {
    SET_VALUE (state, payload) {
      state.list = payload
    }
  },
  actions: {
    FETCH ({ commit }, keywords) {
      return api.group.getList({
        params: { keywords }
      }).then((res) => {
        if (res.data.success && !keywords) commit('SET_VALUE', res.data.data)
        return res.data
      })
    },
    ADD ({ dispatch }, groupName) {
      return api.group.create({
        data: {
          name: groupName
        }
      }).then((res) => {
        if (res.data.success) {
          return dispatch('FETCH')
        }
        return res.data
      })
    },
    JOIN ({ dispatch }, groupName) {
      return dispatch('FETCH', groupName).then((res) => {
        if (res.data[0]) {
          return api.group.join({
            data: { id: res.data[0]._id }
          }).then((res) => {
            if (res.data.success) {
              return dispatch('FETCH')
            }
            return res.data
          })
        } else {
          return { success: false }
        }
      })
    },
    REMOVE ({ dispatch }, groupId) {
      return api.group.delete({
        data: { id: groupId }
      }).then((res) => {
        if (res.data.success) {
          return dispatch('FETCH')
        }
        return res.data
      })
    },
    RENAME ({ dispatch }, group) {
      return api.group.update({
        data: {
          id: group.id,
          name: group.name
        }
      }).then((res) => {
        if (res.data.success) {
          return dispatch('FETCH')
        }
        return res.data
      })
    }
  }
}
