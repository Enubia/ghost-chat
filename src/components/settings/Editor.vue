<script setup lang="ts">
import type { Events } from 'vue-codemirror';

import type { AppStore } from '#shared/types';

import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { onMounted, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';

import IpcHandler from '#lib/ipchandler';

type Option = keyof AppStore['options'];

const props = defineProps<{ option: Option; type: 'css' | 'js' }>();

const code = shallowRef('');
const success = shallowRef(false);
const view = shallowRef<Parameters<Events['ready']>[0]['view']>();
const extensions = shallowRef<(ReturnType<typeof css> | typeof oneDark)[]>([]);

onMounted(async () => {
    if (await IpcHandler.getValueFromKey('savedWindowState.theme') === 'dark') {
        extensions.value.push(oneDark);
    }

    if (props.type === 'css') {
        extensions.value.push(css());
        code.value = await IpcHandler.getValueFromKey(`options.${props.option}.css`);
    }

    if (props.type === 'js') {
        extensions.value.push(javascript());
        code.value = await IpcHandler.getValueFromKey(`options.${props.option}.js`);
    }
});

function handleReady(payload: Parameters<Events['ready']>[0]) {
    view.value = payload.view;
}

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
</script>

<template>
    <div class="border-2" :class="success ? 'border-green-600' : 'border-secondary'">
        <Codemirror
            v-model="code"
            :placeholder="`${type.toUpperCase()} goes here...`"
            :style="{ height: '400px' }"
            :autofocus="false"
            :indent-with-tab="true"
            :tab-size="4"
            :extensions="extensions"
            @ready="handleReady"
            @blur="save"
        />
    </div>
</template>
