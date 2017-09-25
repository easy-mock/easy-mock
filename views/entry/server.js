/* eslint prefer-promise-reject-errors: 0 */
import { createApp } from './main'

const isDev = process.env.NODE_ENV !== 'production'

export default context => {
  return new Promise((resolve, reject) => {
    const s = isDev && Date.now()
    const { app, router, store } = createApp()
    const { url } = context
    const fullPath = router.resolve(url).route.fullPath

    if (fullPath !== url) {
      return reject({ url: fullPath })
    }

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
        isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
        context.state = store.state
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
