import { join } from 'node:path';

import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import ElectronStore from 'electron-store';

import { IpcConstants, StoreKeys } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

export default class MainWindow {
	constructor(private store: ElectronStore<AppStore>) {}

	buildWindow(indexHtml: string) {
		const windowState = this.store.get('savedWindowState');
		const webPreferences: Electron.WebPreferences = {
			webviewTag: true,
			nodeIntegration: true,
			contextIsolation: false,
		};

		if (!windowState.isTransparent) {
			webPreferences.preload = join(__dirname, '../preload/index.js');
		}

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
			webPreferences,
		});

		window.setAlwaysOnTop(true, 'pop-up-menu');
		window.setFullScreenable(false);

		if (process.platform === 'darwin') {
			window.setVisibleOnAllWorkspaces(true);
			app.dock.hide();
		}

		if (windowState.x === 0 && windowState.y === 0) {
			window.center();
		}

		if (windowState.isClickThrough) {
			window.setIgnoreMouseEvents(true);
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

		window.webContents.on('did-finish-load', () => {
			window?.webContents.send(IpcConstants.GetVersion, app.getVersion());
		});

		window.webContents.on('will-navigate', (event, url) => {
			event.preventDefault();
			shell.openExternal(url);
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
				this.store.reset('savedWindowState');
			}
		});

		window.on('closed', () => {
			if (!this.store.get('savedWindowState').isTransparent) {
				this.store.set('channelOptions.channel', '');
			}
		});

		return window;
	}
}
