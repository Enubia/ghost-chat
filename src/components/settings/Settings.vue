<template>
	<div id="settings">
		<div id="content" class="container">
			<aside>
				<nav>
					<ul>
						<li><a class="contrast" @click="setShowChat">Chat</a></li>
						<li><a class="contrast" @click="setShowCSS">Custom CSS</a></li>
						<li><a class="contrast" @click="setShowJS">Custom JavaScript</a></li>
					</ul>
				</nav>
			</aside>
			<div role="document">
				<article v-if="showChat">
					<Chat :store="store" />
				</article>
				<article v-else-if="showCSS">
					<Editor :store="store" :type="'css'" />
				</article>
				<article v-else-if="showJS">
					<Editor :store="store" :type="'js'" />
				</article>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { AppStore } from '../../../shared/types';

import Chat from './components/Chat.vue';
import Editor from './components/Editor.vue';

const store = new ElectronStore<AppStore>();

const theme = store.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

const showChat = ref(true);
const showCSS = ref(false);
const showJS = ref(false);

const setShowJS = () => {
	showJS.value = true;
	showChat.value = false;
	showCSS.value = false;
};

const setShowChat = () => {
	showJS.value = false;
	showChat.value = true;
	showCSS.value = false;
};

const setShowCSS = () => {
	showJS.value = false;
	showChat.value = false;
	showCSS.value = true;
};
</script>
