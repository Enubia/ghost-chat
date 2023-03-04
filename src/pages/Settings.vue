<template>
	<div id="settings">
		<div id="content" class="container">
			<aside>
				<nav>
					<ul>
						<li><a id="options" active class="contrast" @click="setShowOptions">Options</a></li>
						<li><a id="css" class="contrast" @click="setShowCSS">Custom CSS</a></li>
						<li><a id="js" class="contrast" @click="setShowJS">Custom JavaScript</a></li>
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

const setShowOptions = () => {
	document.querySelector('#options')?.setAttribute('active', 'true');
	document.querySelector('#css')?.removeAttribute('active');
	document.querySelector('#js')?.removeAttribute('active');

	showJSEditor.value = false;
	showOptions.value = true;
	showCSSEditor.value = false;
};

const setShowCSS = () => {
	document.querySelector('#options')?.removeAttribute('active');
	document.querySelector('#css')?.setAttribute('active', 'true');
	document.querySelector('#js')?.removeAttribute('active');

	showJSEditor.value = false;
	showOptions.value = false;
	showCSSEditor.value = true;
};

const setShowJS = () => {
	document.querySelector('#options')?.removeAttribute('active');
	document.querySelector('#css')?.removeAttribute('active');
	document.querySelector('#js')?.setAttribute('active', 'true');

	showJSEditor.value = true;
	showOptions.value = false;
	showCSSEditor.value = false;
};
</script>
