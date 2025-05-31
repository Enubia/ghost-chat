import { IpcEvent } from '#ipc/constants/events.js';
import type { AppStore, Updater } from '#ipc/types/store.js';
import type { BrowserWindow } from 'electron';
import log from 'electron-log';
import type ElectronStore from 'electron-store';
import type { AppUpdater } from 'electron-updater';
import { autoUpdater } from 'electron-updater';

export default class AutoUpdater {
    private autoUpdater: AppUpdater;
    private logPrefix = this.constructor.name;
    private updaterSettings: Updater;

    constructor(
        private store: ElectronStore<AppStore>,
        private overlay: BrowserWindow,
        private forceDevUpdateConfig: boolean,
    ) {
        this.updaterSettings = this.store.get('updater');

        this.autoUpdater = autoUpdater;
    }

    private sendStatusToWindow(message: string, args?: string | Record<string, unknown>) {
        this.overlay.webContents.send(message, args);
    }

    init() {
        this.autoUpdater.logger = log;
        this.autoUpdater.autoDownload = false;
        this.autoUpdater.disableWebInstaller = true;

        if (this.forceDevUpdateConfig) {
            this.autoUpdater.forceDevUpdateConfig = true;
        }

        if (this.updaterSettings.channel === 'beta') {
            this.autoUpdater.allowPrerelease = true;
        }

        try {
            this.autoUpdater.checkForUpdatesAndNotify();
        } catch (error) {
            log.error(`[${this.logPrefix}]`, error);
            this.sendStatusToWindow(IpcEvent.Error);
        }

        this.autoUpdater.on('checking-for-update', () => {
            log.info(`[${this.logPrefix}] checking for update`);
        });

        this.autoUpdater.on('update-available', (info) => {
            log.info(`[${this.logPrefix}] update-available`, info.version);

            if (info.version.includes('beta') && this.updaterSettings.channel !== 'beta') {
                this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
            } else {
                this.sendStatusToWindow(IpcEvent.UpdateAvailable, info.version);
            }
        });

        this.autoUpdater.on('update-not-available', (info) => {
            log.info(`[${this.logPrefix}] update-not-available`, info.version);
            this.sendStatusToWindow(IpcEvent.UpdateNotAvailable);
        });

        this.autoUpdater.on('error', (err) => {
            this.autoUpdater.logger?.error(err);
            this.sendStatusToWindow(IpcEvent.Error);
        });
    }
}
