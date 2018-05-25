import Vue from 'vue'
import Router from 'vue-router'

import docs from 'pages/docs'
import login from 'pages/login'
import group from 'pages/group'
import editor from 'pages/editor'
import project from 'pages/project'
import profile from 'pages/profile'
import createProject from 'pages/new'
import logOut from 'components/log-out'
import dashboard from 'pages/dashboard'
import detail from 'pages/project-detail'
import layout from 'components/layout/index'

Vue.use(Router)

export function createRouter () {
  const router = new Router({
    mode: 'history',
    routes: [
      { path: '/login', component: login },
      { path: '/log-out', component: logOut },
      {
        path: '/',
        component: layout,
        children: [
          { path: '/', component: project },
          { path: 'workbench', component: project },
          { path: 'group/:id', component: project },
          { path: 'group', component: group },
          { path: 'docs', component: docs },
          { path: 'changelog', component: docs },
          { path: 'dashboard', component: dashboard },
          { path: 'profile', component: profile },
          { path: 'new', component: createProject },
          { path: 'project/:id', component: detail },
          { path: 'editor/:projectId', component: editor },
          { path: 'editor/:projectId/:id', component: editor }
        ]
      }
    ]
  })

  return router
}
