<template>
  <div id="messages" class="ml-2 mr-2">
    <div class="drag-section">
      <div id="close-btn" class="btn btn-md float-right" @click.prevent="handleButtons">x</div>
      <div id="min-btn" class="btn float-right" @click.prevent="handleButtons">_</div>
    </div>
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
    <div class="drag-section text-center">
      <router-link to="/">Back to channel selection</router-link>
    </div>
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
  channel = '';

  data: IMessageResponse[] = [];

  broadCaster =
    this.channel.length > 0
      ? `${this.channel[0].charAt(0).toUpperCase() + this.channel[0].slice(1)}`
      : '';

  private api = new TwitchApi({ channels: [this.channel] });

  async prepareData(): Promise<void> {
    const response = await this.api.getTwitchChat();
    if (response && response.length > 0) {
      this.data.push(...response);
    }
  }

  handleButtons(): void {
    handleCustomButtons();
  }

  async created(): Promise<void> {
    console.log(this.$route.params.channel);
    this.channel = this.$route.params.channel;
    await this.api.initChat();
    setInterval(async () => this.prepareData(), 1000);
  }

  updated(): void {
    const container = this.$el.querySelector('#chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
</script>

<style scoped lang="scss">
#messages {
  height: 100%;

  #chat-messages {
    height: 88%;
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
    width: 100%;
    -webkit-app-region: drag;
    height: 38px;

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
