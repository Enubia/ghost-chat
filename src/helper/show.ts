import { Ref } from 'vue';

type ShowArgs = {
	showChat: Ref<boolean>;
	showStart: Ref<boolean>;
	showSettings: Ref<boolean>;
	showExternalSource: Ref<boolean>;
};

export default class Show {
	static Start({ showChat, showStart, showSettings, showExternalSource }: ShowArgs) {
		showChat.value = false;
		showStart.value = true;
		showSettings.value = false;
		showExternalSource.value = false;
	}

	static Chat({ showChat, showStart, showSettings, showExternalSource }: ShowArgs) {
		showChat.value = true;
		showStart.value = false;
		showSettings.value = false;
		showExternalSource.value = false;
	}

	static ExternalSource({ showChat, showStart, showSettings, showExternalSource }: ShowArgs) {
		showChat.value = false;
		showStart.value = false;
		showSettings.value = false;
		showExternalSource.value = true;
	}

	static Settings({
		showChat,
		showStart,
		showSettings,
		checkingVersion,
		showExternalSource,
	}: ShowArgs & { checkingVersion: Ref<boolean> }) {
		showChat.value = false;
		showStart.value = false;
		showSettings.value = true;
		checkingVersion.value = false;
		showExternalSource.value = false;
	}
}
