<script setup lang="ts">
import type { Options } from '#ipc/types/store';

import { useEventListener } from '@vueuse/core';
// @ts-expect-error - no type definitions available
import CodeEditor from 'simple-code-editor';
import { onMounted, shallowRef, useTemplateRef } from 'vue';

import IpcHandler from '#lib/ipchandler';

const props = defineProps<{ option: keyof Options; type: 'css' | 'js' }>();

const code = shallowRef('');
const theme = shallowRef('github');
const hljs = shallowRef<HTMLDivElement | null>(null);
const editor = useTemplateRef<HTMLDivElement>('editor');

const language = [props.type === 'css' ? ['css', 'CSS'] : ['javascript', 'JS']];

onMounted(async () => {
    hljs.value = document.querySelector('.hljs');

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

async function save() {
    hljs.value?.classList.add('border', 'border-green-600');

    setTimeout(() => {
        hljs.value?.classList.remove('border', 'border-green-600');
    }, 2000);

    if (props.type === 'css') {
        await IpcHandler.setKeyValue(`options.${props.option}.css`, code.value);
    }

    if (props.type === 'js') {
        await IpcHandler.setKeyValue(`options.${props.option}.js`, code.value);
    }
}

useEventListener(editor, 'focusout', save);
</script>

<template>
    <div class="flex flex-col gap-2">
        <CodeEditor
            ref="editor"
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
