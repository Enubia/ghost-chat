import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, Tray, ipcMain, Menu, shell, nativeTheme, crashReporter } from 'electron';

import { IpcConstants, StoreKeys } from '../../shared/constants';

import createStore from './store';

crashReporter.start({ submitURL: '', uploadToServer: false });

const DIST_ELECTRON = join(__dirname, '..');
const DIST = join(DIST_ELECTRON, '../dist');
const PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(DIST_ELECTRON, '../public') : DIST;

// disable gpu acceleration for windows 7 and linux
if ((process.platform === 'win32' && release().startsWith('6.1')) || process.platform === 'linux') {
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
let childWindow: BrowserWindow | null = null;
let tray: Tray | null;

const store = createStore();

const preload = join(__dirname, '../preload/index.js');
const indexHtml = join(DIST, 'index.html');

function createWindow() {
	const windowState = store.get('savedWindowState');

	const webPreferences: Electron.WebPreferences = {
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

	store.set('savedWindowState.theme', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

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
	const trayIcnPath = `${PUBLIC}/${trayIcnName}`;

	// eslint-disable-next-line no-param-reassign
	tray = new Tray(trayIcnPath);

	const trayIconMenu = Menu.buildFromTemplate([
		{
			label: 'Disable Vanish',
			type: 'normal',
			click: () => {
				store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
					...store.get('savedWindowState'),
					isClickThrough: false,
					isTransparent: false,
				});

				app.relaunch();
				app.exit();
			},
		},
		{
			label: 'Disable Click-Through',
			type: 'normal',
			click: () => {
				store.set('savedWindowState.isClickThrough', false);

				window?.setIgnoreMouseEvents(false);
			},
		},
		{
			label: 'Quit GhostChat',
			click: () => {
				app.quit();
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
				theme: store.get('savedWindowState.theme'),
			});

			store.set('settings.isOpen', false);
		} else {
			// if the window should be null reset the window state entirely just in case
			store.reset('savedWindowState');
		}
	});

	window.on('closed', () => {
		if (!store.get('savedWindowState').isTransparent) {
			store.set('channelOptions.channel', '');
		}
	});
}

// ---------------------------------- ipc handling ----------------------------------

ipcMain.on(IpcConstants.Close, () => {
	for (const window of BrowserWindow.getAllWindows()) {
		window.close();
	}
});

ipcMain.on(IpcConstants.SetClickThrough, () => {
	store.set('savedWindowState.isClickThrough', true);
	window?.setIgnoreMouseEvents(true);
});

ipcMain.on(IpcConstants.Minimize, () => {
	window?.minimize();
});

ipcMain.on(IpcConstants.Vanish, () => {
	const windowBounds = window?.getBounds() as Electron.Rectangle;
	store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
		x: windowBounds.x,
		y: windowBounds.y,
		width: windowBounds.width,
		height: windowBounds.height,
		isClickThrough: true,
		isTransparent: true,
		theme: store.get('savedWindowState.theme'),
	});

	app.relaunch();
	app.exit();
});

ipcMain.on(IpcConstants.OpenSettings, (_, arg) => {
	const { savedWindowState } = store.get('settings');

	childWindow = new BrowserWindow({
		title: 'Ghost Chat - Settings',
		x: savedWindowState.x,
		y: savedWindowState.y,
		width: savedWindowState.width || 900,
		height: savedWindowState.height || 900,
		resizable: true,
		maximizable: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	store.set<typeof StoreKeys.Settings>('settings', {
		isOpen: true,
		savedWindowState,
	});

	if (savedWindowState.x === 0 && savedWindowState.y === 0) {
		childWindow.center();
	}

	if (process.env.VITE_DEV_SERVER_URL) {
		childWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`);
	} else {
		childWindow.loadFile(indexHtml, { hash: arg });
	}

	childWindow.on('close', () => {
		if (childWindow) {
			const windowBounds = childWindow.getBounds();

			store.set<typeof StoreKeys.Settings>('settings', {
				isOpen: false,
				savedWindowState: {
					x: windowBounds.x,
					y: windowBounds.y,
					width: windowBounds.width,
					height: windowBounds.height,
				},
			});
		} else {
			store.reset('settings');
		}
	});
});

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

app.on('activate', () => {
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
