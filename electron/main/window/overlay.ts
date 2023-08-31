import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import { StoreKeys } from '../../../shared/constants';
import { AppStore } from '../../../shared/types';

export default class Overlay {
	constructor(
		private store: ElectronStore<AppStore>,
		private childOptions?: {
			parent: BrowserWindow;
		},
	) {}

	buildWindow(indexHtml: string) {
		log.info('Building overlay window');

		let windowState: Electron.Rectangle = {
			x: 0,
			y: 0,
			width: 400,
			height: 800,
		};

		if (!this.childOptions) {
			windowState = this.store.get('savedWindowState');
		}

		log.info(`Overlay window  ${this.childOptions ? 'child' : 'parent'}`, windowState);

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
			transparent: true,
			frame: false,
			resizable: true,
			maximizable: false,
			show: false,
			webPreferences,
		});

		if (this.childOptions) {
			window.setParentWindow(this.childOptions.parent);
		}

		if (process.platform === 'darwin') {
			window.setVisibleOnAllWorkspaces(true);
		}

		window.setAlwaysOnTop(true, 'pop-up-menu');
		window.setFullScreenable(false);

		if (windowState.x === 0 && windowState.y === 0) {
			window.center();
		}

		if (process.platform === 'darwin') {
			if (this.store.get('general.mac.hideDockIcon')) {
				// hide the dock icon AFTER the window is created
				// otherwise it will show up again and be persistent
				app.dock.hide();
			}
		}

		if (!this.childOptions) {
			if (!this.store.has('savedWindowState.theme')) {
				this.store.set('savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
				this.store.set('settings.savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
			}
		}

		if (process.env.VITE_DEV_SERVER_URL) {
			window.loadURL(process.env.VITE_DEV_SERVER_URL);
			window.webContents.openDevTools({
				mode: 'detach',
			});
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
				if (!this.childOptions) {
					const windowBounds = window.getBounds();

					log.info('Closing, saved overlay window state', windowBounds);

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
				}
			} else {
				log.error('Overlay closed but reference is already gone');
				this.store.reset('savedWindowState');
			}
		});

		window.on('closed', () => {
			if (!this.childOptions) {
				if (!this.store.get('savedWindowState').isTransparent) {
					this.store.set('chatOptions.channel', '');
				}
			}
		});

		return window;
	}
}
