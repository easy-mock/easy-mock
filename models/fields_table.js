'use strict'

module.exports = {
  group: ['_id', 'name'],
  mock: ['_id', 'url', 'method', 'description', 'mode', 'parameters', 'response_model', 'is_authentic'],
  user: ['_id', 'name', 'nick_name', 'head_img', 'token'],
  project: ['_id', 'name', 'url', 'description', 'swagger_url', 'address',
    'members', 'extend', 'group'],
  projectExtend: ['_id', 'is_workbench']
}
