<template>
  <div class="em-new">
    <em-header icon="plus-round"
      title="创建项目"
      description="创建一个令人愉快的项目。">
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
