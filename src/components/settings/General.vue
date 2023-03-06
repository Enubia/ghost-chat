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
	</div>
	<div id="beta-updates">
		<label for="beta-updates-input" class="align-elements">
			<input
				id="beta-updates-input"
				v-model="participateInPreRelease"
				type="checkbox"
				@change="setParticipateInPreRelease"
			/>
			<span>{{ t('settings.document.general.close-option.checkbox-label') }}</span>
		</label>
		<small>
			{{ t('settings.document.general.close-option.info') }}
		</small>
	</div>
	<div v-if="showCloseOption" id="close-option">
		<hr />
		<label for="close-option-input" class="align-elements">
			<input id="close-option-input" v-model="quitOnClose" type="checkbox" @change="setQuitOnClose" />
			<span>{{ t('settings.document.general.close-option.checkbox-label') }}</span>
		</label>
		<small>{{ t('settings.document.general.close-option.info') }}</small>
	</div>
</template>
<script setup lang="ts">
import ElectronStore from 'electron-store';
import { ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppStore } from '../../../shared/types';
import { languageMappingList } from '../languageMappingList';

const { t } = useI18n();

const props = defineProps<{ store: ElectronStore<AppStore> }>();

const updater = shallowRef(props.store.get('updater'));

const participateInPreRelease = ref(false);
const quitOnClose = ref(props.store.get('general').quitOnClose);

const showCloseOption = process.platform === 'darwin';

if (updater.value.channel !== 'latest') {
	participateInPreRelease.value = true;
}

const setParticipateInPreRelease = () => {
	props.store.set('updater.channel', participateInPreRelease.value ? 'beta' : 'latest');
};

const setQuitOnClose = () => {
	props.store.set('general.quitOnClose', quitOnClose.value);
};
</script>
