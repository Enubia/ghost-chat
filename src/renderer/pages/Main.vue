<template>
  <div v-if="data && data.length > 0">
    <div ref="chatMessages">
      <div v-for="item of data" :key="item.key">
        <div class="mb-1">
          <b :style="'color:' + item.user.color">
            {{ item.user.name }}
          </b>
          : {{ item.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TwitchApi, { IMessageResponse } from '../../api/twitchApi';

@Component({
  name: 'Main',
  components: {},
})
export default class Main extends Vue {
  private api = new TwitchApi({ channels: ['zizaran'] });

  data: IMessageResponse[] = [];

  scrollToEnd(): void {
    const messages: any = this.$refs.chatMessages;
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
      console.log(messages);
    }
  }

  async prepareData(): Promise<void> {
    const response = await this.api.getTwitchChat();
    if (response && response.length > 0) {
      this.data.push(...response);
    }
  }

  async created(): Promise<void> {
    await this.api.initChat();
    setInterval(async () => this.prepareData(), 5000);
  }

  updated(): void {
    this.scrollToEnd();
  }
}
</script>

<style scoped lang="scss"></style>
