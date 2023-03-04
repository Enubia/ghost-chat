import { app, BrowserWindow, ipcMain } from 'electron';
import ElectronStore from 'electron-store';

import { IpcConstants, StoreKeys } from '../../shared/constants';
import { AppStore } from '../../shared/types';

import Settings from './window/settings';

export default class IpcEvents {
	private settingsWindow: BrowserWindow | null;

	constructor(private store: ElectronStore<AppStore>) {}

	registerEvents(mainWindow: BrowserWindow | null, indexHtml: string) {
		this.rerender(mainWindow);
		this.close();
		this.setClickThrough(mainWindow);
		this.minimize(mainWindow);
		this.vanish(mainWindow);
		this.openSettings(indexHtml);
	}

	private rerender(mainWindow: BrowserWindow | null) {
		ipcMain.on(IpcConstants.Rerender, (_event: Electron.IpcMainEvent, args: any) => {
			if (args === 'child' && this.settingsWindow) {
				this.settingsWindow.webContents.send(IpcConstants.Rerender);
			}

			if (args === 'parent' && mainWindow) {
				mainWindow.webContents.send(IpcConstants.Rerender);
			}
		});
	}

	private close() {
		ipcMain.on(IpcConstants.Close, () => {
			for (const window of BrowserWindow.getAllWindows()) {
				window.close();
			}
		});
	}

	private setClickThrough(mainWindow: BrowserWindow | null) {
		ipcMain.on(IpcConstants.SetClickThrough, () => {
			this.store.set('savedWindowState.isClickThrough', true);
			mainWindow?.setIgnoreMouseEvents(true);
		});
	}

	private minimize(mainWindow: BrowserWindow | null) {
		ipcMain.on(IpcConstants.Minimize, () => {
			mainWindow?.minimize();
		});
	}

	private vanish(mainWindow: BrowserWindow | null) {
		ipcMain.on(IpcConstants.Vanish, () => {
			const windowBounds = mainWindow?.getBounds() as Electron.Rectangle;
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
		ipcMain.on(IpcConstants.OpenSettings, (_event: Electron.IpcMainEvent, args: any) => {
			if (this.settingsWindow) {
				this.settingsWindow.focus();
			} else {
				const _settingsWindow = new Settings(this.store, this.destroyWindow.bind(this));
				_settingsWindow.buildWindow(indexHtml, args);
				this.settingsWindow = _settingsWindow.window;
			}
		});
	}

	private destroyWindow() {
		this.settingsWindow = null;
	}
}
