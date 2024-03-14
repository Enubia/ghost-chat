import { BrowserWindow, shell } from 'electron';
import log from 'electron-log';
import type ElectronStore from 'electron-store';

import type { StoreKeys } from '@shared/constants';
import { IpcEvent } from '@shared/constants';
import type { AppStore } from '@shared/types';

export default class Settings {
    public window: BrowserWindow | null = null;

    constructor(
        private overlay: BrowserWindow | null,
        private store: ElectronStore<AppStore>,
        private destroyWindow: () => void,
    ) {}

    buildWindow(indexHtml: string, arg: any) {
        log.info('Building settings window');

        const { savedWindowState } = this.store.get('settings');

        log.info('Settings window state', savedWindowState);

        this.window = new BrowserWindow({
            title: 'Ghost Chat - Settings',
            x: savedWindowState.x,
            y: savedWindowState.y,
            width: savedWindowState.width || 900,
            height: savedWindowState.height || 900,
            resizable: true,
            maximizable: false,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });

        this.store.set<typeof StoreKeys.Settings>('settings', {
            isOpen: true,
            savedWindowState,
        });

        this.window.setAlwaysOnTop(true, 'pop-up-menu');

        if (savedWindowState.x === 0 && savedWindowState.y === 0) {
            this.window.center();
        }

        if (process.env.VITE_DEV_SERVER_URL) {
            this.window.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`);

            this.window.webContents.openDevTools({
                mode: 'right',
            });
        } else {
            this.window.loadFile(indexHtml, { hash: arg });
        }

        this.window.webContents.on('will-navigate', (event, url) => {
            log.info(`Opening external link to ${url}`);
            event.preventDefault();
            shell.openExternal(url);
        });

        this.window.once('ready-to-show', () => {
            this.window?.show();
        });

        this.window.on('close', () => {
            if (this.window) {
                const windowBounds = this.window.getBounds();

                log.info('Closing, saved settings window state', windowBounds);

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
            this.overlay?.webContents.send(IpcEvent.Rerender);
        });
    }
}
