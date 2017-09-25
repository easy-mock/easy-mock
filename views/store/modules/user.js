export default {
  namespaced: true,
  mutations: {
    SET_VALUE (state, payload) {
      state.id = payload._id
      state.name = payload.name
      state.nickName = payload.nick_name
      state.headImg = payload.head_img
      state.token = payload.token
    }
  }
}
