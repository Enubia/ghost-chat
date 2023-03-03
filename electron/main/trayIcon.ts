import { Tray, Menu, app, BrowserWindow } from 'electron';
import ElectronStore from 'electron-store';

import { StoreKeys } from '../../shared/constants';
import { AppStore } from '../../shared/types';

export default class TrayIcon {
	private tray: Tray;
	private store: ElectronStore<AppStore>;
	private window: BrowserWindow;

	constructor(store: ElectronStore<AppStore>, window: BrowserWindow) {
		this.store = store;
		this.window = window;
	}

	buildTray(trayIconPath: string) {
		this.tray = new Tray(trayIconPath);

		const trayIconMenu = Menu.buildFromTemplate([
			{
				label: 'Disable Vanish',
				type: 'normal',
				click: () => {
					this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
						...this.store.get('savedWindowState'),
						isClickThrough: false,
						isTransparent: false,
					});

					app.relaunch();
					app.exit();
				},
			},
			{
				label: 'Disable Click-Through',
				type: 'normal',
				click: () => {
					this.store.set('savedWindowState.isClickThrough', false);

					this.window.setIgnoreMouseEvents(false);
				},
			},
			{
				label: 'Quit GhostChat',
				click: () => {
					app.quit();
				},
			},
		]);

		this.tray?.setToolTip('Ghost Chat');
		this.tray?.setContextMenu(trayIconMenu);
	}
}
