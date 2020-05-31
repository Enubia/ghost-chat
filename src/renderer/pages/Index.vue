<template>
  <div id="index">
    <div id="top" class="drag-section">
      <div id="close-btn" class="btn float-right" @click.prevent="handleButtons">x</div>
      <div id="min-btn" class="btn float-right" @click.prevent="handleButtons">_</div>
    </div>
    <div class="form-group">
      <label for="channel">Channel name:</label>
      <input id="channel" v-model="channelName" type="text" class="form-control" />
      <small id="channelHelp" class="form-text text-muted">
        e.g. Enubia1
      </small>
      <div class="btn btn-md btn-info" @click.prevent="startChat">Go</div>
    </div>
    <div id="bottom" class="drag-section"></div>
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

  startChat(): void {
    if (this.channelName.length > 0) {
      this.channelName.toLowerCase();
      this.$router.push({
        path: `/chat`,
        params: { channel: this.channelName },
      });
    }
  }

  handleButtons(): void {
    handleCustomButtons();
  }
}
</script>
<style scoped lang="scss">
#index {
  height: 100%;

  .drag-section {
    width: 100%;
    -webkit-app-region: drag;
    height: 38px;

    &#top {
      border-radius: 10px 10px 0 0;
    }

    &#bottom {
      border-radius: 0 0 10px 10px;
    }

    &:hover {
      background-color: rgb(92, 39, 157);
    }

    #min-btn,
    #close-btn {
      color: white;
      -webkit-app-region: no-drag;
    }
  }
}
</style>
