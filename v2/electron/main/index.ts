import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, Tray, ipcMain, Menu, shell, WebPreferences } from 'electron';

import { IpcConstants, StoreKeys } from '../../shared/constants';

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

const preload = join(__dirname, '../preload/index.js');
const indexHtml = join(process.env.DIST, 'index.html');

function createWindow() {
	const windowState = store.get('savedWindowState');

	const webPreferences: WebPreferences = {
		webviewTag: true,
		nodeIntegration: true,
		contextIsolation: false,
	};

	if (!windowState.isTransparent) {
		webPreferences.preload = preload;
	}

	// eslint-disable-next-line no-param-reassign
	window = new BrowserWindow({
		title: 'Ghost Chat',
		x: windowState.x,
		y: windowState.y,
		width: windowState.width || 400,
		height: windowState.height || 800,
		transparent: windowState.isTransparent,
		frame: false,
		resizable: true,
		maximizable: false,
		webPreferences,
	});

	window.setAlwaysOnTop(true, 'pop-up-menu');
	window.setFullScreenable(false);

	if (process.platform === 'darwin') {
		window.setVisibleOnAllWorkspaces(true);
		app.dock.hide();
	}

	if (windowState.x === 0 && windowState.y === 0) {
		// center the window on initial launch
		window.center();
	}

	if (windowState.isClickThrough) {
		window.setIgnoreMouseEvents(true);
	}

	if (process.env.VITE_DEV_SERVER_URL) {
		window.loadURL(process.env.VITE_DEV_SERVER_URL);
		if (!windowState.isTransparent) {
			window.webContents.openDevTools({
				mode: 'bottom',
			});
		}
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

	// eslint-disable-next-line no-param-reassign
	tray = new Tray(trayIcnPath);

	const trayIconMenu = Menu.buildFromTemplate([
		{
			label: 'Revert Vanish',
			type: 'normal',
			click: async () => {
				store.set('savedWindowState.clickThrough', false);
				store.set('savedWindowState.isTransparent', false);
				window?.setIgnoreMouseEvents(false);
				app.relaunch();
				app.exit();
			},
		},
		{
			label: 'Revert ClickThrough',
			type: 'normal',
			click: async () => {
				store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
					...store.get('savedWindowState'),
					isClickThrough: false,
				});

				window?.setIgnoreMouseEvents(false);
			},
		},
		{
			label: 'Quit Ghost Chat',
			click: async () => {
				window?.close();
			},
		},
	]);

	tray?.setToolTip('Ghost Chat');
	tray?.setContextMenu(trayIconMenu);

	window.on('close', () => {
		if (window) {
			const windowBounds = window.getBounds();

			store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
				x: windowBounds.x,
				y: windowBounds.y,
				width: windowBounds.width,
				height: windowBounds.height,
				isClickThrough: false,
				isTransparent: false,
			});
		} else {
			// if the window should be null reset the window state entirely just in case
			store.reset('savedWindowState');
		}
	});

	window.on('closed', () => {
		if (!store.get('savedWindowState').isTransparent) {
			store.set<typeof StoreKeys.ChannelOptions>('channelOptions', {
				...store.get('channelOptions'),
				channel: '',
			});
		}
	});
}

// ---------------------------------- ipc handling ----------------------------------

ipcMain.on(IpcConstants.Close, () => {
	window?.close();
});

ipcMain.on(IpcConstants.SetClickThrough, () => {
	store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
		...store.get('savedWindowState'),
		isClickThrough: true,
	});
	window?.setIgnoreMouseEvents(true);
});

ipcMain.on(IpcConstants.Minimize, () => {
	window?.minimize();
});

ipcMain.on(IpcConstants.Vanish, () => {
	const windowBounds = window?.getBounds();
	store.set('savedWindowState', {
		x: windowBounds?.x,
		y: windowBounds?.y,
		width: windowBounds?.width,
		height: windowBounds?.height,
		isClickThrough: true,
		isTransparent: true,
	});
	app.relaunch();
	app.exit();
});

ipcMain.on('removeLoading', () => {
	window?.webContents.send('removeLoading');
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
			createWindow();
		}
	}
});

app.whenReady().then(createWindow);
