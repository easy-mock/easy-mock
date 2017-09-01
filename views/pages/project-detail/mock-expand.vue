<template>
  <div class="em-mock-expand">
    <h2>Method</h2>
    <p>{{mock.method}}</p>
    <h2>URL</h2>
    <p>{{mock.url}}</p>
    <h2>描述</h2>
    <p>{{mock.description}}</p>
    <Tabs value="request" v-if="mock.parameters || mock.response_model">
      <Tab-pane label="请求参数" name="request" v-if="mock.parameters">
        <Table :columns="columnsRequest" :data="request"></Table>
      </Tab-pane>
      <Tab-pane label="响应参数" name="response" v-if="mock.response_model">
        <Table :columns="columnsResponse" :data="response"></Table>
      </Tab-pane>
      <Tab-pane label="Class Model" name="class" v-if="mock.response_model && classList.length">
        <Collapse>
          <Panel>
            JavaScript
            <div slot="content">
              <p v-for="(item, i) in classList" :key="i">
                <pre>{{item | formatClassModel('javascript')}}</pre>
              </p>
            </div>
          </Panel>
          <Panel>
            Objective-C
            <div slot="content">
              <p v-for="(item, i) in classList" :key="i">
                <pre>{{item | formatClassModel('objective-c')}}</pre>
              </p>
            </div>
          </Panel>
        </Collapse>
      </Tab-pane>
    </Tabs>
  </div>
</template>

<script>
import {
  formatJavaScriptModel,
  formatObjectiveCModel
} from './util'
import DataTypeExpand from './data-type-expand'

export default {
  props: {
    mock: {}
  },
  data () {
    return {
      columnsRequest: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(DataTypeExpand, {
              props: {
                models: params.row.models
              }
            })
          }
        },
        { title: '参数名', key: 'name' },
        { title: '描述', key: 'description' },
        { title: '参数类型', key: 'paramType' },
        { title: '数据类型', key: 'dataType' }
      ],
      columnsResponse: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(DataTypeExpand, {
              props: {
                models: params.row.models
              }
            })
          }
        },
        { title: '状态码', key: 'code' },
        { title: '描述', key: 'message' },
        { title: '返回类型', key: 'type' }
      ]
    }
  },
  computed: {
    request () {
      return this.formatJSON(this.mock.parameters, (data, len) => {
        return {
          name: data.name,
          description: data.description || '太懒了，居然不写描述',
          paramType: data.paramType || data.in,
          dataType: data.type,
          models: len === 1 ? data.type : []
        }
      })
    },
    response () {
      return this.formatJSON(this.mock.response_model, (data, len) => {
        return {
          type: data.type,
          code: data.code,
          message: data.message || data.description || '太懒了，居然不写描述',
          models: len === 1 ? data.type : []
        }
      })
    },
    classList () {
      const responseModel = this.response.filter(
        o => (o.code.toString() === '200')
      )[0]
      return responseModel && Array.isArray(responseModel.models)
        ? responseModel.models
        : []
    }
  },
  filters: {
    formatClassModel (value, type) {
      if (type === 'javascript') {
        return formatJavaScriptModel(value)
      } else if (type === 'objective-c') {
        return formatObjectiveCModel(value)
      }
    }
  },
  methods: {
    formatJSON (list, cb) {
      try {
        list = list ? JSON.parse(list) : []
      } catch (e) {
        list = []
      }
      return list.map((items) => {
        let newItem
        items.forEach((data, i) => {
          if (i === 0) { // 表格数据源
            const type = this.getTypeAction(data) || 'void'
            newItem = cb({ type, ...data }, items.length) // eslint-disable-line
          } else { // 数据类型
            newItem.models.push(data)
          }
        })
        return newItem
      })
    },
    getTypeAction (model) {
      let type
      let isArray

      if (model.schema) {
        type = model.schema.type || model.schema.$ref
        isArray = type === 'array'
        type = isArray ? (model.schema.items.type || model.schema.items.$ref) : type
      } else {
        type = model.type || model.$ref
        isArray = type === 'array'
        // string boolean array userModel
        type = isArray ? (model.items.type || model.items.$ref) : type
      }

      type = type || ''

      // #/definitions/user => definitions.user
      // user => models.user
      type = type[0] === '#' ? type.split('/').slice(-1)[0] : type
      return isArray ? `Array[${type}]` : type
    }
  }
}
</script>
