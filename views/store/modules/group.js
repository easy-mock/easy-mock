import iView from 'iview'
import * as api from '../../api'

export default {
  namespaced: true,
  state: {
    list: []
  },
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
          iView.Message.success('创建成功')
          return dispatch('FETCH')
        }
      })
    },
    JOIN ({ dispatch }, groupName) {
      return dispatch('FETCH', groupName).then((res) => {
        if (res.data[0]) {
          return api.group.join({
            data: { id: res.data[0]._id }
          }).then((res) => {
            if (res.data.success) {
              iView.Message.success('已加入 ' + groupName)
              return dispatch('FETCH')
            }
          })
        } else {
          iView.Message.info(groupName + ' 不存在')
        }
      })
    },
    REMOVE ({ dispatch }, groupId) {
      return api.group.delete({
        data: { id: groupId }
      }).then((res) => {
        if (res.data.success) {
          iView.Message.success('操作成功')
          return dispatch('FETCH')
        }
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
          iView.Message.success('更新成功')
          return dispatch('FETCH')
        }
      })
    }
  }
}
