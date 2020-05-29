<template>
  <div id="app">
    <div id="title-bar-btns">
      <div id="close-btn" class="btn float-right">x</div>
      <div id="min-btn" class="btn float-right">-</div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default class extends Vue {}
</script>

<style scoped lang="scss">
#app {
  color: #d0cbcb;
  border: 1px solid rgb(92, 39, 157);
  border-radius: 10px;
  height: 100%;

  #title-bar-btns {
    -webkit-app-region: drag;
  }
}
</style>
