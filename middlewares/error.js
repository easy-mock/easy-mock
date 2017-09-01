'use strict'

module.exports = function * (next) {
  try {
    yield next
  } catch (err) {
    const code = err.status || 500

    this.status = code

    this.body = this.util.refail(null, code)

    if (code === 500) {
      this.log.error(
        { req: this.req, err },
        '  --> %s %s %d',
        this.request.method,
        this.request.originalUrl,
        this.status
      )
    }
  }
}
