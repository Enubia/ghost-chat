import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, Tray, ipcMain } from 'electron';

import { IpcConstants } from '../../shared/constants';

import createStore from './appStore';
import createWindow from './window';

process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) {
	app.disableHardwareAcceleration();
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
	app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

let window: BrowserWindow | null = null;
let tray: Tray | null;

const store = createStore();

// const preload = join(__dirname, '../preload/index.js');
const indexHtml = join(process.env.DIST, 'index.html');

// ---------------------------------- ipc handling ----------------------------------

ipcMain.on(IpcConstants.Close, () => {
	window?.close();
});

ipcMain.on(IpcConstants.SetClickThrough, () => {
	window?.setIgnoreMouseEvents(true);
});

ipcMain.on(IpcConstants.Minimize, () => {
	window?.minimize();
});

ipcMain.on(IpcConstants.Vanish, () => {
	store.set('savedWindowState.isTransparent', true);
	window?.setIgnoreMouseEvents(true);
	app.relaunch();
	app.exit();
});

// New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
// 	const childWindow = new BrowserWindow({
// 		webPreferences: {
// 			preload,
// 			nodeIntegration: true,
// 			contextIsolation: false,
// 		},
// 	});

// 	if (process.env.VITE_DEV_SERVER_URL) {
// 		childWindow.loadURL(`${url}#${arg}`);
// 	} else {
// 		childWindow.loadFile(indexHtml, { hash: arg });
// 	}
// });

// ---------------------------------- app handling ----------------------------------

// Let the user create a second instance for another chat
// app.on('second-instance', () => {
// 	if (window?.isMinimized()) {
// 		window.restore();
// 	}

// 	window?.focus();
// });

app.on('window-all-closed', () => {
	window = null;
	app.quit();
});

app.on('activate', async () => {
	if (window?.isMinimized()) {
		window.restore();
	} else {
		const allWindows = BrowserWindow.getAllWindows();
		if (allWindows.length) {
			allWindows[0].focus();
		} else {
			createWindow(app, window, store, tray, indexHtml);
		}
	}
});

app.whenReady().then(() => createWindow(app, window, store, tray, indexHtml));
