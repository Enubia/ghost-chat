import { unlinkSync } from 'node:fs';

import ElectronStore from 'electron-store';

import { AppStore } from '../../shared/types';

export default function createStore() {
	return new ElectronStore<AppStore>({
		defaults: {
			chatOptions: {
				channel: '',
				fadeMessages: false,
				fadeTimeout: 30,
				showBotActivity: false,
				customCSS: '.chat_line {\n    font-size: 14px;\n}',
				customJS: '',
				defaultChannel: '',
				preventClipping: false,
				chatTheme: 'undefined',
			},
			savedWindowState: {
				x: 0,
				y: 0,
				width: 400,
				height: 600,
				isTransparent: false,
				isClickThrough: false,
				theme: null,
			},
			settings: {
				isOpen: false,
				savedWindowState: {
					x: 0,
					y: 0,
					width: 900,
					height: 760,
					theme: null,
				},
			},
			general: {
				mac: {
					quitOnClose: false,
					hideDockIcon: false,
				},
				language: 'en-US',
			},
			updater: {
				channel: 'latest',
			},
		},
		// clears the config is a user edits it and causes a syntax error
		clearInvalidConfig: true,
		// used to reflect changes from main in renderer
		watch: true,
		migrations: {
			'2.0.0': (store) => {
				// delete store file initially
				// there are old keys that might conflict with some of the new stuff
				unlinkSync(store.path);
			},
		},
	});
}
