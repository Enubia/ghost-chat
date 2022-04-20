<template lang="pug">
  #version-check.grid.w-full.background-filled

    MenuButtons

    div( v-if="isLoading" )
      Loading( loading-text="Checking for new Version" )

    div( v-else )
      .grid.grid-rows-2.no-drag
        .text-center.row-span-3
          .mb-4.text-2xl Version {{ newVersion }} is available!
          .flex.justify-center.mb-2
            .text-center( class="w-2/3" )
              #submit-button.bg-main.cursor-pointer.mt-2.text-white-800.py-1.px-2.rounded(
                class="hover:bg-main-darker"
                @click.prevent="openDownloadLink"
              ) Open in browser

          span.text-main-lighter.cursor-pointer.underline(
            class="hover:text-main"
            @click="$router.push('/index')"
          ) Skip
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { remote, shell } from 'electron';
import Loading from '@/renderer/components/Loading.vue';
import MenuButtons from '@/renderer/components/MenuButtons.vue';

@Component({
  name: 'ReleaseCheck',
  components: {
    MenuButtons,
    Loading,
  },
})
export default class ReleaseCheck extends Vue {
  currentReleaseVersion = remote.app.getVersion();

  newVersion = '';

  newReleaseUrl = '';

  isLoading = true;

  openDownloadLink(): void {
    shell.openExternal(this.newReleaseUrl);
  }

  async wait(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve((this.isLoading = false));
      }, 2000);
    });
  }

  async created(): Promise<void> {
    const releaseResponse = await fetch(
      'https://api.github.com/repos/lettucekiing/ghost-chat/releases',
    ).then((res) => res.json());

    const releaseVersion = releaseResponse[0].tag_name.slice(1, releaseResponse[0].tag_name.length);

    if (releaseVersion !== this.currentReleaseVersion) {
      this.newReleaseUrl = releaseResponse[0].html_url;
      this.newVersion = releaseResponse[0].tag_name;
      await this.wait();
    } else {
      await this.wait();
      await this.$router.push('/index');
    }
  }
}
</script>

<style scoped lang="scss">
#version-check {
  -webkit-app-region: drag;

  .no-drag {
    -webkit-app-region: no-drag;
  }
}
</style>
