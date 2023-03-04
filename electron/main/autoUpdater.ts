import { BrowserWindow } from 'electron';
import log from 'electron-log';
import type ElectronStore from 'electron-store';
import { AppUpdater, autoUpdater } from 'electron-updater';

import { IpcEvent } from '../../shared/constants';
import { AppStore } from '../../shared/types';

export default class AutoUpdater {
	private autoUpdater: AppUpdater;
	private channel: string;

	constructor(
		private store: ElectronStore<AppStore>,
		private overlay: BrowserWindow,
		private forceDevUpdateConfig: boolean,
	) {
		this.channel = this.store.get('updater').channel;

		this.autoUpdater = autoUpdater;

		this.init();
	}

	private init() {
		this.autoUpdater.logger = log;

		// this.autoUpdater.channel = this.channel;

		if (this.forceDevUpdateConfig) {
			this.autoUpdater.forceDevUpdateConfig = true;
		}

		this.autoUpdater.checkForUpdatesAndNotify();

		this.autoUpdater.on('checking-for-update', () => {
			this.sendStatusToWindow(IpcEvent.CheckingForUpdate);
		});

		this.autoUpdater.on('update-available', (info) => {
			this.sendStatusToWindow(IpcEvent.UpdateAvailable, info.version);
		});

		this.autoUpdater.on('update-not-available', (_info) => {
			this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
		});

		this.autoUpdater.on('error', (err) => {
			this.autoUpdater.logger?.error(err);
			this.sendStatusToWindow(IpcEvent.Error);
		});

		this.autoUpdater.on('update-downloaded', (_info) => {
			this.sendStatusToWindow('Update downloaded');
		});
	}

	private sendStatusToWindow(message: string, version?: string) {
		this.overlay.webContents.send(message, version);
	}
}
