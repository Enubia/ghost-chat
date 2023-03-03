import { BrowserWindow } from 'electron';
import ElectronStore from 'electron-store';

import { AppStore } from '../../../shared/types';

export default class SettingsWindow {
	window: BrowserWindow | null;

	constructor(private store: ElectronStore<AppStore>) {}

	buildWindow(indexHtml: string, arg: any) {
		const { savedWindowState } = this.store.get('settings');

		this.window = new BrowserWindow({
			title: 'Ghost Chat - Settings',
			x: savedWindowState.x,
			y: savedWindowState.y,
			width: savedWindowState.width || 900,
			height: savedWindowState.height || 900,
			resizable: true,
			maximizable: false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
		});

		this.store.set<'settings'>('settings', {
			isOpen: true,
			savedWindowState,
		});

		if (savedWindowState.x === 0 && savedWindowState.y === 0) {
			this.window.center();
		}

		if (process.env.VITE_DEV_SERVER_URL) {
			this.window.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`);
			this.window.webContents.openDevTools({
				mode: 'bottom',
			});
		} else {
			this.window.loadFile(indexHtml, { hash: arg });
		}

		this.window.on('close', () => {
			if (this.window) {
				const windowBounds = this.window.getBounds();

				this.store.set('settings', {
					isOpen: false,
					savedWindowState: {
						x: windowBounds.x,
						y: windowBounds.y,
						width: windowBounds.width,
						height: windowBounds.height,
						theme: this.store.get('settings.theme'),
					},
				});
			} else {
				this.store.reset('settings');
			}

			this.window = null;
		});
	}
}
