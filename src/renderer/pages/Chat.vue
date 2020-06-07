<template>
  <div id="messages" class="w-full">
    <MenuButtons />
    <div id="chat-messages" class="container mx-auto px-4">
      <div v-if="isLoading">
        <Loading loading-text="Loading Chat ⊂(◉‿◉)つ" />
      </div>
      <div v-else-if="!isLoading && isWaitingForMessages">
        <span>Connected, waiting for messages...</span>
      </div>
      <div v-for="item of data" v-else :key="item.key" class="break-text">
        <div
          :style="
            item.message.toLowerCase().includes(`@${broadCaster}`) ? 'background: #d15b5b' : ''
          "
          class="mb-1 text-white"
        >
          <div>
            <img
              v-for="badge in item.user.badges"
              :key="badge.key"
              class="badges"
              alt="badge"
              :src="badge.badge"
            />
            <div class="flex">
              <b :style="'color:' + (item.user ? item.user.color : 'white')">
                {{ (item.user && item.user.name) || 'John Doe' }} </b
              >:
              <!--TODO: format this properly-->
              <div class="inline-flex" v-html="item.message"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Loading from '../components/Loading.vue';
import TwitchApi from '../../api/twitchApi';
import { IMessageResponse } from '../../api/types/IMessageResponse';
import MenuButtons from '../components/MenuButtons.vue';

@Component({
  name: 'Chat',
  components: {
    Loading,
    MenuButtons,
  },
})
export default class Chat extends Vue {
  channel = this.$store.state.channelName;

  data: IMessageResponse[] = [];

  broadCaster = '';

  api: TwitchApi;

  isLoading = true;

  isWaitingForMessages = true;

  interval;

  prepareData(): void {
    const response = this.api.getTwitchChat();
    if (response.length > 0) {
      this.data.push(...response);
      this.isWaitingForMessages = false;
    }
    this.isLoading = false;
  }

  async disconnectChat(): Promise<void> {
    clearInterval(this.interval);
    await this.api.disconnect();
    await this.$router.push({
      path: '/index',
    });
  }

  async created(): Promise<void> {
    [this.broadCaster] = this.channel;
    this.api = new TwitchApi({ channels: [this.channel] });
    await this.api.initChat();
    this.interval = setInterval(() => this.prepareData(), 1000);
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
      margin-top: 5px;
      margin-right: 3px;
      min-width: 15px;
      min-height: 15px;
      float: left;
    }
  }
}
</style>
