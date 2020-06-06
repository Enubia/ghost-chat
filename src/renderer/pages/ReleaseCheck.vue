<template>
  <div id="version-check" class="grid w-full background-filled">
    <MenuButtons />
    <div v-if="isLoading">
      <Loading loading-text="Checking for new Version" />
    </div>
    <div v-else>
      <div class="grid grid-rows-2 no-drag">
        <div class="text-center row-span-3">
          <div class="mb-4 text-2xl">Version {{ newVersion }} is available!</div>
          <div class="flex justify-center mb-2">
            <div class="w-2/3 text-center">
              <div
                id="submit-button"
                class="mt-2 text-white-800 py-1 px-2 rounded"
                @click.prevent="openDownloadLink"
              >
                Open in browser
              </div>
            </div>
          </div>
          <span class="custom-link" @click="$router.push('/index')">Skip</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator';
import { remote, shell } from 'electron';
import Loading from '../components/Loading.vue';
import { handleCustomButtons } from '../helper/customFrameButtons';
import MenuButtons from '../components/MenuButtons.vue';

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

  openDownloadLink() {
    shell.openExternal(this.newReleaseUrl);
  }

  handleButtons() {
    handleCustomButtons();
  }

  async wait() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve((this.isLoading = false));
      }, 2000);
    });
  }

  async created() {
    const releaseResponse = await fetch(
      'https://api.github.com/repos/lettucekiing/ghost-chat/releases',
    ).then((res) => res.json());

    if (releaseResponse[0].tag_name !== this.currentReleaseVersion) {
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
