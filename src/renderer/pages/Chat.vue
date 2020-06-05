<template>
  <div id="messages" class="w-full">
    <div id="top" class="drag-section mx-auto border-b mb-1">
      <div id="buttons" class="inline-flex float-right">
        <div id="min-btn" class="text-white-800 py-2 px-4 rounded" @click.prevent="handleButtons">
          _
        </div>
        <div id="close-btn" class="text-white-800 py-2 px-4 rounded" @click.prevent="handleButtons">
          x
        </div>
      </div>
    </div>
    <div id="chat-messages" class="container mx-auto px-4">
      <div v-if="isLoading">
        <Loading />
      </div>
      <div v-for="item of data" v-else :key="item.key" class="break-text">
        <div
          :style="
            item.message.toLowerCase().includes(`@${broadCaster.length > 0 && broadCaster}`)
              ? 'background: #d15b5b'
              : ''
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
            <div>
              <b :style="'color:' + (item.user ? item.user.color : 'white')">
                {{ (item.user && item.user.name) || 'John Doe' }} </b
              >: {{ item.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="footer" class="text-center mt-2">
      <div class="selection-link" @click.prevent="disconnectChat">
        Back to channel selection
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Loading from '../components/Loading.vue';
import TwitchApi from '../../api/twitchApi';
import { IMessageResponse } from '../../api/types/IMessageResponse';
import { handleCustomButtons } from '../helper/customFrameButtons';

@Component({
  name: 'Chat',
  components: {
    Loading,
  },
})
export default class Chat extends Vue {
  channel = '';

  data: IMessageResponse[] = [];

  broadCaster = '';

  api: TwitchApi;

  isLoading = true;

  interval;

  async prepareData(): Promise<void> {
    const response = await this.api.getTwitchChat();
    if (response.length > 0) {
      this.data.push(...response);
      this.isLoading = false;
    }
  }

  handleButtons(): void {
    handleCustomButtons();
  }

  async disconnectChat(): Promise<void> {
    clearInterval(this.interval);
    await this.api.disconnect();
    await this.$router.push({
      path: '/',
    });
  }

  async created(): Promise<void> {
    this.channel = this.$route.params.channel;
    this.broadCaster = `${this.channel[0].charAt(0).toUpperCase() + this.channel[0].slice(1)}`;
    this.api = new TwitchApi({ channels: [this.channel] });
    await this.api.initChat();
    this.interval = setInterval(async () => this.prepareData(), 1000);
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

  .drag-section {
    width: 100%;
    -webkit-app-region: drag;
    height: 38px;
    border-radius: 10px 10px 0 0;
    border-color: rgba(110, 71, 157, 0.67);

    &:hover {
      background-color: rgb(92, 39, 157);
    }
  }

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

  #footer {
    font-size: 10pt;

    .selection-link {
      text-decoration: none;
      color: #8d41e6;

      &:hover {
        cursor: pointer;
        color: #6e479d;
      }
    }
  }
}
</style>
