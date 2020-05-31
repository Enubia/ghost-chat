<template>
  <div id="index" class="col-md-12">
    <div id="top" class="drag-section row">
      <div id="min-btn" class="btn ml-auto" @click.prevent="handleButtons">_</div>
      <div id="close-btn" class="btn" @click.prevent="handleButtons">x</div>
    </div>
    <div id="channel-selection" class="form-group row">
      <div class="text-center col-md-12 my-auto">
        <div id="images" class="mb-3">
          <img src="../assets/kappa.png" alt="kappa" />
          <img src="../assets/twitch.svg" alt="twitch" style="width: 100px; height: 100px;" />
        </div>
        <label for="channel"></label>
        <input
          id="channel"
          v-model="channelName"
          type="text"
          class="form-control"
          @keyup.enter="startChat"
        />
        <div class="mt-2">
          <small id="channelHelp" class="form-text text-muted">
            Channel name, e.g. Enubia1
          </small>
          <small v-if="showErrorMessage" id="channelError" class="form-text text-danger">
            Please provide a channel name!
          </small>
        </div>
        <div class="btn btn-md btn-info mt-4 w-100" @click.prevent="startChat">Go</div>
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
      this.$router.push({
        path: `/chat/${this.channelName.toLowerCase()}`,
      });
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
      color: white;
      -webkit-app-region: no-drag;
    }
  }

  #channel-selection {
    height: 90%;

    .btn-info {
      border-color: #6e479d;
      background-color: #6e479d;

      &:hover {
        border-color: #563879;
        background-color: #563879;
      }
    }
  }
}
</style>
