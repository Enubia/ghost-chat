<template>
	<div id="settings">
		<div id="content" class="container">
			<aside>
				<nav>
					<ul>
						<li><a @click="setShowGeneral">General</a></li>
						<li><a @click="setShowChat">Chat</a></li>
						<li><a @click="setShowCSS">CSS</a></li>
					</ul>
				</nav>
			</aside>
			<div role="document">
				<article v-if="showGeneral">General</article>
				<article v-else-if="showChat">Chat</article>
				<article v-else-if="showCSS">
					<!-- https://www.npmjs.com/package/vue-codemirror -->
					CSS
				</article>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';

import { AppStore } from '../../../shared/types';

const store = new ElectronStore<AppStore>();

const theme = store.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

const showGeneral = ref(true);
const showChat = ref(false);
const showCSS = ref(false);

const setShowGeneral = () => {
	showGeneral.value = true;
	showChat.value = false;
	showCSS.value = false;
};
const setShowChat = () => {
	showGeneral.value = false;
	showChat.value = true;
	showCSS.value = false;
};
const setShowCSS = () => {
	showGeneral.value = false;
	showChat.value = false;
	showCSS.value = true;
};
</script>
