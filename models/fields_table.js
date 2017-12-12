'use strict'

module.exports = {
  group: ['_id', 'name'],
  projectExtend: ['_id', 'is_workbench'],
  user: ['_id', 'name', 'nick_name', 'head_img', 'token'],
  mock: ['_id', 'url', 'method', 'description', 'mode', 'parameters', 'response_model'],
  project: ['_id', 'name', 'url', 'description', 'swagger_url', 'members', 'extend', 'group']
}
