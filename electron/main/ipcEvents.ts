import { BrowserWindow, ipcMain, IpcMainEvent, Rectangle, globalShortcut } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import { IpcEvent, StoreKeys } from '../../shared/constants';
import { AppStore, WindowState } from '../../shared/types';

import Settings from './window/settings';

export default class IpcEvents {
    private settings: BrowserWindow | null;
    private overlay: BrowserWindow | null;

    constructor(private store: ElectronStore<AppStore>) {}

    registerEvents(indexHtml: string) {
        this.rerender();
        this.close();
        this.setClickThrough();
        this.minimize();
        this.vanish();
        this.openSettings(indexHtml);
        this.registerNewKeybind();
    }

    registerWindow(overlay: BrowserWindow | null) {
        this.overlay = overlay;
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

    private close() {
        ipcMain.on(IpcEvent.Close, () => {
            log.info('Closing all windows');

            for (const window of BrowserWindow.getAllWindows()) {
                window.close();
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

    private minimize() {
        ipcMain.on(IpcEvent.Minimize, () => {
            log.info('Minimizing overlay');

            this.overlay?.minimize();
        });
    }

    private vanish() {
        ipcMain.on(IpcEvent.Vanish, () => {
            if (!this.store.get('settings').isOpen && this.store.get('savedWindowState').isTransparent && this.store.get('chatOptions').channel != '') {
                // DISABLING VANISH CASE
                // Settings are CLOSED and the Window IS transparent
                log.info('Disabling Vanish');
                this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
                    ...this.store.get('savedWindowState'),
                    isClickThrough: false,
                    isTransparent: false,
                });

                this.overlay?.setIgnoreMouseEvents(false);
                this.overlay?.webContents.send(IpcEvent.ShowApp);
            } else if (!this.store.get('settings').isOpen && !this.store.get('savedWindowState').isTransparent && this.store.get('chatOptions').channel != '') {
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
                log.info('Settings are Open and Vanish Called OR Not in the Channel');
            }
        });
    }

    // IPC Event called in Settings->General->Keybinds Save
    private registerNewKeybind() {
        ipcMain.on(IpcEvent.RegisterNewKeybind, () => {
            log.info('Registering new Shortcut');
            globalShortcut.unregisterAll();
            globalShortcut.register(this.store.get('keybind').vanishKeybind, () => {
                log.info('Registered New Keybind');
                ipcMain.emit(IpcEvent.Vanish);
            });
        });
    }

    private openSettings(indexHtml: string) {
        ipcMain.on(IpcEvent.OpenSettings, () => {
            log.info('Opening settings window');

            if (this.settings) {
                log.info('Focusing settings window');

                this.settings.focus();
            } else {
                log.info('Creating settings window');

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
