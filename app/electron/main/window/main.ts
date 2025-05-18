import type { BrowserWindowConstructorOptions, WebPreferences } from 'electron';
import type ElectronStore from 'electron-store';

import type { AppStore } from '#ipc/types/store.js';

import { app, BrowserWindow, nativeTheme, shell } from 'electron';
import log from 'electron-log';

import { StoreKeys } from '#ipc/constants/store/keys.js';

export default class Main {
    constructor(private store: ElectronStore<AppStore>) {}

    buildWindow(indexHtml: string) {
        log.info('Building overlay window');

        const windowState = this.store.get('savedWindowState');

        log.info('Overlay window state', windowState);

        const webPreferences: WebPreferences = {
            webviewTag: true,
            // TODO: see if we can disable this again after everything is migrated to contextBridge
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
        };

        let options: BrowserWindowConstructorOptions = {
            title: 'Ghost Chat',
            x: windowState.x,
            y: windowState.y,
            width: windowState.width || 400,
            height: windowState.height || 800,
            transparent: true,
            frame: false,
            maximizable: false,
            titleBarStyle: 'hidden',
            show: false,
            roundedCorners: false,
            webPreferences,
        };

        if (process.platform === 'darwin') {
            options = {
                ...options,
                titleBarStyle: undefined,
            };
        }

        const window = new BrowserWindow(options);

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
                app.dock?.hide();
            }
        }

        if (!this.store.has('savedWindowState.theme')) {
            this.store.set('savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
            this.store.set('settings.savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
        }

        if (process.env.VITE_DEV_SERVER_URL) {
            window.loadURL(process.env.VITE_DEV_SERVER_URL);
            window.webContents.openDevTools({
                mode: 'right',
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
                const windowBounds = window.getBounds();

                log.info('Closing, saved overlay window state', windowBounds);

                this.store.set<typeof StoreKeys.SavedWindowState>(StoreKeys.SavedWindowState, {
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
                this.store.set('options.twitch.channel', '');
                this.store.set('options.kick.channel', '');
                this.store.set('options.external.url', '');
                this.store.set('options.youtube.channelId', '');
                this.store.set('options.youtube.video_url', '');
            }
        });

        return window;
    }
}
