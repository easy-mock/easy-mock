<template>
  <div class="em-new">
    <em-header icon="plus-round"
      :title="$t('p.new.header.title')"
      :description="$t('p.new.header.description')">
    </em-header>
    <em-keyboard-short></em-keyboard-short>
    <project></project>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import Project from './project'

export default {
  name: 'new',
  components: { Project }
}
</script>
