<template>
	<div id="locale-changer">
		<label for="locale-change-select">
			{{ t('settings.document.general.locale-change.label') }}
			<select v-model="$i18n.locale" @change="store.set('general.language', $i18n.locale)">
				<option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
					{{ languageMappingList[locale].nativeName }}
				</option>
			</select>
		</label>
		<div></div>
		<small v-if="store.get('general.language') !== $i18n.locale" class="info">
			{{ t('settings.document.general.locale-change.info') }}
		</small>
	</div>
	<hr />
	<div id="beta-updates">
		<label for="beta-updates-input" class="align-elements">
			<input
				id="beta-updates-input"
				v-model="participateInPreRelease"
				type="checkbox"
				@change="setParticipateInPreRelease"
			/>
			<span>{{ t('settings.document.general.pre-release.checkbox-label') }}</span>
		</label>
		<small>
			{{ t('settings.document.general.pre-release.info') }}
		</small>
	</div>
	<div v-if="showMacOptions">
		<div id="close-option">
			<hr />
			<label for="close-option-input" class="align-elements">
				<input id="close-option-input" v-model="quitOnClose" type="checkbox" @change="setQuitOnClose" />
				<span>{{ t('settings.document.general.close-option.checkbox-label') }}</span>
			</label>
			<small>{{ t('settings.document.general.close-option.info') }}</small>
		</div>
		<hr />
		<div id="hide-dock-icon-options">
			<label for="hide-dock-icon-options-input" class="align-elements">
				<input
					id="hide-dock-icon-options-input"
					v-model="hideDockIcon"
					type="checkbox"
					@change="setHideDockIcon"
				/>
				<span>{{ t('settings.document.general.hide-dock-icon-options.checkbox-label') }}</span>
			</label>
			<small>{{ t('settings.document.general.hide-dock-icon-options.info') }}</small>
		</div>
	</div>
</template>
<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../../shared/types';
import { languageMappingList } from '../languageMappingList';

const { t } = useI18n();

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const updater = props.store.get('updater');

const participateInPreRelease = ref(false);
const quitOnClose = ref(props.store.get('general').mac.quitOnClose);
const hideDockIcon = ref(props.store.get('general').mac.hideDockIcon);

const showMacOptions = process.platform === 'darwin';

if (updater.channel !== 'latest') {
	participateInPreRelease.value = true;
}

const setParticipateInPreRelease = () => {
	props.store.set('updater.channel', participateInPreRelease.value ? 'beta' : 'latest');
};

const setQuitOnClose = () => {
	props.store.set('general.mac.quitOnClose', quitOnClose.value);
};

const setHideDockIcon = () => {
	props.store.set('general.mac.hideDockIcon', hideDockIcon.value);
};
</script>
