import * as api from '../../api'

export default {
  namespaced: true,
  mutations: {
    SET_VALUE (state, payload) {
      state.url = payload.url
      state.copyright = payload.copyright
    }
  },
  actions: {
    FETCH ({ commit }) {
      let url
      let copyright
      return api.util.wallpaper().then((res) => {
        const body = res.data
        const data = body.data.data[0]
        if (body.data.type === 'bing') {
          url = /\.com/.test(data.url) ? data.url : 'https://cn.bing.com' + data.url
          copyright = {
            name: 'Bing',
            link: /\.com/.test(data.copyrightlink)
              ? data.copyrightlink : 'https://cn.bing.com' + data.copyrightlink
          }
        } else { // unsplash
          url = data.urls.raw + '?w=2200'
          copyright = {
            name: data.user.name,
            profileImage: data.user.profile_image.small,
            link: data.user.links.html
          }
        }
        commit('SET_VALUE', { url, copyright })
      })
    }
  }
}
