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

<style scoped></style>
