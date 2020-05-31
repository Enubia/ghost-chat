<template>
  <div id="messages" class="ml-2 mr-2">
    <div class="drag-section"></div>
    <div id="chat-messages">
      <div v-for="item of data" :key="item.key">
        <div
          :style="item.message.startsWith(`@${broadCaster}`) ? 'background: #d15b5b' : ''"
          class="mb-1"
        >
          <b :style="'color:' + (item.user ? item.user.color : 'white')">
            {{ (item.user && item.user.name) || 'John Doe' }}
          </b>
          : {{ item.message }}
        </div>
      </div>
    </div>
    <div class="drag-section"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TwitchApi, { IMessageResponse } from '../../api/twitchApi';
import { handleCustomButtons } from '../helper/customFrameButtons';

@Component({
  name: 'Chat',
  components: {},
})
export default class Chat extends Vue {
  data: IMessageResponse[] = [];

  channels = ['zizaran'];

  broadCaster = `${this.channels[0].charAt(0).toUpperCase() + this.channels[0].slice(1)}`;

  private api = new TwitchApi({ channels: this.channels });

  async prepareData(): Promise<void> {
    const response = await this.api.getTwitchChat();
    if (response && response.length > 0) {
      this.data.push(...response);
    }
  }

  async created(): Promise<void> {
    handleCustomButtons();
    await this.api.initChat();
    setInterval(async () => this.prepareData(), 1000);
  }
}
</script>

<style scoped lang="scss">
#messages {
  height: 100%;
  width: 95%;

  #chat-messages {
    height: 95%;
    overflow: hidden;
    &:hover {
      overflow-y: scroll;
    }

    &::-webkit-scrollbar {
      width: 6px;
      background-color: rgba(245, 245, 245, 0.74);
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgb(92, 39, 157);
    }

    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(92, 39, 157, 0.3);
      background-color: rgba(92, 39, 157, 0.3);
      border-radius: 2px;
    }
  }

  .drag-section {
    -webkit-app-region: drag;
    height: 20px;
  }
}
</style>
