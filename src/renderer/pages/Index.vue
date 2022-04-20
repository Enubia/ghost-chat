<template lang="pug">
  #index.background-filled

    MenuButtons

    .grid.w-full.h-full
      #channel-selection.flex.items-center.justify-center.text-center
        .row-span-3( class=".w-3/4  sm:row-span-1 md:row-span-2 lg:row-span-3 xl:row-span-1" )
          #images.inline-flex
            img( src="../assets/images/index-image.png" alt="kappa" class="h-32 w-32 mt-4" )

          label( for="channel" )
          .flex.justify-center
            .text-center( class="w-2/3")
              input.shadow.appearance-none.border.rounded.w-full.py-2.px-3.text-gray-700.leading-tight(
                id="channel"
                v-model="channelName"
                type="text"
                class="focus:outline-none focus:shadow-outline"
                @keyup.enter="startChat"
              )

          .mt-2
            small#channelHelp.text-muted Channel name, e.g. Enubia1
            br
            small#channelError.text-red-400( v-if="showErrorMessage" ) Please provide a channel name!

          .flex.justify-center
            .text-center( class="w-1/3" )
              #submit-button.mt-2.text-white-800.py-1.px-2.rounded.bg-main.cursor-pointer(
                class="hover:bg-main-darker"
                @click.prevent="startChat"
              ) Go
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { StoreConstants } from '@/utils/constants';
import MenuButtons from '@/renderer/components/MenuButtons.vue';
import Chat from './Chat.vue';

@Component({
  name: 'Index',
  components: {
    MenuButtons,
    Chat,
  },
})
export default class Index extends Vue {
  channelName = '';

  showErrorMessage = false;

  startChat(): void {
    if (this.channelName.length > 0) {
      this.$config.set(StoreConstants.Channel, this.channelName.toLowerCase());
      this.$router.push('/chat');
    } else {
      this.showErrorMessage = true;
    }
  }

  updated(): void {
    if (this.showErrorMessage) {
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    }
  }

  created(): void {
    let channelName = String(this.$config.get(StoreConstants.Channel, ''));

    if (channelName === '' && this.$config.has(StoreConstants.DefaultChannel)) {
      channelName = String(this.$config.get(StoreConstants.DefaultChannel));
      this.$config.set(StoreConstants.Channel, channelName);
    }

    if (this.$route.query.message === 'no-channel') {
      this.showErrorMessage = true;
    } else if (this.$route.query.message === 'show-index') {
      this.$config.set(StoreConstants.Channel, '');
    } else if (channelName.length > 0) {
      this.$router.push('/chat');
    }
  }
}
</script>
<style scoped lang="scss">
#index {
  -webkit-app-region: drag;

  #channel-selection {
    height: 90%;
    -webkit-app-region: no-drag;
  }
}
</style>
