<template>
    <div>
        <div v-for="item in data">
            <div class="bg-info">
                {{ item }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import TwitchApi from '../../api/twitchApi';

@Component({
  name: 'Main',
  components: {},
})
export default class Main extends Vue {
  data = {};
  async created() {
    setInterval(async () => this.prepareData(), 3000);
  }

  async prepareData() {
    this.data = await TwitchApi.getTwitchChat()
  }
}
</script>

<style scoped lang="scss"></style>
