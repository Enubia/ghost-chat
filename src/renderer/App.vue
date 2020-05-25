<template>
  <div id="app" :class="showBorder ? 'showBorder' : ''" class="container">
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      showBorder: true,
    };
  },
};
</script>

<style scoped></style>
