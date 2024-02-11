<script setup lang="ts">
import type ElectronStore from 'electron-store';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '../../../shared/types';

const emit = defineEmits<{ (event: 'channel', channel: string): void }>();

const { t } = useI18n();

const store = inject('store') as ElectronStore<AppStore>;

const chatOptions = ref(store.get('chatOptions'));
const channel = ref('');

if (chatOptions.value.channel !== '') {
    channel.value = chatOptions.value.channel;
}

if (chatOptions.value.defaultChannel !== '') {
    channel.value = chatOptions.value.defaultChannel;
}

function emitChannel() {
    if (channel.value !== '') {
        emit('channel', channel.value);
    }
}
</script>

<template>
    <div class="center-elements">
        <input
            id="channel"
            v-model="channel"
            type="text"
            @keydown.enter="emitChannel"
        >
    </div>
    <div class="center-elements">
        <small id="info">{{ t('start.twitch.input.info') }}</small>
    </div>
    <div class="center-elements">
        <button @click="emitChannel">
            {{ t('start.twitch.button') }}
        </button>
    </div>
</template>
