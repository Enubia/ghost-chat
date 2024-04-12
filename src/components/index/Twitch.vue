<script setup lang="ts">
import type ElectronStore from 'electron-store';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';
import { useRouter } from 'vue-router/auto';

const router = useRouter();
const { t } = useI18n();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const chatOptions = ref(electronStore.get('chatOptions'));
const channel = ref('');

if (chatOptions.value.channel !== '') {
    channel.value = chatOptions.value.channel;
}

if (chatOptions.value.defaultChannel !== '') {
    channel.value = chatOptions.value.defaultChannel;
}

function routeChat() {
    electronStore.set('chatOptions', {
        ...chatOptions.value,
        channel: channel.value,
    });

    router.push('/twitch');
}
</script>

<template>
    <div class="center-elements">
        <input id="channel" v-model="channel" type="text" @keydown.enter="routeChat">
    </div>
    <div class="center-elements">
        <small id="info">{{ t('start.twitch.input.info') }}</small>
    </div>
    <div class="center-elements">
        <button @click="routeChat">
            {{ t('start.twitch.button') }}
        </button>
    </div>
</template>
