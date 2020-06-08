<template>
  <div
    id="app"
    :style="`background: ${$windowBackgroundColor}; ${
      $showBorder ? 'border: 1.5px solid black;' : ''
    }`"
  >
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
  font-family: 'Ubuntu', sans-serif;
  font-size: 12pt;
  color: lightgray;
  border-radius: 10px;
  height: 100%;
}
</style>
