<template>
  <div id="settings" class="background-filled">
    <MenuButtons />
    <div class="grid w-full h-full">
      <div class="flex justify-center">
        <div id="header" class="text-center mt-2 w-3/4">
          <span class="text-3xl">Choose your settings</span>
          <br />
          <span>Once you save, the window will reload and apply the new settings</span>
        </div>
      </div>
      <div class="text-center -mt-16">
        <div id="transparency" class="grid-rows-1 text-center mr-5 ml-5 border-2 py-2">
          <span class="text-2xl">Window transparency</span>
          <div class="mt-2 flex justify-center">
            <span>Fully transparent</span>
            <Slider class="w-2/5" :opacity-level="opacityLevel" @newValue="setSliderValue" />
            <span>Background filled</span>
          </div>
        </div>
        <div id="click-through" class="mt-2 grid-rows-1 text-center mr-5 ml-5 border-2 py-2">
          <div class="mt-2 mb-1 flex justify-center">
            <CheckBox
              label-text="Enable click through"
              :checked="clickThrough"
              @change="setClickThrough"
            />
          </div>
          <span class="text-red-400">
            You can revert this setting in the tray menu <br />
            since the window will not respond to any clicks anymore
          </span>
        </div>
        <div id="borders" class="mt-2 grid-rows-1 text-center mr-5 ml-5 border-2 py-2">
          <div class="mt-2 mb-1 flex justify-center">
            <CheckBox label-text="Show borders?" :checked="showborders" @change="setShowBorders" />
          </div>
        </div>
        <div
          id="background-color"
          class="mt-2 mb-2 grid-rows-1 text-center mr-5 ml-5 border-2 py-2"
        >
          <span class="text-2xl">Choose a background color</span>
          <br />
          <span class="custom-link" @click="openColorPickerPage">Online color picker</span>
          <br />
          <br />
          <span>Enter the hex value for your color</span>
          <br />
          <span>
            (prefixed with a #, e.g. <span style="color: #f9fb03;">#f9fb03</span> for yellow)
          </span>
          <div class="mt-4 mb-2 flex justify-center">
            <div class="w-2/3 text-center">
              <input
                id="channel"
                v-model="newBackgroundColor"
                type="text"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                @change="checkColorFormat"
              />
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
        <div class="flex justify-center">
          <div class="w-1/3 text-center">
            <div id="submit-button" class="mt-2 text-white-800 py-1 px-2 rounded" @click="relaunch">
              Save
            </div>
          </div>
          <div class="w-1/3 text-center ml-2">
            <div
              id="cancel-button"
              class="mt-2 text-white-800 py-1 px-2 rounded"
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
import MenuButtons from '../components/MenuButtons.vue';
import Slider from '../components/Slider.vue';
import CheckBox from '../components/CheckBox.vue';

@Component({
  name: 'Settings',
  components: { MenuButtons, Slider, CheckBox },
})
export default class Settings extends Vue {
  opacityLevel = this.$config.get('opacityLevel') || 0.01;

  clickThrough = this.$config.get('clickThrough') || false;

  showborders = this.$config.get('showBorders') || true;

  newBackgroundColor = '';

  showColorError = false;

  showColorSuccess = false;

  window;

  relaunch() {
    ipcRenderer.send('relaunch');
  }

  redirectIndex() {
    ipcRenderer.send('resize', { width: this.window[0], height: this.window[1], resizeAble: true });
    this.$router.push('/index');
  }

  setSliderValue(value) {
    this.$config.set('opacityLevel', value);
  }

  setClickThrough(value) {
    this.$config.set('clickThrough', value);
  }

  setShowBorders(value) {
    this.$config.set('showBorders', value);
  }

  openColorPickerPage() {
    shell.openExternal('https://htmlcolorcodes.com/color-picker/');
  }

  checkColorFormat() {
    this.showColorSuccess = false;
    this.showColorError = false;

    const color = this.newBackgroundColor.trim();

    if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g)) {
      this.showColorSuccess = true;
      this.newBackgroundColor = color;
      console.log(color);
      console.log(color.slice(1, color.length));
      this.$config.set('backgroundColor', color.slice(1, color.length).toLowerCase());
    } else {
      this.showColorError = color.length !== 0;
    }
  }

  created() {
    this.window = this.$route.query.windowSize;

    console.log(this.window);
    ipcRenderer.send('resize', { width: 400, height: 800 });
  }
}
</script>

<style scoped lang="scss">
#settings {
  -webkit-app-region: no-drag;

  .custom-link {
    color: #f9fb03;
    text-decoration: underline;
  }
}
</style>
