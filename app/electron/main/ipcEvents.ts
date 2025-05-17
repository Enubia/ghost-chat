import type { IpcMainEvent, Rectangle } from 'electron';
import type ElectronStore from 'electron-store';

import type { AppStore, WindowState } from '#ipc/types/store.js';

import { BrowserWindow, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log';

import { IpcEvent } from '#ipc/constants/events.js';
import { StoreKeys } from '#ipc/constants/store/keys.js';

import Settings from './window/settings.js';

export default class IpcEvents {
    private overlay: BrowserWindow | null = null;

    private settings: BrowserWindow | null = null;

    constructor(private store: ElectronStore<AppStore>) {}

    private callStore() {
        ipcMain.handle(IpcEvent.CallStore, async (_event, data: {
            action: 'get' | 'set' | 'delete';
            key: keyof AppStore;
            value?: any;
        }) => {
            log.info('Calling store', data);

            switch (data.action) {
                case 'get':
                    return this.store.get(data.key);
                case 'set':
                    this.store.set(data.key, data.value);
                    break;
                case 'delete':
                    this.store.delete(data.key);
                    break;
                default:
                    log.error('Unknown action', data);
                    break;
            }
        });
    }

    private close() {
        ipcMain.on(IpcEvent.Close, () => {
            log.info('Closing all windows');

            for (const window of BrowserWindow.getAllWindows()) {
                window.close();
            }
        });
    }

    private destroyWindow() {
        this.settings = null;
    }

    private getPlatform() {
        ipcMain.handle(IpcEvent.GetPlatform, () => {
            log.info('Getting platform');

            return process.platform;
        });
    }

    private minimize() {
        ipcMain.on(IpcEvent.Minimize, () => {
            log.info('Minimizing overlay');

            this.overlay?.minimize();
        });
    }

    private openSettings(indexHtml: string) {
        ipcMain.on(IpcEvent.OpenSettings, () => {
            log.info('Opening settings window');

            if (!this.store.get('settings').isOpen) {
                this.store.set('settings.isOpen', true);
            }

            if (this.settings) {
                log.info('Focusing settings window');

                this.settings.focus();
            } else {
                log.info('Creating settings window');

                const _settings = new Settings(this.overlay, this.store, this.destroyWindow.bind(this));
                _settings.buildWindow(indexHtml, 'settings/general');
                this.settings = _settings.window;
            }
        });
    }

    private registerNewKeybind() {
        ipcMain.on(IpcEvent.RegisterNewKeybind, () => {
            log.info('Registering all keybinds after new keybind was set');

            globalShortcut.unregisterAll();

            const keybinds = this.store.get('keybinds');

            try {
                for (const current in keybinds) {
                    const { keybind, activationMessage } = keybinds[current as keyof typeof keybinds];
                    if (!keybind) {
                        this.overlay?.webContents.send(IpcEvent.Notification, { type: 'toggleUnbound' });
                        continue;
                    }

                    globalShortcut.register(keybind, () => {
                        log.info(activationMessage);
                        ipcMain.emit(IpcEvent.Vanish);
                    });

                    log.info(`Registered [${keybind}]: ${current}`);
                    this.overlay?.webContents.send(IpcEvent.Notification, { type: 'toggleSet' });
                }
            } catch (error) {
                log.error('ipcEvents', error);
            }
        });
    }

    private rerender() {
        ipcMain.on(IpcEvent.Rerender, (_event: IpcMainEvent, args: 'child' | 'parent') => {
            log.info('Rerendering', args);

            if (args === 'child' && this.settings) {
                this.settings.webContents.send(IpcEvent.Rerender);
            }

            if (args === 'parent' && this.overlay) {
                this.overlay.webContents.send(IpcEvent.Rerender);
            }
        });
    }

    private setClickThrough() {
        ipcMain.on(IpcEvent.SetClickThrough, () => {
            log.info('Setting click through to true');

            this.store.set('savedWindowState.isClickThrough', true);
            this.overlay?.setIgnoreMouseEvents(true);
        });
    }

    private themeChanged() {
        ipcMain.on(IpcEvent.ThemeChanged, (_event: IpcMainEvent, theme: string) => {
            log.info('Theme changed', theme);

            if (this.settings) {
                this.settings.webContents.send(IpcEvent.ThemeChanged, theme);
            }
        });
    }

    private vanish() {
        ipcMain.on(IpcEvent.Vanish, () => {
            if (
                !this.store.get('settings').isOpen
                && this.store.get('savedWindowState').isTransparent
            ) {
                // DISABLING VANISH CASE
                // Settings are CLOSED and the Window IS transparent
                log.info('Disabling Vanish');
                this.store.set<typeof StoreKeys.SavedWindowState>(StoreKeys.SavedWindowState, {
                    ...this.store.get('savedWindowState'),
                    isClickThrough: false,
                    isTransparent: false,
                });

                this.overlay?.setIgnoreMouseEvents(false);
                this.overlay?.webContents.send(IpcEvent.ShowApp);
            } else if (
                !this.store.get('settings').isOpen
                && !this.store.get('savedWindowState').isTransparent
            ) {
                // ENABLING VANISH CASE
                // Settings are CLOSED and Window IS NOT transparent
                log.info('Vanishing overlay');

                const windowBounds = this.overlay?.getBounds() as Rectangle;

                log.info('Saved window state', windowBounds);

                const theme = this.store.get('savedWindowState').theme;

                const data: WindowState = {
                    x: windowBounds.x,
                    y: windowBounds.y,
                    width: windowBounds.width,
                    height: windowBounds.height,
                    isClickThrough: true,
                    isTransparent: true,
                    theme,
                };

                this.store.set('savedWindowState', data);

                this.overlay?.setIgnoreMouseEvents(true);
                this.overlay?.webContents.send(IpcEvent.Vanish);
            } else {
                // Settings are OPEN and Vanish Call is activated
                // Just logged, nothing happens for the User
                log.info('Cannot vanish while settings are open!');
            }
        });
    }

    registerEvents(indexHtml: string) {
        this.rerender();
        this.themeChanged();
        this.close();
        this.setClickThrough();
        this.minimize();
        this.vanish();
        this.openSettings(indexHtml);
        this.registerNewKeybind();
        this.callStore();
        this.getPlatform();

        return this;
    }

    registerWindow(overlay: BrowserWindow | null) {
        this.overlay = overlay;

        return this;
    }
}
