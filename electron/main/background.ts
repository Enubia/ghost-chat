import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, crashReporter } from 'electron';

import IpcEvents from './ipcEvents';
import createStore from './store';
import TrayIcon from './trayIcon';
import Overlay from './window/overlay';

crashReporter.start({ submitURL: '', uploadToServer: false });

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

const DIST_ELECTRON = join(__dirname, '..');
const DIST = join(DIST_ELECTRON, '../dist');
const PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(DIST_ELECTRON, '../public') : DIST;

const trayIcnName = 'trayicon.png';
const trayIconPath = `${PUBLIC}/${trayIcnName}`;

const indexHtml = join(DIST, 'index.html');

let mainWindow: BrowserWindow | null;

app.on('ready', () => {
	setTimeout(
		() => {
			mainWindow = new Overlay(store).buildWindow(indexHtml);
			new TrayIcon(store, mainWindow).buildTray(trayIconPath);
			new IpcEvents(store).registerEvents(mainWindow, indexHtml);
		},
		process.platform === 'linux' ? 1000 : 0,
	);
});

app.on('activate', () => {
	if (mainWindow?.isMinimized()) {
		mainWindow.restore();
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
	mainWindow = null;
	app.quit();
});
