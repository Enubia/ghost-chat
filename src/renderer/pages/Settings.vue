<template lang="pug">
  #settings.background-filled

    MenuButtons

    ul.flex.border-b-2.border-gray-600.w-full.text-center
      li( class="w-2/4 -mb-px" @click="setActiveTab('general')" )
        .duration-300.w-full.uppercase.bg-none.inline-block.py-2.px-4.text-white-700.font-semibold.cursor-pointer(
          class="hover:bg-main-darker"
        ) General
      li( class="w-2/4" @click="setActiveTab('chat')" )
        .duration-300.w-full.uppercase.bg-none.inline-block.py-2.px-4.text-white-700.font-semibold.cursor-pointer(
          class=" hover:bg-main-darker"
        ) Chat

    .grid.w-full.h-full( v-if="activeTab === 'general'" )
      .text-center

        #transparency.grid-rows-1.text-center.mr-5.ml-5.py-2
          span.text-2xl Window opacity
          .mt-2.flex.justify-center
            Slider(
              class="w-2/5"
              :initial-value="opacityLevel"
              min="0.01"
              max="1"
              step="0.01"
              @new-value="setOpacityLevel"
            )
            span.ml-4 {{ Math.floor(Number(opacityLevel) * 100) }}%

        .w-full.mt-2.mb-6
          hr.delimiter

        #borders.grid-rows-1.text-center.mr-5.ml-5.py-2
          .flex.justify-center
            CheckBox(
              label-text="Show borders?"
              :checked="showBorders"
              @change="setShowBorders"
            )

        .w-full.mt-2.mb-6
          hr.delimiter

        #background-color.mb-2.grid-rows-1.text-center.mr-5.ml-5.py-2
          span.text-2xl Choose a background color
          br
          span.text-link.underline.cursor-pointer(
            class="hover:text-link-darker"
            @click="openColorPickerPage"
          ) Online color picker
          .mt-4.mb-2.flex.justify-center
            .text-center
              label( for="newBackground" )
                span Enter the hex value for your color
                br
                span (prefixed with a #, e.g. <span style="color: #f9fb03">#f9fb03</span> for yellow)
              .mt-1
                input#newBackground.shadow.appearance-none.border.rounded.w-full.py-2.px-3.text-gray-700.leading-tight(
                  v-model="newBackgroundColor"
                  type="text"
                  class="focus:outline-none focus:shadow-outline"
                  @change="checkColorFormat(true)"
                )
          div( v-if="showColorError" )
            span.text-1xl.text-red-400 Wrong format!
          div( v-if="showColorSuccess" )
            span.text-1xl Chosen color is
              span( :style="`background-color: ${newBackgroundColor}; color: black;`" ) {{ newBackgroundColor }}

        .w-full.mt-2.mb-6
          hr.delimiter

        #default-channel.grid-rows-1.text-center.mr-5.ml-5.py-2
          .mt-2.mb-2.text-center
            label( for="channel-name" ) Enter a default channel to connect to on start-up
            input#channel-name.mt-3.shadow.appearance-none.border.rounded.py-2.px-3.text-gray-700.leading-tight(
              v-model="defaultChannel"
              type="text"
              class="focus:outline-none focus:shadow-outline"
            )
          .channel-btn.absolute( class="w-2/5")
            #submit-button.duration-300.bg-main-darker.cursor-pointer.mt-2.text-white-800.py-1.px-2.rounded(
              class=" hover:bg-main-darkerTransparent"
              @click="resetDefaultChannel"
            ) Reset channel config

    .grid.w-full.h-full( v-if="activeTab === 'chat'" )
      .text-center

        #fade-out-timer.grid-rows-1.text-center.mr-5.ml-5.py-2
          .mt-4.mb-2.text-center
            label( for="fadeOut" ) Choose the removal of messages in minutes
              br
              | (recommended for slower chats, disabled on default)
              br
            input#fadeOut.mt-3.shadow.appearance-none.border.rounded.py-2.px-3.text-gray-700.leading-tight(
              v-model="newClearChatTimer"
              type="text"
              class="focus:outline-none focus:shadow-outline"
            )
          .flex.justify-center
            CheckBox(
              label-text="Use seconds instead of minutes"
              :checked="useSecondsForFadeout"
              @change="setUseSecondsForFadeout"
            )

        .w-full.mt-2.mb-6
          hr.delimiter

        #font-stroke.grid-rows-1.text-center.mr-5.ml-5.py-2
          .flex.justify-center
            CheckBox(
              label-text="Enable font strokes?"
              :checked="fontStroke"
              @change="setFontStroke"
            )
          .flex.justify-center
            CheckBox(
              label-text="Reverse chat?"
              :checked="reverseChat"
              @change="setReverseChat"
            )

        .w-full.mt-2.mb-6
          hr.delimiter

        #font-color.mb-2.grid-rows-1.text-center.mr-5.ml-5.py-2
          span.text-2xl Choose a chat font color
          br
          span.text-link.underline.cursor-pointer(
            class="hover:text-link-darker"
            @click="openColorPickerPage"
          ) Online color picker
          .mt-4.mb-2.flex.justify-center
            .text-center
              label( for="newBackground" )
                span Enter the hex value for your color
                br
                span (prefixed with a #, e.g.
                  span( style="color: #f9fb03") #f9fb03 for yellow)
              .mt-1
                input#newBackground.shadow.appearance-none.border.rounded.w-full.py-2.px-3.text-gray-700.leading-tight(
                  v-model="newChatColor"
                  type="text"
                  class="focus:outline-none focus:shadow-outline"
                  @change="checkColorFormat"
                )
          div( v-if="showColorError" )
            span.text-1xl.text-red-400 Wrong format!
          div( v-if="showColorSuccess" )
            span.text-1xl Chosen color is
              span( :style="`background-color: ${newChatColor}; color: black;`" ) {{ newChatColor }}

        .w-full.mt-2.mb-6
          hr.delimiter

        #font-size.grid-rows-1.text-center.mr-5.ml-5.py-2
          span.text-2xl Choose a chat font size
          .mt-4.mb-2.flex.justify-center
            .flex.justify-center
              Slider(
                :initial-value="newFontSize"
                min="9"
                max="35"
                step="1"
                @new-value="setFontSliderValue"
              )
                div( :style="'font-size: ' + newFontSize + 'pt'") Aa

    .buttons.grid.w-full.fixed
      .text-center
        .flex.justify-center
          .text-center( class="w-1/3" )
            #submit-button.duration-300.bg-main-darker.cursor-pointer.mt-2.text-white-800.py-1.px-2.rounded(
              class="hover:bg-main-darkerTransparent"
              @click="relaunch"
            ) Save
          .text-center.ml-2( class="w-1/3" )
            #cancel-button.duration-300.bg-main-darker.cursor-pointer.mt-2.text-white-800.py-1.px-2.rounded(
              class="hover:bg-main-darkerTransparent"
              @click="redirectIndex"
            ) Cancel
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { shell, ipcRenderer } from 'electron';
import MenuButtons from '@/renderer/components/MenuButtons.vue';
import Slider from '@/renderer/components/Slider.vue';
import CheckBox from '@/renderer/components/CheckBox.vue';
import { IpcConstants, StoreConstants } from '@/utils/constants';
import { IWindowState } from '@/renderer/types/IWindowState';

@Component({
  name: 'Settings',
  components: { MenuButtons, Slider, CheckBox },
})
export default class Settings extends Vue {
  newClearChatTimer = String(this.$config.get(StoreConstants.Timer, '0'));

  newChatColor = String(this.$config.get(StoreConstants.ChatColor, 'white'));

  newBackgroundColor = '';

  newFontSize = String(this.$config.get(StoreConstants.FontSize, '12'));

  opacityLevel = String(this.$config.get(StoreConstants.OpacityLevel, '1'));

  showBorders = Boolean(this.$config.get(StoreConstants.ShowBorders, true));

  fontStroke = Boolean(this.$config.get(StoreConstants.FontStroke, false));

  reverseChat = Boolean(this.$config.get(StoreConstants.ReverseChat, false));

  defaultChannel = String(this.$config.get(StoreConstants.DefaultChannel, ''));

  useSecondsForFadeout = Boolean(this.$config.get(StoreConstants.UseSecondsForFadeout, false));

  showColorError = false;

  showColorSuccess = false;

  windowSize: { x: number; y: number };

  windowPos: { x: number; y: number };

  tabs = ['general', 'chat'];

  activeTab = this.tabs[0];

  created(): void {
    if (this.$config.has(StoreConstants.SavedWindowState)) {
      const state = this.$config.get(StoreConstants.SavedWindowState) as IWindowState;
      this.windowSize = { x: state.sizeX, y: state.sizeY };
      this.windowPos = { x: state.posX, y: state.posY };
    }

    ipcRenderer.send(IpcConstants.Resize, {
      center: true,
    });
  }

  relaunch(): void {
    this.$config.set(StoreConstants.OpacityLevel, this.opacityLevel);
    this.$config.set(StoreConstants.ShowBorders, this.showBorders);
    this.$config.set(StoreConstants.FontStroke, this.fontStroke);
    this.$config.set(StoreConstants.ReverseChat, this.reverseChat);
    this.$config.set(StoreConstants.ChatColor, this.newChatColor);
    this.$config.set(StoreConstants.DefaultChannel, this.defaultChannel);
    this.$config.set(StoreConstants.UseSecondsForFadeout, this.useSecondsForFadeout);

    if (this.newClearChatTimer) {
      this.$config.set(StoreConstants.Timer, parseInt(this.newClearChatTimer, 10));
    }

    if (this.newBackgroundColor) {
      this.$config.set(
        StoreConstants.BackgroundColor,
        this.newBackgroundColor.slice(1, this.newBackgroundColor.length).toLowerCase(),
      );
    }

    if (this.newFontSize.length > 0) {
      this.$config.set(StoreConstants.FontSize, this.newFontSize);
    }

    if (process.env.NODE_ENV === 'production') {
      this.$config.set(StoreConstants.IsSettingsPage, false);
      ipcRenderer.send(IpcConstants.Relaunch, {
        winSize: { width: this.windowSize.x, height: this.windowSize.y },
        winPos: { x: this.windowPos.x, y: this.windowPos.y },
      });
    } else {
      ipcRenderer.send(IpcConstants.Reload, {
        winSize: { width: this.windowSize.x, height: this.windowSize.y },
      });
    }
  }

  redirectIndex(): void {
    this.$config.set(StoreConstants.IsSettingsPage, false);
    ipcRenderer.send(IpcConstants.Resize, {
      resizeAble: true,
    });
    this.$router.push('/index');
  }

  setOpacityLevel(value: string): void {
    this.opacityLevel = value;
  }

  setFontSliderValue(value: string): void {
    this.newFontSize = value;
  }

  setShowBorders(value: boolean): void {
    this.showBorders = value;
  }

  setFontStroke(value: boolean): void {
    this.fontStroke = value;
  }

  setReverseChat(value: boolean): void {
    this.reverseChat = value;
  }

  openColorPickerPage(): void {
    shell.openExternal('https://htmlcolorcodes.com/color-picker/');
  }

  checkColorFormat(font = false): void {
    this.showColorSuccess = false;
    this.showColorError = false;

    let color: string;
    if (font) {
      color = this.newChatColor.trim();
    } else {
      color = this.newBackgroundColor.trim();
    }

    if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g)) {
      this.showColorSuccess = true;
      if (font) {
        this.newChatColor = color;
      } else {
        this.newBackgroundColor = color;
      }
    } else {
      this.showColorError = color.length !== 0;
    }
  }

  setActiveTab(activeTab: string): void {
    for (const tab of this.tabs) {
      if (tab === activeTab) {
        this.activeTab = tab;
      }
    }
  }

  resetDefaultChannel(): void {
    this.$config.delete(StoreConstants.DefaultChannel);
    this.defaultChannel = '';
  }

  setUseSecondsForFadeout(): void {
    this.useSecondsForFadeout = !this.useSecondsForFadeout;
  }
}
</script>

<style scoped lang="scss">
#settings {
  -webkit-app-region: no-drag;
}
.delimiter {
  position: absolute;
  width: 60%;
  left: 20%;
  border: 1px solid rgb(179, 176, 176);
}
.buttons {
  bottom: 30px;
}

.channel-btn {
  left: 30%;
}
</style>
