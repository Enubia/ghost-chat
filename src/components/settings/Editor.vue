<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { inject, onBeforeMount, ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';

import type { AppStore } from '@shared/types';

type Option = keyof AppStore['options'];

const props = defineProps<{ option: Option; type: 'css' | 'js' }>();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const code = ref('');
const success = ref<boolean>(false);
const view = shallowRef();
const extensions: any[] = [];

onBeforeMount(() => {
    if (electronStore.get('savedWindowState.theme') === 'dark') {
        extensions.push(oneDark);
    }

    if (props.type === 'css') {
        extensions.push(css());
        code.value = electronStore.get(`options.${props.option}.css`);
    }

    if (props.type === 'js') {
        extensions.push(javascript());
        code.value = electronStore.get(`options.${props.option}.js`);
    }
});

function handleReady(payload: any) {
    view.value = payload.view;
}

function enableSuccess() {
    success.value = true;
    setTimeout(() => {
        success.value = false;
    }, 2000);
}

function save() {
    enableSuccess();

    if (props.type === 'css') {
        electronStore.set(`options.${props.option}.css`, code.value);
    }

    if (props.type === 'js') {
        electronStore.set(`options.${props.option}.js`, code.value);
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
