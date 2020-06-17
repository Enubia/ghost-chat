<template>
  <div id="menu-buttons">
    <div id="top" class="drag-section container mx-auto">
      <div v-if="isChatPage" class="buttons inline-flex float-left">
        <div
          id="back-btn"
          class="hover:bg-main-darker cursor-pointer text-white-800 px-4"
          @click="handleBack"
        >
          <i class="arrow inline-block left p-1" />
        </div>
      </div>
      <div class="buttons inline-flex float-right">
        <div
          v-if="isChatPage"
          id="click-through"
          class="hover:bg-main-darker cursor-pointer py-2 px-2 rounded"
          @click="handleClickThrough"
        >
          <img class="image" src="../assets/svg/ghost.svg" alt="min" />
          <p class="tooltip">
            <span class="tooltip-text mt-4 -ml-12 w-1/3 text-left absolute p-2 rounded">
              Hide borders and make the window click through
            </span>
          </p>
        </div>
        <div
          id="min-btn"
          class="hover:bg-main-darker cursor-pointer py-2 px-2 rounded"
          @click="handleMinimize"
        >
          <img class="image" src="../assets/svg/minimize.svg" alt="min" />
        </div>
        <div
          id="close-btn"
          class="hover:bg-main-darker cursor-pointer py-2 px-2"
          @click="handleClose"
        >
          <img class="image" src="../assets/svg/close.svg" alt="close" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { remote, ipcRenderer } from 'electron';
import { StoreConstants, IpcConstants } from '@/utils/constants';

@Component({
  name: 'MenuButtons',
})
export default class MenuButtons extends Vue {
  @Prop({ type: Boolean, default: false }) readonly isChatPage: boolean;

  handleBack() {
    this.$emit('go-back');
  }

  handleClickThrough() {
    this.$config.set(StoreConstants.HideBordersByIcon, true);
    this.$config.set(
      StoreConstants.SavedOpacityLevel,
      this.$config.get(StoreConstants.OpacityLevel),
    );
    this.$config.set(StoreConstants.OpacityLevel, '0.01');
    this.$config.set(StoreConstants.ShowBorders, false);
    this.$config.set(StoreConstants.ClickThrough, true);
    ipcRenderer.send(IpcConstants.SetClickThrough);
  }

  handleMinimize() {
    const window = remote.getCurrentWindow();
    window?.minimize();
  }

  handleClose() {
    ipcRenderer.send(IpcConstants.Close);
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

    .image {
      height: 20px;
      width: 20px;
    }

    #back-btn {
      padding-top: 0.45rem;
      padding-bottom: 0.25rem;
      border-radius: 10px 0.25rem 0.25rem 0.25rem;

      .arrow {
        border: solid white;
        border-width: 0 3px 3px 0;

        &.left {
          transform: rotate(135deg);
          -webkit-transform: rotate(135deg);
        }
      }
    }

    #click-through {
      .tooltip {
        .tooltip-text {
          visibility: hidden;
          z-index: 100;
          font-size: 10pt;
        }
      }

      &:hover .tooltip-text {
        visibility: visible;
        background-color: rgba(110, 71, 157, 0.58);
      }
    }

    #close-btn {
      margin-right: 1px;
      border-radius: 0.25rem 10px 0.25rem 0.25rem;
    }
  }
}
</style>
