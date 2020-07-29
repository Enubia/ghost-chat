import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import ElectronStore from 'electron-store';
import { StoreConstants } from '@/utils/constants';

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
