<script setup lang="ts">
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { useI18n } from 'vue-i18n';

import type { AppStore } from '../../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore>; type: 'js' | 'css' }>();

const { t } = useI18n();

const code = ref();
const success = ref<boolean | undefined>(undefined);
const extensions: any[] = [];

const view = shallowRef();

extensions.push(oneDark);

if (props.type === 'css') {
    extensions.push(css());
    code.value = props.store.get('chatOptions').customCSS;
}

if (props.type === 'js') {
    extensions.push(javascript());
    code.value = props.store.get('chatOptions').customJS;
}

function handleReady(payload: { view: any }) {
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
        props.store.set('chatOptions.customCSS', code.value);
    }

    if (props.type === 'js') {
        props.store.set('chatOptions.customJS', code.value);
    }
}
</script>

<template>
    <Codemirror
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: '400px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="4"
        :extensions="extensions"
        @ready="handleReady"
    />
    <div id="button-area">
        <button
            id="save"
            class="outline contrast"
            @click="save"
        >
            <span id="text">
                {{ t('settings.document.editor.button.label') }}
            </span>
            <font-awesome-icon
                id="icon"
                :class="success ? 'success-text' : 'contrast'"
                :icon="`far ${success ? 'fa-circle-check' : 'fa-floppy-disk'}`"
                :aria-hidden="true"
            />
        </button>
    </div>
</template>
