import { app, BrowserWindow, ipcMain } from 'electron';
import ElectronStore from 'electron-store';

import { IpcEvent, StoreKeys } from '../../shared/constants';
import { AppStore } from '../../shared/types';

import Settings from './window/settings';

export default class IpcEvents {
	private settings: BrowserWindow | null;
	private overlay: BrowserWindow | null;

	constructor(private store: ElectronStore<AppStore>) {}

	registerEvents(overlay: BrowserWindow | null, indexHtml: string) {
		this.registerWindow(overlay);

		this.rerender();
		this.close();
		this.setClickThrough();
		this.minimize();
		this.vanish();
		this.openSettings(indexHtml);
	}

	registerWindow(overlay: BrowserWindow | null) {
		this.overlay = overlay;
	}

	private rerender() {
		ipcMain.on(IpcEvent.Rerender, (_event: Electron.IpcMainEvent, args: any) => {
			if (args === 'child' && this.settings) {
				this.settings.webContents.send(IpcEvent.Rerender);
			}

			if (args === 'parent' && this.overlay) {
				this.overlay.webContents.send(IpcEvent.Rerender);
			}
		});
	}

	private close() {
		ipcMain.on(IpcEvent.Close, () => {
			for (const window of BrowserWindow.getAllWindows()) {
				window.close();
			}
		});
	}

	private setClickThrough() {
		ipcMain.on(IpcEvent.SetClickThrough, () => {
			this.store.set('savedWindowState.isClickThrough', true);
			this.overlay?.setIgnoreMouseEvents(true);
		});
	}

	private minimize() {
		ipcMain.on(IpcEvent.Minimize, () => {
			this.overlay?.minimize();
		});
	}

	private vanish() {
		ipcMain.on(IpcEvent.Vanish, () => {
			const windowBounds = this.overlay?.getBounds() as Electron.Rectangle;
			this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
				x: windowBounds.x,
				y: windowBounds.y,
				width: windowBounds.width,
				height: windowBounds.height,
				isClickThrough: true,
				isTransparent: true,
				theme: this.store.get('savedWindowState.theme'),
			});

			app.relaunch();
			app.exit();
		});
	}

	private openSettings(indexHtml: string) {
		ipcMain.on(IpcEvent.OpenSettings, () => {
			if (this.settings) {
				this.settings.focus();
			} else {
				const _settings = new Settings(this.overlay, this.store, this.destroyWindow.bind(this));
				_settings.buildWindow(indexHtml, 'settings');
				this.settings = _settings.window;
			}
		});
	}

	private destroyWindow() {
		this.settings = null;
	}
}
