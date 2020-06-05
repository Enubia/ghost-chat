<template>
  <div id="index" class="grid w-full">
    <div id="top" class="drag-section container mx-auto">
      <div id="buttons" class="inline-flex float-right">
        <div id="min-btn" class="text-white-800 py-2 px-4 rounded" @click.prevent="handleButtons">
          _
        </div>
        <div id="close-btn" class="text-white-800 py-2 px-4 rounded" @click.prevent="handleButtons">
          x
        </div>
      </div>
    </div>
    <div id="channel-selection" class="grid grid-rows-3">
      <div class="text-center row-span-3 sm:row-span-1 md:row-span-2 lg:row-span-3 xl:row-span-1">
        <div id="images" class="inline-flex">
          <img src="../assets/kappa.png" alt="kappa" class="h-32 w-32" />
          <img src="../assets/twitch.svg" alt="twitch" class="h-24 w-24 mt-4" />
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
              class="mt-2 text-white-800 py-1 px-2 rounded"
              @click.prevent="startChat"
            >
              Go
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Chat from './Chat.vue';
import { handleCustomButtons } from '../helper/customFrameButtons';

@Component({
  name: 'Index',
  components: {
    Chat,
  },
})
export default class Index extends Vue {
  channelName = '';

  showErrorMessage = false;

  startChat(): void {
    if (this.channelName.length > 0) {
      this.$store.commit('setChannelName', this.channelName.toLowerCase());
      this.$router.push('/chat');
    } else {
      this.showErrorMessage = true;
    }
  }

  handleButtons(): void {
    handleCustomButtons();
  }

  updated(): void {
    if (this.showErrorMessage) {
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    }
  }
}
</script>
<style scoped lang="scss">
#index {
  height: 100%;
  border-radius: 10px;
  background-color: #471e78;
  -webkit-app-region: drag;

  .drag-section {
    #min-btn,
    #close-btn {
      &:hover {
        cursor: pointer;
      }
    }
  }

  #channel-selection {
    height: 90%;
    -webkit-app-region: no-drag;

    #submit-button {
      border-color: #6e479d;
      background-color: #6e479d;

      &:hover {
        cursor: pointer;
        border-color: #563879;
        background-color: #563879;
      }
    }
  }
}
</style>
