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
		<button class="contrast" @click="save">Save</button>
	</div>
</template>

<script setup lang="ts">
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';

import { AppStore } from '../../../shared/types';

const props = defineProps<{ store: ElectronStore<AppStore>; type: 'js' | 'css' }>();

let code = ref();
const extensions = [oneDark];

if (props.type === 'css') {
	extensions.push(css());
	code.value = props.store.get('channelOptions').customCSS;
}

if (props.type === 'js') {
	extensions.push(javascript());
	code.value = props.store.get('channelOptions').customJS;
}

const view = shallowRef();
const handleReady = (payload: { view: any }) => {
	view.value = payload.view;
};

const save = () => {
	if (props.type === 'css') {
		props.store.set('channelOptions.customCSS', code.value);
	}

	if (props.type === 'js') {
		props.store.set('channelOptions.customJS', code.value);
	}
};
</script>
