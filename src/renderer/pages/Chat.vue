<template>
  <div id="messages" class="w-full">
    <MenuButtons v-if="!isSetHideBordersByIcon" :is-chat-page="true" @go-back="disconnectChat" />
    <div
      id="chat-messages"
      class="container mx-auto px-4"
      :style="`${$fontSize ? 'font-size: ' + $fontSize + 'pt' : ''}`"
    >
      <div v-if="isLoading" style="font-size: 12pt">
        <Loading loading-text="Loading Chat ⊂(◉‿◉)つ" />
      </div>
      <div v-else-if="!isLoading && isWaitingForMessages" style="font-size: 12pt">
        <span>Connected, waiting for messages...</span>
      </div>
      <div v-for="item of data" v-else :key="item.key">
        <div
          :style="
            item.message.toLowerCase().includes(`@${broadCaster}`) ? 'background: #d15b5b' : ''
          "
          class="mb-1 text-text-white"
        >
          <div id="message" class="break-words">
            <div v-if="item.user && item.user.badges">
              <img
                v-for="badge in item.user.badges"
                :key="badge.key"
                class="badges"
                alt="badge"
                :src="badge.badge"
              />
            </div>
            <b :style="'color:' + (item.user ? item.user.color : '#0398fc')">
              {{ (item.user && item.user.name) || 'John Doe' }}
              <span class="text-white font-light">: </span></b
            >
            <ChatMessage :id="item.key" :message="item.message" @expired="handleRemoveMessage" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { client, Client } from 'tmi.js';
import { StoreConstants } from '@/utils/constants';
import Loading from '@/renderer/components/Loading.vue';
import MenuButtons from '@/renderer/components/MenuButtons.vue';
import ChatMessage from '@/renderer/components/ChatMessage.vue';

import { getUserBadges } from '@/utils/getUserBadges';
import { IBadge } from '@/renderer/types/IBadge';
import { IMessageResponse } from '@/renderer/types/IMessageResponse';
import { formatMessage } from '@/utils/formatMessage';

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

  clearChatTimer = Number(this.$config.get(StoreConstants.Timer, 0));

  client: Client;

  data: IMessageResponse[] = [];

  broadCaster = this.channel;

  isSetHideBordersByIcon = false;

  isLoading = true;

  isWaitingForMessages = true;

  interval;

  handleRemoveMessage(id: IMessageResponse): void {
    this.data.splice(this.data.indexOf(id), 1);
  }

  handleInterval(): void {
    if (this.clearChatTimer > 0) {
      if (this.data.length > 0) {
        this.interval = setInterval(() => {
          const date = new Date().getTime();
          const lastMessageDate = this.data[this.data.length - 1].created.getTime();
          const minutes = this.clearChatTimer * 60 * 1000;

          if (date - lastMessageDate > minutes) {
            this.data = [];
            if (this.interval) {
              clearInterval(this.interval);
            }
          }
        }, 1000);
      }
    }
  }

  async disconnectChat(): Promise<void> {
    this.$config.delete(StoreConstants.Channel);

    await this.client.disconnect().catch((error) => {
      throw new Error(`Failed to disconnect from chat: ${error}`);
    });

    await this.$router.push({
      path: '/index',
    });
  }

  async created(): Promise<void> {
    this.isSetHideBordersByIcon = this.$config.has(StoreConstants.HideBordersByIcon);

    if (this.channel.length > 0) {
      this.client = client({
        channels: [this.channel],
        connection: {
          reconnect: true,
        },
      });

      await this.client.connect().catch((err) => {
        throw new Error(`Failed to connect to channel ${this.broadCaster}: ${err}`);
      });

      this.isLoading = false;
      this.isWaitingForMessages = true;

      this.client.on('message', async (_channel, userstate, message) => {
        if (this.data.length === 100) {
          // remove the first 80 messages, otherwise the array gets huge after some time
          this.data.splice(0, 80);
        }

        if (this.interval) {
          clearInterval(this.interval);
        }

        let badges: IBadge[] = [];

        if (userstate.badges !== null) {
          badges = await getUserBadges(userstate);
        }

        if (userstate.emotes !== null) {
          message = await formatMessage(message, userstate.emotes);
        }

        this.data.push({
          user: {
            color: userstate.color,
            name: userstate.username,
            badges,
          },
          created: new Date(),
          message,
          key: Math.random().toString(36).substring(7),
        });

        this.handleInterval();

        this.isWaitingForMessages = false;
      });
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
