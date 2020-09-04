<template>
  <span
    :class="$textStroke ? 'text-stroke' : null + 'text-white'"
    :style="'color:' + $chatColor"
    v-html="message"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'ChatMessage',
})
export default class ChatMessage extends Vue {
  @Prop(String) readonly message: string;
}
</script>

<style scoped lang="scss"></style>
