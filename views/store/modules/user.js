export default {
  namespaced: true,
  mutations: {
    SET_VALUE (state, payload) {
      console.log(payload)
      state.id = payload._id
      state.name = payload.name
      state.nickName = payload.nick_name
      state.email = payload.email
      state.headImg = payload.head_img
      state.token = payload.token
    }
  }
}
