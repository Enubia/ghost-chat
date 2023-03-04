import { BrowserWindow } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import { StoreKeys } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

export default class Settings {
	window: BrowserWindow | null;

	constructor(private store: ElectronStore<AppStore>, private destroyWindow: () => void) {}

	buildWindow(indexHtml: string, arg: any) {
		log.info('Building settings window');

		const { savedWindowState } = this.store.get('settings');

		this.window = new BrowserWindow({
			title: 'Ghost Chat - Settings',
			x: savedWindowState.x,
			y: savedWindowState.y,
			width: savedWindowState.width || 900,
			height: savedWindowState.height || 900,
			resizable: true,
			maximizable: false,
			show: false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
		});

		this.store.set<typeof StoreKeys.Settings>('settings', {
			isOpen: true,
			savedWindowState,
		});

		if (savedWindowState.x === 0 && savedWindowState.y === 0) {
			this.window.center();
		}

		if (process.env.VITE_DEV_SERVER_URL) {
			this.window.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`);
			// this.window.webContents.openDevTools({
			// 	mode: 'bottom',
			// });
		} else {
			this.window.loadFile(indexHtml, { hash: arg });
		}

		this.window.once('ready-to-show', () => {
			this.window?.show();
		});

		this.window.on('close', () => {
			if (this.window) {
				const windowBounds = this.window.getBounds();

				this.store.set<typeof StoreKeys.Settings>('settings', {
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
				log.error('Settings closed but reference is already gone');
				this.store.reset('settings');
			}

			this.window = null;
			this.destroyWindow();
		});
	}
}
