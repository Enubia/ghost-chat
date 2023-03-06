import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, crashReporter } from 'electron';
import log from 'electron-log';

import AutoUpdater from './autoUpdater';
import IpcEvents from './ipcEvents';
import createStore from './store';
import TrayIcon from './trayIcon';
import Overlay from './window/overlay';

if (app.isPackaged) {
	log.transports.file.level = 'info';
}

/* 
	Log locations:
		on Linux: ~/.config/ghost-chat/logs/main.log
		on macOS: ~/Library/Logs /ghost-chat/ main.log
		on Windows: %appdata%\Roaming\ghost-chat\logs\main.log
*/
log.info('App starting...');

crashReporter.start({ submitURL: '', uploadToServer: false });

log.info('Crash reporter started');

if ((process.platform === 'win32' && release().startsWith('6.1')) || process.platform === 'linux') {
	app.disableHardwareAcceleration();
}

if (process.platform === 'win32') {
	app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

const store = createStore();

log.info('Store created');

const DIST_ELECTRON = join(__dirname, '..');
const DIST = join(DIST_ELECTRON, '../dist');
const PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(DIST_ELECTRON, '../public') : DIST;

const trayIconPath = `${PUBLIC}/trayicon.png`;

const indexHtml = join(DIST, 'index.html');

let overlay: BrowserWindow | null;

app.on('ready', () => {
	setTimeout(
		async () => {
			overlay = new Overlay(store).buildWindow(indexHtml);

			if (process.platform === 'darwin') {
				// hide the dock icon AFTER the window is created
				// otherwise it will show up again and be persistent
				app.dock.hide();
			}

			new TrayIcon(store, overlay).buildTray(trayIconPath);
			new IpcEvents(store).registerEvents(overlay, indexHtml);
			new AutoUpdater(store, overlay, !!process.env.VITE_DEV_SERVER_URL);
		},
		process.platform === 'linux' ? 1000 : 0,
	);
});

app.on('activate', () => {
	if (overlay?.isMinimized()) {
		overlay.restore();
	} else {
		const allWindows = BrowserWindow.getAllWindows();
		if (allWindows.length) {
			allWindows[0].focus();
		} else {
			new Overlay(store).buildWindow(indexHtml);
		}
	}
});

app.on('window-all-closed', () => {
	overlay = null;

	log.info('App closing...');

	if (process.platform === 'darwin') {
		if (store.get('general').quitOnClose) {
			app.quit();
		}
	} else {
		app.quit();
	}
});
