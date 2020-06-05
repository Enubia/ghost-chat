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
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500&display=swap');
#app {
  background: rgba(92, 39, 157, 0.01);
  font-family: 'Ubuntu', sans-serif;
  font-size: 12pt;
  color: lightgray;
  border: 1px solid rgba(91, 39, 154, 0.59);
  border-radius: 10px;
  height: 100%;
}
</style>
