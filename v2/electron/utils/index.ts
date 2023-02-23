import { BrowserWindow } from 'electron';
import ElectronStore from 'electron-store';

import { AppStore, StoreKeys } from '../../shared/constants';
import { getWindowBoundsForStore } from '../../shared/utils';

export function savedWindowState(window: BrowserWindow, store: ElectronStore<AppStore>) {
	const options = getWindowBoundsForStore(window);

	store.set(StoreKeys.SavedWindowState, options);
}
