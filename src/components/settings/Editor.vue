<script setup lang="ts">
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type ElectronStore from 'electron-store';
import { inject, ref } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '@shared/types';

const props = defineProps<{ type: 'js' | 'css' }>();

const electronStore = inject('electronStore') as ElectronStore<AppStore>;

const { t } = useI18n();

const code = ref();
const success = ref<boolean | undefined>(undefined);
const extensions: any[] = [];

if (electronStore.get('savedWindowState.theme') === 'dark') {
    extensions.push(oneDark);
}

if (props.type === 'css') {
    extensions.push(css());
    code.value = electronStore.get('chatOptions').customCSS;
}

if (props.type === 'js') {
    extensions.push(javascript());
    code.value = electronStore.get('chatOptions').customJS;
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
        electronStore.set('chatOptions.customCSS', code.value);
    }

    if (props.type === 'js') {
        electronStore.set('chatOptions.customJS', code.value);
    }
}
</script>

<template>
    <Codemirror
        v-model="code"
        :placeholder="`${props.type.toUpperCase()} goes here...`"
        :style="{ height: '85%' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="4"
        :extensions="extensions"
    />
    <div id="button-area">
        <button id="save" class="outline contrast" @click="save">
            <span id="text">
                {{ t('settings.document.editor.button.label') }}
            </span>
            <font-awesome-icon
                id="icon" :class="success ? 'success-text' : 'contrast'"
                :icon="`far ${success ? 'fa-circle-check' : 'fa-floppy-disk'}`"
                :aria-hidden="true"
            />
        </button>
    </div>
</template>
