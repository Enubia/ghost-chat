<template>
  <div id="menu-buttons">
    <div id="top" class="drag-section container mx-auto">
      <div class="buttons inline-flex float-right">
        <div id="min-btn" class="text-white-800 py-2 px-4 rounded" @click="handleButtons">
          _
        </div>
        <div id="close-btn" class="text-white-800 py-2 px-4 rounded" @click="handleButtons">
          x
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { handleCustomButtons } from '../helper/customFrameButtons';

@Component({
  name: 'MenuButtons',
})
export default class MenuButtons extends Vue {
  handleButtons() {
    handleCustomButtons();
  }
}
</script>

<style scoped lang="scss">
.drag-section {
  width: 100%;
  -webkit-app-region: drag;
  height: 38px;
  background: rgba(92, 39, 157, 0.01);
  border-radius: 10px 10px 0 0;
  border-color: rgba(110, 71, 157, 0.67);
}
</style>
