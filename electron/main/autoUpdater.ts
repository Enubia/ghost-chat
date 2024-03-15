import type { BrowserWindow } from 'electron';
import log from 'electron-log';
import type ElectronStore from 'electron-store';
import type { AppUpdater } from 'electron-updater';
import { autoUpdater } from 'electron-updater';

import { IpcEvent } from '@shared/constants';
import type { AppStore, Updater } from '@shared/types';

export default class AutoUpdater {
    private autoUpdater: AppUpdater;
    private updater: Updater;

    constructor(
        private store: ElectronStore<AppStore>,
        private overlay: BrowserWindow,
        private forceDevUpdateConfig: boolean,
    ) {
        this.updater = this.store.get('updater');

        this.autoUpdater = autoUpdater;

        this.init();
    }

    private init() {
        this.autoUpdater.logger = log;
        this.autoUpdater.autoDownload = false;
        this.autoUpdater.disableWebInstaller = true;

        if (this.forceDevUpdateConfig) {
            this.autoUpdater.forceDevUpdateConfig = true;
        }

        if (this.updater.channel === 'beta') {
            this.autoUpdater.allowPrerelease = true;
        }

        try {
            this.checkForUpdates();
        } catch (error) {
            log.error(error);
            this.sendStatusToWindow(IpcEvent.Error);
        }

        this.autoUpdater.on('checking-for-update', () => {
            log.info('checking for update');
        });

        this.autoUpdater.on('update-available', (info) => {
            log.info('update-available', info.version);

            if (this.updater.disableAutoUpdate) {
                log.info('auto update disabled');
                return;
            }

            if (info.version.includes('beta') && this.updater.channel !== 'beta') {
                this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
            } else if (process.platform !== 'darwin') {
                this.autoUpdater.downloadUpdate();
                this.sendStatusToWindow(IpcEvent.UpdateAvailable, info.version);
            } else {
                log.info('manual update called');
                this.sendStatusToWindow(IpcEvent.ManualUpdateRequired, info.version);
            }
        });

        this.autoUpdater.on('update-not-available', (info) => {
            log.info('update-not-available', info.version);
            this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
        });

        this.autoUpdater.on('error', (err) => {
            this.autoUpdater.logger?.error(err);
            this.sendStatusToWindow(IpcEvent.Error);
        });

        this.autoUpdater.on('update-downloaded', (_info) => {
            this.sendStatusToWindow(IpcEvent.UpdateDownloaded);
        });
    }

    private sendStatusToWindow(message: string, args?: string | Record<string, unknown>) {
        this.overlay.webContents.send(message, args);
    }

    public checkForUpdates() {
        this.autoUpdater.checkForUpdatesAndNotify();
    }
}
