<template>
  <span class="message" :style="style" v-html="message" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'ChatMessage',
})
export default class ChatMessage extends Vue {
  @Prop(String) readonly message: string;

  style = {
    textShadow: this.$fontStroke
      ? `-1px -1px 0 ${this.$strokeColor}, 1px -1px 0
  ${this.$strokeColor}, -1px 1px 0 ${this.$strokeColor}, 1px 1px 0 ${this.$strokeColor}`
      : null,
    color: this.$chatColor,
  };
}
</script>

<style scoped lang="scss"></style>
