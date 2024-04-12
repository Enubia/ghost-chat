<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router/auto';

const router = useRouter();
const { t } = useI18n();

const source = ref('');
const hasRegexError = ref(false);

function checkRegex() {
    if (source.value === '') {
        hasRegexError.value = false;
        return;
    }

    const regex
        = /^(http(s)?)?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

    hasRegexError.value = !regex.test(source.value);
}

function enableStartButton() {
    checkRegex();

    if (source.value !== '' && !hasRegexError.value) {
        document.querySelector('#submit')?.removeAttribute('disabled');
    } else {
        document.querySelector('#submit')?.setAttribute('disabled', 'true');
    }
}

function routeExternal() {
    if (source.value !== '' && !hasRegexError.value) {
        router.push(`/externalsource?source=${source.value}`);
    }
}
</script>

<template>
    <div class="center-elements">
        <input
            id="external-source" v-model="source" :class="hasRegexError ? 'error-input' : ''"
            placeholder="https://twitch.tv" type="text" @change="enableStartButton" @keydown.enter="routeExternal"
        >
    </div>
    <div class="center-elements">
        <small v-if="hasRegexError" id="info" class="error-text text-center">
            {{ t('start.external.input.error') }}
        </small>
        <small v-else id="info">{{ t('start.external.input.info') }}</small>
    </div>
    <div class="center-elements">
        <button id="submit" disabled @click="routeExternal">
            {{ t('start.external.button') }}
        </button>
    </div>
</template>
