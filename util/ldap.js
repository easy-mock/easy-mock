'use strict'

const ldap = require('ldapjs')
const config = require('config')

const ldapConf = config.get('ldap')

function createClient (opts) {
  return new Promise((resolve, reject) => {
    const dn = opts.credentials.dn
    const passwd = opts.credentials.passwd
    const client = ldap.createClient(opts)

    function onConnect () {
      client.removeListener('error', onError)
      client.bind(dn, passwd, err => {
        /* istanbul ignore if */
        if (err) reject(new Error(err))
        else resolve(client)
      })
    }

    /* istanbul ignore next */
    function onError (err) {
      client.removeListener('connect', onConnect)
      reject(new Error(err))
    }

    client.once('connect', onConnect)
    client.once('error', onError)
    client.once('connectTimeout', /* istanbul ignore next */ () => {
      onError(new Error('connect timeout'))
    })
  })
}

module.exports = class LDAPUtil {
  static async createClient () {
    return createClient({
      url: ldapConf.server,
      credentials: {
        dn: ldapConf.bindDN,
        passwd: ldapConf.password
      }
    })
  }
  static closeClient (client) {
    client.destroy()
  }
  static get enable () {
    return !!ldapConf.server
  }
  static async authenticate (username, password, client) {
    return new Promise((resolve, reject) => {
      if (!client) return reject(new Error('LDAP connection is not yet bound'))

      const opts = {
        scope: 'sub',
        filter: `(${ldapConf.filter.attributeName}=${username})`
      }

      client.search(ldapConf.filter.base, opts, (err, search) => {
        /* istanbul ignore if */
        if (err) return reject(new Error(err))

        const items = []

        search.on('error', /* istanbul ignore next */ e => {
          if (e) reject(new Error(e))
        })

        search.on('searchEntry', entry => {
          items.push(entry.object)
        })

        search.on('end', result => {
          if (items.length === 1) {
            // create ldap client for user bind
            createClient({
              url: ldapConf.server,
              credentials: {
                dn: items[0].dn,
                passwd: password
              }
            }).then(client => {
              // unbind connection is disconnected
              client.unbind(() => resolve(true))
            }).catch(() => {
              reject(new Error('用户名或密码错误'))
            })
          } else {
            reject(new Error('用户名或密码错误'))
          }
        })
      })
    })
  }
}
