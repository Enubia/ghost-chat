import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, shell, Tray, Menu, ipcMain } from 'electron';
import contextMenu from 'electron-context-menu';
import ElectronStore from 'electron-store';

import type { WindowState } from '../../@types/windowState';
import { IpcConstants, StoreConstants } from '../../constants';
import clearConfigData from '../helper/clearConfigData';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
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

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
let tray: Tray | null;

const store = new ElectronStore();

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

function revertWindowSettings(): Promise<void> {
	return new Promise((resolve) => {
		if (store.has(StoreConstants.HideBordersByIcon)) {
			store.set(StoreConstants.OpacityLevel, store.get(StoreConstants.SavedOpacityLevel));
			store.delete(StoreConstants.HideBordersByIcon);
			store.delete(StoreConstants.SavedOpacityLevel);
		}
		store.set(StoreConstants.ClickThrough, false);
		store.set(StoreConstants.ShowBorders, true);
		resolve();
	});
}

async function createWindow() {
	const windowState = store.get(StoreConstants.SavedWindowState, {}) as WindowState;

	win = new BrowserWindow({
		title: 'Ghost Chat',
		// icon: join(process.env.PUBLIC, 'favicon.ico'),
		x: windowState.posX,
		y: windowState.posY,
		width: windowState.sizeX || 400,
		height: windowState.sizeY || 800,
		minHeight: 335,
		// transparent: true,
		frame: false,
		resizable: true,
		webPreferences: {
			preload,
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	// win.setIgnoreMouseEvents(Boolean(store.get(StoreConstants.ClickThrough)) || false);

	if (process.platform !== 'darwin') {
		win.setAlwaysOnTop(true, 'pop-up-menu');
	} else {
		app.dock.hide();
		win.setAlwaysOnTop(true, 'floating');
		win.setVisibleOnAllWorkspaces(true);
		win.setFullScreenable(false);
	}

	win.setMaximizable(false);

	if (process.env.VITE_DEV_SERVER_URL) {
		// electron-vite-vue#298
		win.loadURL(url);
		// Open devTool if the app is not packaged
		win.webContents.openDevTools({
			mode: 'detach',
			activate: false,
		});
	} else {
		win.loadFile(indexHtml);
	}

	// Test actively push message to the Electron-Renderer
	// win.webContents.on('did-finish-load', () => {
	// 	win?.webContents.send('main-process-message', new Date().toLocaleString());
	// });

	// Make all links open with the browser, not with the application
	win.webContents.on('will-navigate', (event, url) => {
		event.preventDefault();
		shell.openExternal(url);
	});

	contextMenu({
		prepend: () => [
			{
				label: 'Settings',
				click: async () => {
					if (win) {
						win.resizable = true;

						const [posX, posY] = win.getPosition();
						const [sizeX, sizeY] = win.getSize();

						store.set(StoreConstants.SavedWindowState, { posX, posY, sizeX, sizeY });
						store.set(StoreConstants.IsSettingsPage, true);

						win.setSize(400, 800);

						win.webContents.send('settings');
					}
				},
			},
			{
				label: 'Back to start',
				click: () => {
					if (win) {
						if (!win.resizable) {
							win.resizable = true;
						}

						store.delete(StoreConstants.IsSettingsPage);
						store.delete(StoreConstants.Channel);

						if (store.has(StoreConstants.SavedWindowState)) {
							const state = store.get(StoreConstants.SavedWindowState) as WindowState;
							win.setSize(state.sizeX, state.sizeY);
							win.setPosition(state.posX, state.posY);
						}

						win.webContents.send('index');
					}
				},
			},
			{
				label: 'Back to Chat',
				click: () => {
					if (win) {
						if (!win.resizable) {
							win.resizable = true;
						}

						store.delete(StoreConstants.IsSettingsPage);

						if (store.has(StoreConstants.SavedWindowState)) {
							const state = store.get(StoreConstants.SavedWindowState) as WindowState;
							win.setSize(state.sizeX, state.sizeY);
							win.setPosition(state.posX, state.posY);
						}
						win.webContents.send('chat');
					}
				},
			},
			{
				label: 'Quit',
				click: async () => {
					if (win) {
						await revertWindowSettings();
						win.close();
					}
				},
			},
		],
	});

	const trayIcnName = 'trayicon.png';
	const trayIcnPath = `${process.env.PUBLIC}/${trayIcnName}`;

	tray = new Tray(trayIcnPath);

	const trayIconMenu = Menu.buildFromTemplate([
		{
			label: 'Revert Click through',
			type: 'normal',
			click: async () => {
				win?.setIgnoreMouseEvents(false);
				await revertWindowSettings();
				win?.reload();
			},
		},
		{
			label: 'Quit Ghost Chat',
			click: async () => {
				await revertWindowSettings();
				app.quit();
			},
		},
	]);

	tray?.setToolTip('Ghost Chat');
	tray?.setContextMenu(trayIconMenu);

	win.on('close', () => {
		const windowBounds = win.getBounds();

		const options: WindowState = {
			posX: windowBounds.x,
			posY: windowBounds.y,
			sizeX: windowBounds.width,
			sizeY: windowBounds.height,
		};

		store.set(StoreConstants.SavedWindowState, options);
	});

	win.on('closed', async () => {
		if (store.has(StoreConstants.HideBordersByIcon)) {
			await revertWindowSettings();
		}

		store.delete(StoreConstants.Channel);

		win = null;
	});
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	win = null;
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('second-instance', () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) {
			win.restore();
		}
		win.focus();
	}
});

app.on('activate', async () => {
	if (!store.has(StoreConstants.DataCleared)) {
		clearConfigData(store);
	}
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		await createWindow();
	}
});

ipcMain.on(IpcConstants.Close, async () => {
	if (store.has(StoreConstants.IsSettingsPage)) {
		store.delete(StoreConstants.IsSettingsPage);
	}

	const state = store.get(StoreConstants.SavedWindowState) as WindowState;
	win?.setSize(state.sizeX, state.sizeY);
	win?.setPosition(state.posX, state.posY);

	if (process.platform !== 'darwin') {
		store.delete(StoreConstants.Channel);
		win?.close();
	}
});

// TODO: check if this is still needed or not,
// reloading the renderer should be fine for almost everything

// ipcMain.on(IpcConstants.Relaunch, (_event, args) => {
// 	store.delete(StoreConstants.IsSettingsPage);

// 	if (args) {
// 		win?.setSize(parseInt(args.winSize.width, 10), parseInt(args.winSize.height, 10));
// 		win?.setPosition(parseInt(args.winPos.x, 10), parseInt(args.winPos.y, 10));
// 	}

// 	app.relaunch();
// });

ipcMain.on(IpcConstants.Reload, (_event, args) => {
	store.delete(StoreConstants.IsSettingsPage);

	win?.reload();
	win?.setSize(parseInt(args.winSize.width, 10), parseInt(args.winSize.height, 10));
});

ipcMain.on(IpcConstants.SetClickThrough, () => {
	win?.setIgnoreMouseEvents(true);
	win?.reload();
});

ipcMain.on(IpcConstants.Resize, (_event, args) => {
	store.delete(StoreConstants.IsSettingsPage);

	if (win) {
		if (args.resizeAble) {
			win.resizable = true;
		}
	}

	if (!args.center) {
		const state = store.get(StoreConstants.SavedWindowState) as WindowState;

		win?.setSize(state.sizeX, state.sizeY);

		win?.setPosition(state.posX, state.posY);
	}
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
