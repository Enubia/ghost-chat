<template>
  <div id="settings" class="background-filled">
    <MenuButtons />
    <ul class="flex border-b-2 border-gray-600 w-full text-center">
      <li class="w-2/4 -mb-px" @click="setActiveTab('general')">
        <div
          class="duration-300 w-full uppercase bg-none inline-block py-2 px-4 hover:bg-main-darker text-white-700 font-semibold cursor-pointer"
        >
          General
        </div>
      </li>
      <li class="w-2/4" @click="setActiveTab('chat')">
        <div
          class="duration-300 w-full uppercase bg-none inline-block py-2 px-4 hover:bg-main-darker text-white-700 font-semibold cursor-pointer"
        >
          Chat
        </div>
      </li>
    </ul>
    <div v-if="activeTab === 'general'" class="grid w-full h-full">
      <div class="text-center">
        <div id="transparency" class="grid-rows-1 text-center mr-5 ml-5 py-2">
          <span class="text-2xl">Window transparency</span>
          <div class="mt-2 flex justify-center">
            <Slider
              class="w-2/5"
              :initial-value="opacityLevel"
              min="0.01"
              max="1"
              step="0.01"
              @newValue="setOpacityLevel"
            />
            <span class="ml-4">{{ Math.floor(Number(opacityLevel) * 100) }}%</span>
          </div>
        </div>
        <div class="w-full mt-2 mb-6">
          <hr class="delimiter" />
        </div>
        <div id="borders" class="grid-rows-1 text-center mr-5 ml-5 py-2">
          <div class="flex justify-center">
            <CheckBox label-text="Show borders?" :checked="showborders" @change="setShowBorders" />
          </div>
        </div>
        <div class="w-full mt-2 mb-6">
          <hr class="delimiter" />
        </div>
        <div id="background-color" class="mb-2 grid-rows-1 text-center mr-5 ml-5 py-2">
          <span class="text-2xl">Choose a background color</span>
          <br />
          <span
            class="text-link hover:text-link-darker underline cursor-pointer"
            @click="openColorPickerPage"
          >
            Online color picker
          </span>
          <div class="mt-4 mb-2 flex justify-center">
            <div class="text-center">
              <label for="newBackground">
                <span>Enter the hex value for your color</span>
                <br />
                <span>
                  (prefixed with a #, e.g. <span style="color: #f9fb03">#f9fb03</span> for yellow)
                </span>
              </label>
              <div class="mt-1">
                <input
                  id="newBackground"
                  v-model="newBackgroundColor"
                  type="text"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  @change="checkColorFormat(true)"
                />
              </div>
            </div>
          </div>
          <div v-if="showColorError">
            <span class="text-1xl text-red-400">Wrong format!</span>
          </div>
          <div v-if="showColorSuccess">
            <span class="text-1xl">
              Chosen color is
              <span :style="`background-color: ${newBackgroundColor}; color: black;`">{{
                newBackgroundColor
              }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'chat'" class="grid w-full h-full">
      <div class="text-center">
        <div id="fade-out-timer" class="grid-rows-1 text-center mr-5 ml-5 py-2">
          <div class="mt-4 mb-2 text-center">
            <label for="fadeOut">
              Choose the removal of messages in minutes <br />
              (recommended for slower chats, disabled on default)
            </label>
            <input
              id="fadeOut"
              v-model="newClearChatTimer"
              type="text"
              class="mt-3 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div class="w-full mt-2 mb-6">
          <hr class="delimiter" />
        </div>
        <div id="font-stroke" class="grid-rows-1 text-center mr-5 ml-5 py-2">
          <div class="flex justify-center">
            <CheckBox
              label-text="Enable font strokes?"
              :checked="fontStroke"
              @change="setFontStroke"
            />
          </div>
        </div>
        <div class="w-full mt-2 mb-6">
          <hr class="delimiter" />
        </div>
        <div id="font-color" class="mb-2 grid-rows-1 text-center mr-5 ml-5 py-2">
          <span class="text-2xl">Choose a chat font color</span>
          <br />
          <span
            class="text-link hover:text-link-darker underline cursor-pointer"
            @click="openColorPickerPage"
          >
            Online color picker
          </span>
          <div class="mt-4 mb-2 flex justify-center">
            <div class="text-center">
              <label for="newBackground">
                <span>Enter the hex value for your color</span>
                <br />
                <span>
                  (prefixed with a #, e.g. <span style="color: #f9fb03">#f9fb03</span> for yellow)
                </span>
              </label>
              <div class="mt-1">
                <input
                  id="newBackground"
                  v-model="newChatColor"
                  type="text"
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  @change="checkColorFormat"
                />
              </div>
            </div>
          </div>
          <div v-if="showColorError">
            <span class="text-1xl text-red-400">Wrong format!</span>
          </div>
          <div v-if="showColorSuccess">
            <span class="text-1xl">
              Chosen color is
              <span :style="`background-color: ${newChatColor}; color: black;`">{{
                newChatColor
              }}</span>
            </span>
          </div>
        </div>
        <div class="w-full mt-2 mb-6">
          <hr class="delimiter" />
        </div>
        <div id="font-size" class="grid-rows-1 text-center mr-5 ml-5 py-2">
          <span class="text-2xl">Choose a chat font size</span>
          <div class="mt-4 mb-2 flex justify-center">
            <div class="flex justify-center">
              <Slider
                :initial-value="newFontSize"
                min="5"
                max="35"
                step="1"
                @newValue="setFontSliderValue"
              >
                <div :style="'font-size: ' + newFontSize + 'pt'">Aa</div>
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="buttons grid w-full fixed">
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-1/3 text-center">
            <div
              id="submit-button"
              class="duration-300 bg-main hover:bg-main-darker cursor-pointer mt-2 text-white-800 py-1 px-2 rounded"
              @click="relaunch"
            >
              Save
            </div>
          </div>
          <div class="w-1/3 text-center ml-2">
            <div
              id="cancel-button"
              class="duration-300 bg-main hover:bg-main-darker cursor-pointer mt-2 text-white-800 py-1 px-2 rounded"
              @click="redirectIndex"
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  opacityLevel = this.$config.get(StoreConstants.OpacityLevel, '1');

  showborders = this.$config.get(StoreConstants.ShowBorders, true);

  newClearChatTimer = String(this.$config.get(StoreConstants.Timer, '0'));

  fontStroke = this.$config.get(StoreConstants.FontStroke, false);

  newStrokeColor = this.$config.get(StoreConstants.StrokeColor, '#000');

  newChatColor = String(this.$config.get(StoreConstants.ChatColor, 'white'));

  newBackgroundColor = '';

  newFontSize = String(this.$config.get(StoreConstants.FontSize, '12'));

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
      winSize: { width: 800, height: 300 },
      keepPosition: true,
    });
  }

  relaunch(): void {
    this.$config.set(StoreConstants.OpacityLevel, this.opacityLevel);
    this.$config.set(StoreConstants.ShowBorders, this.showborders);
    this.$config.set(StoreConstants.FontStroke, this.fontStroke);
    this.$config.set(StoreConstants.ChatColor, this.newChatColor);

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
    ipcRenderer.send(IpcConstants.Resize, { resizeAble: true });
    this.$router.push('/index');
  }

  setOpacityLevel(value: number): void {
    this.opacityLevel = value.toString();
  }

  setFontSliderValue(value: number): void {
    this.newFontSize = value.toString();
  }

  setShowBorders(value: boolean): void {
    this.showborders = value;
  }

  setFontStroke(value: boolean): void {
    this.fontStroke = value;
  }

  openColorPickerPage(): void {
    shell.openExternal('https://htmlcolorcodes.com/color-picker/');
  }

  checkColorFormat(font = false): void {
    this.showColorSuccess = false;
    this.showColorError = false;

    let color;
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
</style>
