import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import { StoreKeys } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

export default class Overlay {
	constructor(private store: ElectronStore<AppStore>) {}

	buildWindow(indexHtml: string) {
		log.info('Building overlay window');

		const windowState = this.store.get('savedWindowState');
		const webPreferences: Electron.WebPreferences = {
			webviewTag: true,
			nodeIntegration: true,
			contextIsolation: false,
		};

		const window = new BrowserWindow({
			title: 'Ghost Chat',
			x: windowState.x,
			y: windowState.y,
			width: windowState.width || 400,
			height: windowState.height || 800,
			transparent: windowState.isTransparent,
			frame: false,
			resizable: true,
			maximizable: false,
			show: false,
			webPreferences,
		});

		if (process.platform === 'darwin') {
			window.setVisibleOnAllWorkspaces(true);
		}

		window.setAlwaysOnTop(true, 'pop-up-menu');
		window.setFullScreenable(false);

		if (windowState.x === 0 && windowState.y === 0) {
			window.center();
		}

		if (windowState.isClickThrough) {
			window.setIgnoreMouseEvents(true);
		}

		if (process.platform === 'darwin') {
			// hide the dock icon AFTER the window is created
			// otherwise it will show up again and be persistent
			app.dock.hide();
		}

		this.store.set('savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
		this.store.set('settings.savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

		if (process.env.VITE_DEV_SERVER_URL) {
			window.loadURL(process.env.VITE_DEV_SERVER_URL);
			if (!windowState.isTransparent) {
				window.webContents.openDevTools({
					mode: 'bottom',
				});
			}
		} else {
			window.loadFile(indexHtml);
		}

		window.webContents.on('will-navigate', (event, url) => {
			log.info(`Opening external link to ${url}`);
			event.preventDefault();
			shell.openExternal(url);
		});

		window.once('ready-to-show', () => {
			window.show();
		});

		window.on('close', () => {
			if (window) {
				const windowBounds = window.getBounds();

				this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
					x: windowBounds.x,
					y: windowBounds.y,
					width: windowBounds.width,
					height: windowBounds.height,
					isClickThrough: false,
					isTransparent: false,
					theme: this.store.get('savedWindowState.theme'),
				});

				this.store.set('settings.isOpen', false);
			} else {
				log.error('Overlay closed but reference is already gone');
				this.store.reset('savedWindowState');
			}
		});

		window.on('closed', () => {
			if (!this.store.get('savedWindowState').isTransparent) {
				this.store.set('chatOptions.channel', '');
			}
		});

		return window;
	}
}
