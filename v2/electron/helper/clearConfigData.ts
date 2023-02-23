import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';
import ElectronStore from 'electron-store';

import { StoreConstants } from '../../shared/constants';

const clearConfigData = (store: ElectronStore): void => {
	const appName = app.getName();
	const configPath = path.join(app.getPath('appData'), `${appName}\\config.json`);

	fs.unlink(configPath, () => {
		store.set(StoreConstants.DataCleared, true);
		app.relaunch();
		app.exit();
	});
};

export default clearConfigData;
