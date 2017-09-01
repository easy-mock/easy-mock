import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const getComponent = page => () => import(`pages/${page}`)

export function createRouter () {
  const router = new Router({
    mode: 'history',
    routes: [
      {
        path: '/login',
        component: getComponent('login')
      },
      {
        path: '/log-out',
        component: () => import('components/log-out')
      },
      {
        path: '/',
        component: () => import('components/layout/index'),
        children: [
          {
            path: '/',
            component: getComponent('project')
          },
          {
            path: 'workbench',
            component: getComponent('project')
          },
          {
            path: 'group/:id',
            component: getComponent('project')
          },
          {
            path: 'group',
            component: getComponent('group')
          },
          {
            path: 'docs',
            component: getComponent('docs')
          },
          {
            path: 'changelog',
            component: getComponent('docs')
          },
          {
            path: 'dashboard',
            component: getComponent('dashboard')
          },
          {
            path: 'profile',
            component: getComponent('profile')
          },
          {
            path: 'new',
            component: getComponent('new')
          },
          {
            path: 'project/:id',
            component: getComponent('project-detail')
          }
        ]
      }
    ]
  })

  return router
}
