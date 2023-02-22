<template lang="pug">
  #menu-buttons
    #top.drag-section.container.mx-auto
      .buttons.inline-flex.float-left( v-if="isChatPage" )
        #back-btn.cursor-pointer.text-white-800.px-4( class="hover:bg-main-darker" @click="handleBack")
          i.arrow.inline-block.left.p-1

      .buttons.inline-flex.float-right
        #click-through.cursor-pointer.py-2.px-2.rounded(
          class="hover:bg-main-darker "
          v-if="isChatPage"
          @click="handleClickThrough"
        )
          img.image( src="../assets/svg/ghost.svg" alt="min" )
          p.tooltip
            span.tooltip-text.mt-4.-ml-12.text-left.absolute.p-2.rounded( class=".w-1/3" ) Hide borders and make the window click through

        #min-btn.cursor-pointer.py-2.px-2.rounded(
          class="hover:bg-main-darker"
          @click="handleMinimize"
        )
          img.image( src="../assets/svg/minimize.svg" alt="min" )

        #close-btn.cursor-pointer.py-2.px-2(
          class="hover:bg-main-darker"
          @click="handleClose"
        )
          img.image( src="../assets/svg/close.svg" alt="close" )
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

  handleBack(): void {
    this.$emit('go-back');
  }

  async manageConfigSettings(): Promise<void> {
    return new Promise((resolve) => {
      this.$config.set(StoreConstants.HideBordersByIcon, true);
      this.$config.set(
        StoreConstants.SavedOpacityLevel,
        this.$config.get(StoreConstants.OpacityLevel, '1'),
      );
      this.$config.set(StoreConstants.OpacityLevel, '0.01');
      this.$config.set(StoreConstants.ShowBorders, false);
      this.$config.set(StoreConstants.ClickThrough, true);
      resolve();
    });
  }

  async handleClickThrough(): Promise<void> {
    await this.manageConfigSettings();
    ipcRenderer.send(IpcConstants.SetClickThrough);
  }

  handleMinimize(): void {
    const window = remote.getCurrentWindow();
    window?.minimize();
  }

  handleClose(): void {
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
