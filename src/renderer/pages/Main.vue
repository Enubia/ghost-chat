<template>
  <div v-if="data && data.length > 0">
    <div v-for="(item, index) of data" :key="index">
      <div class="mb-1">{{ item.user }}: {{ item.message }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TwitchApi, { IMessageResponse } from '../../api/twitchApi';

const messages: IMessageResponse[] = [];

@Component({
  name: 'Main',
  components: {},
})
export default class Main extends Vue {
  private api = new TwitchApi({ channels: ['zizaran'] });

  data = messages;

  async created(): Promise<void> {
    await this.api.initChat();
    setInterval(async () => this.prepareData(), 5000);
  }

  async prepareData(): Promise<void> {
    const response = await this.api.getTwitchChat();
    messages.push(...response);
    console.log(messages);
  }
}
</script>

<style scoped lang="scss"></style>
