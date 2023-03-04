<template>
	<div id="settings">
		<div id="content" class="container">
			<aside>
				<nav>
					<ul>
						<li><a class="contrast" @click="setShowOptions">Chat</a></li>
						<li><a class="contrast" @click="setShowCSS">Custom CSS</a></li>
						<li><a class="contrast" @click="setShowJS">Custom JavaScript</a></li>
					</ul>
				</nav>
			</aside>
			<div role="document">
				<article v-if="showOptions">
					<Chat :store="store" />
				</article>
				<article v-else-if="showCSSEditor">
					<Editor :store="store" :type="'css'" />
				</article>
				<article v-else-if="showJSEditor">
					<Editor :store="store" :type="'js'" />
				</article>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { AppStore } from '../../shared/types';
import Editor from '../components/settings/Editor.vue';
import Chat from '../components/settings/Options.vue';

const store = new ElectronStore<AppStore>();

const theme = store.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

const showOptions = ref(true);
const showCSSEditor = ref(false);
const showJSEditor = ref(false);

const setShowJS = () => {
	showJSEditor.value = true;
	showOptions.value = false;
	showCSSEditor.value = false;
};

const setShowOptions = () => {
	showJSEditor.value = false;
	showOptions.value = true;
	showCSSEditor.value = false;
};

const setShowCSS = () => {
	showJSEditor.value = false;
	showOptions.value = false;
	showCSSEditor.value = true;
};
</script>
