<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default class extends Vue {}
</script>

<style scoped lang="scss">
#app {
  background: rgba(92, 39, 157, 0.18);
  color: #d0cbcb;
  border: 1px solid rgb(92, 39, 157);
  border-radius: 10px;
  height: 100%;
}
</style>
