import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, shell, Tray, Menu, ipcMain } from 'electron';

import { IpcConstants, StoreKeys } from '../../shared/constants';
import { getWindowBoundsForStore } from '../../shared/utils';
import { savedWindowState } from '../utils';

import createStore from './appStore';

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

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const indexHtml = join(process.env.DIST, 'index.html');

function revertWindowSettings() {
	store.set(StoreKeys.ClickThrough, false);
	window?.setIgnoreMouseEvents(false);
}

async function createWindow() {
	const windowState = store.get(StoreKeys.SavedWindowState);
	const shouldBeTransparent = store.get(StoreKeys.ShouldBeTransparent, false) as boolean;

	window = new BrowserWindow({
		title: 'Ghost Chat',
		// icon: join(process.env.PUBLIC, 'favicon.ico'),
		x: windowState.x,
		y: windowState.y,
		width: windowState.width || 400,
		height: windowState.height || 800,
		transparent: shouldBeTransparent,
		frame: false,
		resizable: true,
		webPreferences: {
			preload,
			// https://www.electronjs.org/docs/latest/api/webview-tag <- embeds the chats and can inject css, good stuff
			webviewTag: true,
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.platform !== 'darwin') {
		window.setAlwaysOnTop(true, 'pop-up-menu');
	} else {
		app.dock.hide();
		window.setAlwaysOnTop(true, 'floating');
		window.setVisibleOnAllWorkspaces(true);
		window.setFullScreenable(false);
	}

	if (windowState.x === 0 && windowState.y === 0) {
		// center the window on initial launch
		window.center();
	}

	window.setMaximizable(false);

	if (process.env.VITE_DEV_SERVER_URL) {
		// electron-vite-vue#298
		window.loadURL(process.env.VITE_DEV_SERVER_URL);
		// Open devTool if the app is not packaged
		window.webContents.openDevTools({
			mode: 'detach',
			activate: false,
		});
	} else {
		window.loadFile(indexHtml);
	}

	window.webContents.on('did-finish-load', () => {
		window?.webContents.send('get-version', app.getVersion());
	});

	// Make all links open with the browser, not with the application
	window.webContents.on('will-navigate', (event, url) => {
		event.preventDefault();
		shell.openExternal(url);
	});

	const trayIcnName = 'trayicon.png';
	const trayIcnPath = `${process.env.PUBLIC}/${trayIcnName}`;

	tray = new Tray(trayIcnPath);

	const trayIconMenu = Menu.buildFromTemplate([
		{
			label: 'Revert Click through',
			type: 'normal',
			click: async () => {
				revertWindowSettings();
				window?.reload();
			},
		},
		{
			label: 'Quit Ghost Chat',
			click: async () => {
				revertWindowSettings();
				window?.close();
			},
		},
	]);

	tray?.setToolTip('Ghost Chat');
	tray?.setContextMenu(trayIconMenu);

	window.on('close', () => {
		if (window) {
			savedWindowState(window, store);
			const options = getWindowBoundsForStore(window);

			store.set(StoreKeys.SavedWindowState, options);
		}

		if (store.has(StoreKeys.ClickThrough)) {
			revertWindowSettings();
		}
	});

	window.on('closed', () => {
		store.delete(StoreKeys.Channel);
	});
}

// ---------------------------------- ipc handling ----------------------------------

ipcMain.on(IpcConstants.Close, () => {
	window?.close();
});

ipcMain.on(IpcConstants.Reload, () => {
	window?.reload();
});

ipcMain.on(IpcConstants.SetClickThrough, () => {
	window?.setIgnoreMouseEvents(true);
	window?.reload();
});

ipcMain.on(IpcConstants.Minimize, () => {
	window?.minimize();
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
			await createWindow();
		}
	}
});

app.whenReady().then(createWindow);
