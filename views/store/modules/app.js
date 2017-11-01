export default {
  namespaced: true,
  mutations: {
    SET_READ_CHANGELOG (state, payload) {
      state.readChangelog = payload
    }
  },
  actions: {
    SET_READ_CHANGELOG ({ commit }, state) {
      commit('SET_READ_CHANGELOG', state)
    }
  }
}
