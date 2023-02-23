import ElectronStore from 'electron-store';

import { AppStore, StoreKeys } from '../../shared/constants';

export default function createStore() {
	return new ElectronStore<AppStore>({
		defaults: {
			[StoreKeys.ClickThrough]: false,
			[StoreKeys.Channel]: '',
			[StoreKeys.SavedWindowState]: {
				x: 0,
				y: 0,
				width: 400,
				height: 600,
			},
			[StoreKeys.ShouldBeTransparent]: false,
		},
		// clears the config is a user edits it and causes a syntax error
		clearInvalidConfig: true,
		// used to reflect changes from main in renderer
		watch: true,
		migrations: {
			'2.0.0': (store) => {
				store.clear();
			},
		},
	});
}
