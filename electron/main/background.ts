import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log';

import path from 'node:path';

import { IpcEvent } from '#shared/constants/events.js';

import { cleanLogs, quit } from '../utils/index.js';
import AutoUpdater from './autoUpdater.js';
import IpcEvents from './ipcEvents.js';
import createStore from './store.js';
import TrayIcon from './trayIcon.js';
import Main from './window/main.js';

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

log.transports.file.level = 'info';

const date = new Date();
const logFileDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

log.transports.file.fileName = `app-${logFileDate}.log`;

cleanLogs();

log.info('App starting');

app.disableHardwareAcceleration();

const store = createStore();

log.info('Store created');

// paths relative to the output directory (dist, dist-electron)
const DIST_ELECTRON = path.join(import.meta.dirname, '../..');
const DIST = path.join(DIST_ELECTRON, '../out/dist');
const PUBLIC = process.env.VITE_DEV_SERVER_URL ? path.join(DIST_ELECTRON, '../public') : DIST;

const trayIconPath = `${PUBLIC}/trayicon.png`;

const indexHtml = path.join(DIST, 'index.html');

let mainWindow: BrowserWindow | null;
let ipcEvents: IpcEvents;

app.on('ready', () => {
    mainWindow = new Main(store).buildWindow(indexHtml);
    new TrayIcon(store).buildTray(trayIconPath);
    ipcEvents = new IpcEvents(store);
    ipcEvents
        .registerWindow(mainWindow)
        .registerEvents(indexHtml);

    if (process.env.VITE_DEV_SERVER_URL) {
        new AutoUpdater(store, mainWindow, true).init();
        // mainWindow.on('show', () => mainWindow?.webContents.send(IpcEvent.UpdateNotAvailable));
    } else {
        // only call updater for prod environment
        new AutoUpdater(store, mainWindow, false).init();
    }

    const keybinds = store.get('keybinds');

    if (keybinds) {
        try {
            for (const current in keybinds) {
                const { keybind, activationMessage } = keybinds[current];
                if (!keybind) {
                    continue;
                }

                globalShortcut.register(keybind, () => {
                    log.info(activationMessage);
                    ipcMain.emit(IpcEvent.Vanish);
                });

                log.info(`Registered [${keybind}]: ${current}`);
            }
        } catch (error) {
            log.error('Keybind register error: ', error);
        }
    }
});

app.on('activate', () => {
    log.info('App activated');

    if (mainWindow?.isMinimized()) {
        log.info('Restoring overlay');
        mainWindow.restore();
    } else {
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length) {
            log.info('Focusing overlay');
            allWindows[0].focus();
        } else {
            log.info('Recreating overlay');
            mainWindow = new Main(store).buildWindow(indexHtml);

            // register the events and overlay again
            // since they still hold a reference to a null object in case the overlay was recreated
            ipcEvents
                .registerWindow(mainWindow)
                .registerEvents(indexHtml);

            // wait a second for the window to be created again so that it can handle events
            setTimeout(() => {
                mainWindow?.webContents.send(IpcEvent.Recreated);
            }, 1000);
        }
    }
});

app.on('window-all-closed', () => {
    mainWindow = null;

    if (process.platform === 'darwin') {
        if (store.get('general').mac.quitOnClose) {
            quit();
        } else {
            app.dock?.show();
        }
    } else {
        quit();
    }
});
