<template>
  <div id="index" class="background-filled">
    <MenuButtons />
    <div class="grid w-full h-full">
      <div id="channel-selection" class="flex items-center justify-center text-center">
        <div class="w-3/4 row-span-3 sm:row-span-1 md:row-span-2 lg:row-span-3 xl:row-span-1">
          <div id="images" class="inline-flex">
            <img src="../assets/images/index-image.png" alt="kappa" class="h-32 w-32 mt-4" />
          </div>
          <label for="channel"></label>
          <div class="flex justify-center">
            <div class="w-2/3 text-center">
              <input
                id="channel"
                v-model="channelName"
                type="text"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                @keyup.enter="startChat"
              />
            </div>
          </div>
          <div class="mt-2">
            <small id="channelHelp" class="text-muted">
              Channel name, e.g. Enubia1
            </small>
            <br />
            <small v-if="showErrorMessage" id="channelError" class="text-red-400">
              Please provide a channel name!
            </small>
          </div>
          <div class="flex justify-center">
            <div class="w-1/3 text-center">
              <div
                id="submit-button"
                class="mt-2 text-white-800 py-1 px-2 rounded bg-main hover:bg-main-darker cursor-pointer"
                @click.prevent="startChat"
              >
                Go
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { StoreConstants } from '@/utils/constants';
import MenuButtons from '@/renderer/components/MenuButtons.vue';
import Chat from './Chat.vue';

@Component({
  name: 'Index',
  components: {
    MenuButtons,
    Chat,
  },
})
export default class Index extends Vue {
  channelName = '';

  showErrorMessage = false;

  startChat(): void {
    if (this.channelName.length > 0) {
      this.$config.set(StoreConstants.Channel, this.channelName.toLowerCase());
      this.$router.push('/chat');
    } else {
      this.showErrorMessage = true;
    }
  }

  updated(): void {
    if (this.showErrorMessage) {
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    }
  }

  created() {
    const channelName = String(this.$config.get(StoreConstants.Channel, ''));

    if (channelName.length > 0) {
      this.$router.push('/chat');
    } else if (this.$route.params.message === 'no-channel') {
      this.showErrorMessage = true;
    }
  }
}
</script>
<style scoped lang="scss">
#index {
  -webkit-app-region: drag;

  #channel-selection {
    height: 90%;
    -webkit-app-region: no-drag;
  }
}
</style>
