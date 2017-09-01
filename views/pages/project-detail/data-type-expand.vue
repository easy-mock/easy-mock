<template>
  <div class="em-data-type-expand">
    <div v-if="typeof models !== 'string'">
      <p v-for="(item, index) in models" :key="index">
        <pre>{{item._id_ || 'Response Root'}} {{item | formatParamModel}}</pre>
      </p>
    </div>
    <p v-else>{{models}}</p>
  </div>
</template>

<script>
import { formatParamModel } from './util'
export default {
  props: {
    models: {}
  },
  filters: {
    formatParamModel
  }
}
</script>
