<template>
	<div id="settings">
		<div id="content" class="container">
			<aside>
				<nav>
					<ul>
						<li>
							<a id="general" class="contrast" @click="setShowGeneral">{{ t('settings.aside.1') }}</a>
						</li>
						<li>
							<a id="options" active class="contrast" @click="setShowOptions">
								{{ t('settings.aside.2') }}
							</a>
						</li>
						<li>
							<a id="css" class="contrast" @click="setShowCSS">{{ t('settings.aside.3') }}</a>
						</li>
						<li>
							<a id="js" class="contrast" @click="setShowJS">{{ t('settings.aside.4') }}</a>
						</li>
					</ul>
				</nav>
			</aside>
			<div v-if="showGeneral">
				<article>
					<General :store="store" />
				</article>
			</div>
			<div v-else-if="showOptions">
				<article class="scroll-content">
					<KapChat :store="store" />
				</article>
			</div>
			<div v-else-if="showCSSEditor">
				<article>
					<Editor :store="store" :type="'css'" />
				</article>
			</div>
			<div v-else-if="showJSEditor">
				<article>
					<Editor :store="store" :type="'js'" />
				</article>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../shared/types';
import Editor from '../components/settings/Editor.vue';
import General from '../components/settings/General.vue';
import KapChat from '../components/settings/KapChat.vue';

const { t } = useI18n();

const store = new ElectronStore<AppStore>();

const theme = store.get('savedWindowState.theme');
const $html = document.querySelector('html');
$html?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

const showGeneral = ref(false);
const showOptions = ref(true);
const showCSSEditor = ref(false);
const showJSEditor = ref(false);
const showUpdates = ref(false);

const setShowGeneral = () => {
	document.querySelector('#options')?.removeAttribute('active');
	document.querySelector('#css')?.removeAttribute('active');
	document.querySelector('#js')?.removeAttribute('active');
	document.querySelector('#updates')?.removeAttribute('active');
	document.querySelector('#general')?.setAttribute('active', 'true');

	showJSEditor.value = false;
	showCSSEditor.value = false;
	showUpdates.value = false;
	showOptions.value = false;
	showGeneral.value = true;
};

const setShowOptions = () => {
	document.querySelector('#general')?.removeAttribute('active');
	document.querySelector('#css')?.removeAttribute('active');
	document.querySelector('#js')?.removeAttribute('active');
	document.querySelector('#updates')?.removeAttribute('active');
	document.querySelector('#options')?.setAttribute('active', 'true');

	showGeneral.value = false;
	showJSEditor.value = false;
	showCSSEditor.value = false;
	showUpdates.value = false;
	showOptions.value = true;
};

const setShowCSS = () => {
	document.querySelector('#general')?.removeAttribute('active');
	document.querySelector('#options')?.removeAttribute('active');
	document.querySelector('#js')?.removeAttribute('active');
	document.querySelector('#updates')?.removeAttribute('active');
	document.querySelector('#css')?.setAttribute('active', 'true');

	showGeneral.value = false;
	showJSEditor.value = false;
	showOptions.value = false;
	showUpdates.value = false;
	showCSSEditor.value = true;
};

const setShowJS = () => {
	document.querySelector('#general')?.removeAttribute('active');
	document.querySelector('#options')?.removeAttribute('active');
	document.querySelector('#css')?.removeAttribute('active');
	document.querySelector('#updates')?.removeAttribute('active');
	document.querySelector('#js')?.setAttribute('active', 'true');

	showGeneral.value = false;
	showOptions.value = false;
	showCSSEditor.value = false;
	showUpdates.value = false;
	showJSEditor.value = true;
};

// const setShowUpdates = () => {
// 	document.querySelector('#general')?.removeAttribute('active');
// 	document.querySelector('#options')?.removeAttribute('active');
// 	document.querySelector('#css')?.removeAttribute('active');
// 	document.querySelector('#js')?.removeAttribute('active');
// 	document.querySelector('#updates')?.setAttribute('active', 'true');

// 	showGeneral.value = false;
// 	showJSEditor.value = false;
// 	showOptions.value = false;
// 	showCSSEditor.value = false;
// 	showUpdates.value = true;
// };
</script>
