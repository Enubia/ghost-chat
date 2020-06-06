<template>
  <div id="settings" class="background-filled">
    <MenuButtons />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MenuButtons from '../components/MenuButtons.vue';

@Component({
  name: 'Settings',
  components: { MenuButtons },
})
export default class Settings extends Vue {}
</script>

<style scoped lang="scss">
#settings {
  -webkit-app-region: no-drag;
}
</style>
