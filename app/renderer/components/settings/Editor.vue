<script setup lang="ts">
import type { Options } from '#ipc/types/store';

import hljs from 'highlight.js';
// @ts-expect-error - no type definitions available
import CodeEditor from 'simple-code-editor';
import { onMounted, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import IpcHandler from '#lib/ipchandler';

const props = defineProps<{ option: keyof Options; type: 'css' | 'js' }>();

const { t } = useI18n();

const code = shallowRef('');
const success = shallowRef(false);
const theme = shallowRef('github');
const debounceTimeout = shallowRef<NodeJS.Timeout | null>(null);

const language = [props.type === 'css' ? ['css', 'CSS'] : ['javascript', 'JS']];

onMounted(async () => {
    if (await IpcHandler.getValueFromKey('savedWindowState.theme') === 'dark') {
        theme.value = 'github-dark';
    }

    if (props.type === 'css') {
        code.value = await IpcHandler.getValueFromKey(`options.${props.option}.css`);
    }

    if (props.type === 'js') {
        code.value = await IpcHandler.getValueFromKey(`options.${props.option}.js`);
    }
});

function enableSuccess() {
    success.value = true;

    setTimeout(() => {
        success.value = false;
    }, 2000);
}

async function save() {
    enableSuccess();

    if (props.type === 'css') {
        await IpcHandler.setKeyValue(`options.${props.option}.css`, code.value);
    }

    if (props.type === 'js') {
        await IpcHandler.setKeyValue(`options.${props.option}.js`, code.value);
    }
}

function debouncedSave() {
    if (debounceTimeout.value !== null) {
        clearTimeout(debounceTimeout.value);
    }

    debounceTimeout.value = setTimeout(() => {
        save();
        debounceTimeout.value = null;
    }, 2000);
}

watch(code, debouncedSave);
</script>

<template>
    <div class="flex flex-col gap-2">
        <small v-if="success" class="text-green-600">{{ t('settings.success') }}</small>
        <CodeEditor
            v-model="code"
            :line-nums="true"
            :languages="language"
            :tab-spaces="4"
            :highlight="hljs"
            :theme="theme"
            height="400px"
            width="auto"
        />
    </div>
</template>

<style>
#css-editor > div > div > div.header.border {
    @apply border-0;
}

#js-editor > div > div > div.header.border {
    @apply border-0;
}
</style>
