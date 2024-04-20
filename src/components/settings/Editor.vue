<script setup lang="ts">
import type ElectronStore from 'electron-store';

import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { inject, ref } from 'vue';
import { Codemirror } from 'vue-codemirror';

import type { AppStore } from '@shared/types';

type ChatType = keyof AppStore['options'];

const props = defineProps<{ type: ChatType; css?: string; js?: string }>();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const code = ref();
const success = ref<boolean | undefined>(undefined);
const extensions: any[] = [];

if (electronStore.get('savedWindowState.theme') === 'dark') {
    extensions.push(oneDark);
}

if (props.css) {
    extensions.push(css());
    code.value = props.css;
}

if (props.js) {
    extensions.push(javascript());
    code.value = props.js;
}

function enableSuccess() {
    success.value = true;
    setTimeout(() => {
        success.value = false;
    }, 2000);
}

function save() {
    enableSuccess();

    if (props.css) {
        electronStore.set('chatOptions.customCSS', code.value);
    }

    if (props.js) {
        electronStore.set('chatOptions.customJS', code.value);
    }
}
</script>

<template>
    <div class="border-2" :class="success ? 'border-green-600' : 'border-secondary'">
        <Codemirror
            v-model="code"
            :placeholder="`${props.type.toUpperCase()} goes here...`"
            :style="{ height: '400px' }"
            :autofocus="false"
            :indent-with-tab="true"
            :tab-size="4"
            :extensions="extensions"
            @blur="save"
        />
    </div>
</template>
