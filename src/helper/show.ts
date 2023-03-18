import { Ref } from 'vue';

type ShowArgs = {
	showChat: Ref<boolean>;
	showStart: Ref<boolean>;
	showSettings: Ref<boolean>;
};

export default class Show {
	static Start({ showChat, showStart, showSettings }: ShowArgs) {
		showChat.value = false;
		showStart.value = true;
		showSettings.value = false;
	}

	static Chat({ showChat, showStart, showSettings }: ShowArgs) {
		showChat.value = true;
		showStart.value = false;
		showSettings.value = false;
	}

	static Settings({
		showChat,
		showStart,
		showSettings,
		checkingVersion,
	}: ShowArgs & { checkingVersion: Ref<boolean> }) {
		showChat.value = false;
		showStart.value = false;
		showSettings.value = true;
		checkingVersion.value = false;
	}
}
