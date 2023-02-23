import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';
import ElectronStore from 'electron-store';

import { AppStore, StoreKeys } from '../../shared/constants';

const clearConfigData = (store: ElectronStore<AppStore>): void => {
	const appName = app.getName();
	const configPath = path.join(app.getPath('appData'), `${appName}\\config.json`);

	fs.unlink(configPath, () => {
		store.set(StoreKeys.DataCleared, true);
		app.relaunch();
		app.exit();
	});
};

export default clearConfigData;
