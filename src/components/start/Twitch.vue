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

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../../shared/types';

const { t } = useI18n();

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const emit = defineEmits<{ (event: 'channel', channel: string): void }>();

const chatOptions = ref(props.store.get('chatOptions'));
const channel = ref('');

if (chatOptions.value.channel !== '') {
    channel.value = chatOptions.value.channel;
}

if (chatOptions.value.defaultChannel !== '') {
    channel.value = chatOptions.value.defaultChannel;
}

const emitChannel = () => {
    if (channel.value !== '') {
        emit('channel', channel.value);
    }
};
</script>
