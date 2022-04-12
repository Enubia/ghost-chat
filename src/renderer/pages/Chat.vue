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
        <div>New messages will be added to the {{ addNewMessageToBottom ? 'bottom' : 'top' }}</div>
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
            <ChatMessage :id="item.key" :message="item.message" />
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

import { IBadge } from '@/renderer/types/IBadge';
import { IMessageResponse } from '@/renderer/types/IMessageResponse';
import Message from '@/utils/Message';

@Component({
  name: 'Chat',
  components: {
    Loading,
    MenuButtons,
    ChatMessage,
  },
})
export default class Chat extends Vue {
  private message = new Message();

  channel = String(this.$config.get(StoreConstants.Channel, ''));

  clearChatTimer = Number(this.$config.get(StoreConstants.Timer, 0));

  client: Client;

  data: IMessageResponse[] = [];

  broadCaster = this.channel;

  isSetHideBordersByIcon = false;

  isLoading = true;

  isWaitingForMessages = true;

  addNewMessageToBottom = !this.$config.get(StoreConstants.ReverseChat, false);

  interval;

  handleInterval(): void {
    const now = new Date().getTime();

    const notStale = (msg) => {
      const messageDate = msg.created.getTime();
      const minutes = this.clearChatTimer * 60 * 1000;
      return now - messageDate <= minutes;
    };

    // Filter the `this.data` message list by removing any expired messages in
    // place by writing only recent messages to a moving index while iterating the list
    // then truncating the list to the value of the write pointer, preserving order.
    let reader = 0;
    let writer = 0;
    while (reader < this.data.length) {
      const val = this.data[reader];
      if (notStale(val)) {
        this.data[writer] = val;
        writer += 1;
      }
      reader += 1;
    }
    if (this.data.length !== writer) {
      this.data.splice(writer);
    }
  }

  addMessage(userstate, message, badges): void {
    const newItem: IMessageResponse = {
      user: {
        color: userstate.color || '#8d41e6',
        name: userstate.username,
        badges,
      },
      created: new Date(),
      message,
      key: Math.random().toString(36).substring(7),
    };

    if (this.data.length === 100) {
      const removeFrom = this.addNewMessageToBottom ? 0 : 20;

      // remove the first 80 messages, otherwise the array gets huge after some time
      this.data.splice(removeFrom, 80);
    }

    if (this.addNewMessageToBottom) {
      this.data.push(newItem);
    } else {
      this.data.unshift(newItem);
    }

    this.isWaitingForMessages = false;
  }

  async disconnectChat(): Promise<void> {
    this.$config.delete(StoreConstants.Channel);

    await this.client.disconnect().catch((error) => {
      throw new Error(`Failed to disconnect from chat: ${error}`);
    });

    await this.$router.push({
      path: '/index',
      query: { message: 'show-index' },
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

      // Only show the waiting for messages prompt for a bit
      this.isWaitingForMessages = true;
      setTimeout(() => {
        this.isWaitingForMessages = false;
      }, 15_000);

      // Set up the worldwide poll for clearing messages if we need to
      if (this.clearChatTimer > 0) {
        this.interval = setInterval(this.handleInterval, 1000);
      }

      this.client.on('message', async (_channel, userstate, message) => {
        let badges: IBadge[] = [];
        if (userstate.badges !== null) {
          badges = await this.message.getUserBadges(userstate);
        }
        if (userstate.emotes !== null) {
          message = await this.message.formatMessage(message, userstate.emotes);
        }
        this.addMessage(userstate, message, badges);
      });
    } else {
      await this.$router.push({
        name: '/index',
        query: { message: 'no-channel' },
      });
    }
  }

  updated(): void {
    const container = this.$el.querySelector('#chat-messages');
    if (container) {
      const messages = container.querySelectorAll('#message');
      const lastMessage = messages && messages[messages.length - 1];

      if (this.addNewMessageToBottom) {
        // For some reason using `container.scrollTop = ...` does not work correctly
        // when the window is invisible. This, on the other hand, works correctly.
        if (lastMessage) {
          lastMessage.scrollIntoView();
        }
      } else {
        container.scrollTop = 0;
      }
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
