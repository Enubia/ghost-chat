<template>
	<div id="settings">
		<div id="content" class="container">
			<aside>
				<nav>
					<ul>
						<li>
							<a id="general" class="contrast" @click="showView('general')">
								{{ t('settings.aside.1') }}
							</a>
						</li>
						<li>
							<a id="options" active class="contrast" @click="showView('options')">
								{{ t('settings.aside.2') }}
							</a>
						</li>
						<li>
							<a id="css" class="contrast" @click="showView('css')">{{ t('settings.aside.3') }}</a>
						</li>
						<li>
							<a id="js" class="contrast" @click="showView('js')">{{ t('settings.aside.4') }}</a>
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

const showView = <T = 'general' | 'options' | 'css' | 'js' | 'updates'>(view: T) => {
	switch (view) {
		case 'general':
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
			break;

		case 'options':
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
			break;

		case 'css':
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
			break;

		case 'js':
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
			break;

		case 'updates':
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
			break;
	}
};
</script>
