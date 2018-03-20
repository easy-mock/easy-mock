/* eslint prefer-promise-reject-errors: 0 */
import { createApp } from './main'

let serverCookies

export { serverCookies }
export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()
    const { url } = context
    const fullPath = router.resolve(url).route.fullPath

    if (fullPath !== url) {
      return reject({ url: fullPath })
    }

    serverCookies = context.cookies
    router.push(url)
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
        store,
        route: router.currentRoute
      }))).then(() => {
        context.state = store.state
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
