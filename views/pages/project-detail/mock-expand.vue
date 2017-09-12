<template>
  <div class="em-mock-expand">
    <h2>Method</h2>
    <p>{{mock.method}}</p>
    <h2>URL</h2>
    <p>{{mock.url}}</p>
    <h2>{{$t('p.detail.expand.description')}}</h2>
    <p>{{mock.description}}</p>
    <Tabs value="request" v-if="mock.parameters || mock.response_model">
      <Tab-pane :label="$t('p.detail.expand.tab[0]')" name="request" v-if="mock.parameters">
        <Table :columns="columnsRequest" :data="request"></Table>
      </Tab-pane>
      <Tab-pane :label="$t('p.detail.expand.tab[1]')" name="response" v-if="mock.response_model">
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
        { title: this.$t('p.detail.expand.columnsRequest[0]'), key: 'name' },
        { title: this.$t('p.detail.expand.columnsRequest[1]'), key: 'description' },
        { title: this.$t('p.detail.expand.columnsRequest[2]'), key: 'paramType' },
        { title: this.$t('p.detail.expand.columnsRequest[3]'), key: 'dataType' }
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
        { title: this.$t('p.detail.expand.columnsResponse[0]'), key: 'code' },
        { title: this.$t('p.detail.expand.columnsResponse[1]'), key: 'message' },
        { title: this.$t('p.detail.expand.columnsResponse[2]'), key: 'type' }
      ]
    }
  },
  computed: {
    request () {
      return this.formatJSON(this.mock.parameters, (data, len) => {
        return {
          name: data.name,
          description: data.description || this.$t('p.detail.expand.defaultDescription'),
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
          message: data.message || data.description || this.$t('p.detail.expand.defaultDescription'),
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
