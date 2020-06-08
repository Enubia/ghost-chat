<template>
  <div id="menu-buttons">
    <div id="top" class="drag-section container mx-auto">
      <div class="buttons inline-flex float-right mr-1">
        <div id="min-btn" class="text-white-800 py-2 px-4 rounded" @click="handleMinimize">
          _
        </div>
        <div id="close-btn" class="text-white-800 py-2 px-4 rounded" @click="handleClose">
          x
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { remote, ipcRenderer } from 'electron';

@Component({
  name: 'MenuButtons',
})
export default class MenuButtons extends Vue {
  handleMinimize() {
    const window = remote.getCurrentWindow();
    window?.minimize();
  }

  handleClose() {
    ipcRenderer.send('close');
  }
}
</script>

<style scoped lang="scss">
.drag-section {
  width: 100%;
  -webkit-app-region: drag;
  height: 38px;

  .buttons {
    -webkit-app-region: no-drag;
    color: white;
    #min-btn {
      &:hover {
        cursor: pointer;
        background-color: #563879;
      }
    }

    #close-btn {
      &:hover {
        cursor: pointer;
        background-color: #563879;
      }
    }
  }
}
</style>
