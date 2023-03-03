import ElectronStore from 'electron-store';

import { AppStore } from '../../shared/types';

export default function createStore() {
	return new ElectronStore<AppStore>({
		defaults: {
			channelOptions: {
				channel: '',
				fadeMessages: false,
				showBotActivity: true,
				customCSS: '',
				customJS: '',
				persistentChannel: '',
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
					width: 880,
					height: 550,
					theme: null,
				},
			},
		},
		// clears the config is a user edits it and causes a syntax error
		clearInvalidConfig: true,
		// used to reflect changes from main in renderer
		watch: true,
		migrations: {
			'2.0.0-beta': (store) => {
				store.clear();
			},
		},
	});
}
