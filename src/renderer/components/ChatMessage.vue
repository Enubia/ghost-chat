<template>
  <span class="in" v-html="message"></span>
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

<style scoped></style>
