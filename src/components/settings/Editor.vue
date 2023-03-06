<template>
	<codemirror
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
		<button id="save" class="contrast" @click="save">{{ t('settings.document.editor.button') }}</button>
	</div>
</template>

<script setup lang="ts">
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../../shared/types';

const { t } = useI18n();

const props = defineProps<{ store: ElectronStore<AppStore>; type: 'js' | 'css' }>();

const theme = props.store.get('savedWindowState').theme;

let code = ref();
const extensions: any[] = [];

if (theme === 'dark') {
	extensions.push(oneDark);
}

if (props.type === 'css') {
	extensions.push(css());
	code.value = props.store.get('chatOptions').customCSS;
}

if (props.type === 'js') {
	extensions.push(javascript());
	code.value = props.store.get('chatOptions').customJS;
}

const view = shallowRef();
const handleReady = (payload: { view: any }) => {
	view.value = payload.view;
};

const save = () => {
	const $saveButton = document.querySelector('#save') as HTMLElement;

	$saveButton.setAttribute('aria-busy', 'true');
	$saveButton.innerText = 'Saving...';

	if (props.type === 'css') {
		props.store.set('chatOptions.customCSS', code.value);
	}

	if (props.type === 'js') {
		props.store.set('chatOptions.customJS', code.value);
	}

	setTimeout(() => {
		$saveButton?.removeAttribute('aria-busy');
		$saveButton.innerText = 'Save';
	}, 500);
};
</script>
