<template>
  <div id="messages" class="w-full">
    <MenuButtons v-if="!isSetHideBordersByIcon" :is-chat-page="true" @go-back="disconnectChat" />
    <div id="chat-messages" class="container mx-auto px-4">
      <div v-if="isLoading">
        <Loading loading-text="Loading Chat ⊂(◉‿◉)つ" />
      </div>
      <div v-else-if="!isLoading && isWaitingForMessages">
        <span>Connected, waiting for messages...</span>
      </div>
      <div v-for="item of data" v-else :key="item.key">
        <div
          :style="
            item.message.toLowerCase().includes(`@${broadCaster}`) ? 'background: #d15b5b' : ''
          "
          class="mb-1 text-white"
        >
          <div class="break-words">
            <div v-if="item.user && item.user.badges">
              <img
                v-for="badge in item.user.badges"
                :key="badge.key"
                class="badges"
                alt="badge"
                :src="badge.badge"
              />
            </div>
            <b :style="'color:' + (item.user ? item.user.color : 'white')">
              {{ (item.user && item.user.name) || 'John Doe' }}
              <span class="text-white font-light">: </span></b
            >
            <ChatMessage :message="item.message" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IMessageResponse } from '@/api/types/IMessageResponse';
import { StoreConstants } from '@/utils/constants';
import TwitchApi from '@/api/twitchApi';
import Loading from '@/renderer/components/Loading.vue';
import MenuButtons from '@/renderer/components/MenuButtons.vue';
import ChatMessage from '@/renderer/components/ChatMessage.vue';

@Component({
  name: 'Chat',
  components: {
    Loading,
    MenuButtons,
    ChatMessage,
  },
})
export default class Chat extends Vue {
  channel = String(this.$config.get(StoreConstants.Channel, ''));

  data: IMessageResponse[] = [];

  broadCaster = '';

  api: TwitchApi;

  isSetHideBordersByIcon = false;

  isLoading = true;

  isWaitingForMessages = true;

  interval: NodeJS.Timeout;

  prepareData(): void {
    const response = this.api.getTwitchChat();
    if (response.length > 0) {
      this.data.push(...response);
      this.isWaitingForMessages = false;
    }
    this.isLoading = false;
  }

  async disconnectChat(): Promise<void> {
    this.$config.delete(StoreConstants.Channel);
    clearInterval(this.interval);
    await this.api.disconnect();
    await this.$router.push({
      path: '/index',
    });
  }

  async created(): Promise<void> {
    this.isSetHideBordersByIcon = this.$config.has(StoreConstants.HideBordersByIcon);
    if (this.channel.length > 0) {
      [this.broadCaster] = this.channel;
      this.api = new TwitchApi({ channels: [this.channel] });
      await this.api.connect();
      await this.api.initChat();
      this.interval = setInterval(() => this.prepareData(), 1000);
    } else {
      await this.$router.push({
        name: 'index',
        params: { message: 'no-channel' },
      });
    }
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
    height: 90%;
    overflow: hidden;
    &:hover {
      overflow-y: scroll;
    }

    &::-webkit-scrollbar {
      display: none;
    }

    .badges {
      margin-top: 3px;
      margin-right: 3px;
      min-width: 15px;
      min-height: 15px;
      float: left;
    }
  }
}
</style>
