<template>
    <div class="center-elements">
        <input
            id="external-source"
            list="external-sources"
            v-model="source"
            :class="hasRegexError ? 'error-input' : ''"
            placeholder="https://twitch.tv"
            type="text"
            @change="enableStartButton"
            @keydown.enter="emitSource"
        >
        <datalist v-if="externalBrowserSources?.length > 0" id="external-sources">
            <option
                v-for="source in externalBrowserSources"
                :key="source"
                :value="source"
            />
        </datalist>
    </div>
    <div
        class="center-elements"
    >
        <small
            v-if="hasRegexError"
            id="info"
            class="error-text text-center"
        >
            {{ t('start.external.input.error') }}
        </small>
        <small
            v-else
            id="info">{{ t('start.external.input.info') }}</small>
    </div>
    <div class="center-elements">
        <button
            id="submit"
            disabled
            @click="() => $emit('source', source)"
        >
            {{ t('start.external.button') }}
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

const source = ref('');
const hasRegexError = ref(false);
const externalBrowserSources = ref(props.store.get('general').externalBrowserSources);

const emits = defineEmits<{ (event: 'source', source: string): void }>();

const checkRegex = () => {
    if (source.value === '') {
        hasRegexError.value = false;
        return;
    }

    const regex =
        /^(http(s)?)?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

    hasRegexError.value = !regex.test(source.value);
};

const enableStartButton = () => {
    checkRegex();

    if (source.value !== '' && !hasRegexError.value) {
        document.querySelector('#submit')?.removeAttribute('disabled');
    } else {
        document.querySelector('#submit')?.setAttribute('disabled', 'true');
    }
};

const emitSource = () => {
    checkRegex();

    if (source.value !== '' && !hasRegexError.value) {
        emits('source', source.value);
    }
};
</script>
