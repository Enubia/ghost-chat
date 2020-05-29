<template>
  <div class="container">
    <div v-for="item of data" id="chat-messages" :key="item.key">
      <div class="mb-1">
        <b :style="'color:' + item.user.color">
          {{ item.user.name }}
        </b>
        : {{ item.message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TwitchApi, { IMessageResponse } from '../../api/twitchApi';
import { handleCustomButtons } from '../helper/customFrameButtons';

@Component({
  name: 'Main',
  components: {},
})
export default class Main extends Vue {
  private api = new TwitchApi({ channels: ['a_seagull'] });

  data: IMessageResponse[] = [];

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
.container {
  background: rgba(0, 0, 0, 0);
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  height: 100%;
  width: 95%;

  &:hover {
    overflow-y: scroll;
  }
  &:hover::-webkit-scrollbar {
    width: 6px;
    background-color: #f5f5f5;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgb(92, 39, 157);
  }
  &:hover::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(92, 39, 157, 0.3);
    background-color: #f5f5f5;
    border-radius: 2px;
  }
}
</style>
