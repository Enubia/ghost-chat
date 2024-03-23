import { join } from 'node:path';

import { BrowserWindow, app, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log';

import { IpcEvent } from '@shared/constants';

import AutoUpdater from './autoUpdater';
import IpcEvents from './ipcEvents';
import createStore from './store';
import TrayIcon from './trayIcon';
import Overlay from './window/overlay';
import ManualUpdater from './manualUpdater';

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

log.transports.file.level = 'info';

const date = new Date();
const logFileDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

log.transports.file.fileName = `app-${logFileDate}.log`;

log.info('App starting');

app.disableHardwareAcceleration();

const store = createStore();

log.info('Store created');

// paths relative to the output directory (dist, dist-electron)
const DIST_ELECTRON = join(__dirname, '..');
const DIST = join(DIST_ELECTRON, '../dist');
const PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(DIST_ELECTRON, '../public') : DIST;

const trayIconPath = `${PUBLIC}/trayicon.png`;

const indexHtml = join(DIST, 'index.html');

let overlay: BrowserWindow | null;
let ipcEvents: IpcEvents;
let manualUpdater: ManualUpdater;

app.on('ready', () => {
    setTimeout(
        async () => {
            overlay = new Overlay(store).buildWindow(indexHtml);
            new TrayIcon(store).buildTray(trayIconPath);
            ipcEvents = new IpcEvents(store);
            ipcEvents.registerWindow(overlay);
            ipcEvents.registerEvents(indexHtml);

            store.set('general.launchCounter', store.get('general').launchCounter + 1);

            // only call updater for prod environment
            if (!process.env.VITE_DEV_SERVER_URL) {
                if (store.get('updater').disableAutoUpdates) {
                    manualUpdater = new ManualUpdater(store, false);
                } else {
                    new AutoUpdater(store, overlay, false);
                }
            } else {
                // if (store.get('updater').disableAutoUpdate) {
                //     manualUpdater = new ManualUpdater(store, true);
                // } else {
                //     new AutoUpdater(store, overlay, true);
                // }

                overlay.on('show', () => overlay?.webContents.send(IpcEvent.UpdateNotAvailable));
            }

            if (manualUpdater) {
                ipcEvents.registerManualUpdater(manualUpdater);
            }
        },
        process.platform === 'linux' ? 1000 : 0,
    );

    // Registering the Keybind on the start of the App
    // Since all Keys are unregistered at close
    const keybind = store.get('keybind').vanishKeybind;

    if (keybind) {
        try {
            globalShortcut.register(keybind, () => {
                ipcMain.emit(IpcEvent.Vanish);
            });
        } catch (error) {
            log.error('background', error);
        }
    }
});

app.on('activate', () => {
    log.info('App activated');

    if (overlay?.isMinimized()) {
        log.info('Restoring overlay');
        overlay.restore();
    } else {
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length) {
            log.info('Focusing overlay');
            allWindows[0].focus();
        } else {
            log.info('Recreating overlay');
            overlay = new Overlay(store).buildWindow(indexHtml);

            // register the events and overlay again
            // since they still hold a reference to a null object in case the overlay was recreated
            ipcEvents.registerWindow(overlay);
            ipcEvents.registerEvents(indexHtml);

            // wait a second for the window to be created again so that it can handle events
            setTimeout(() => {
                overlay?.webContents.send(IpcEvent.Recreated);
            }, 1000);
        }
    }
});

app.on('window-all-closed', () => {
    overlay = null;

    const quit = () => {
        if (store.get('keybind').vanishKeybind) {
            log.info('unregistering all shortcuts');
            globalShortcut.unregisterAll();
        }

        log.info('App closing');
        app.quit();
    };

    if (process.platform === 'darwin') {
        if (store.get('general').mac.quitOnClose) {
            quit();
        } else {
            app.dock.show();
        }
    } else {
        quit();
    }
});
