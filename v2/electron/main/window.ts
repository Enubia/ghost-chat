import { App, BrowserWindow, Menu, shell, Tray } from 'electron';
import ElectronStore from 'electron-store';

import { AppStore } from '../../shared/constants';

export default function createWindow(
	app: App,
	window: BrowserWindow | null,
	store: ElectronStore<AppStore>,
	tray: Tray | null,
	indexHtml: string,
) {
	const windowState = store.get('savedWindowState');

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
		webPreferences: {
			// preload,
			webviewTag: true,
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

	if (process.env.VITE_DEV_SERVER_URL) {
		window.loadURL(process.env.VITE_DEV_SERVER_URL);
		window.webContents.openDevTools({
			mode: 'bottom',
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

			const windowState = {
				x: windowBounds.x,
				y: windowBounds.y,
				width: windowBounds.width,
				height: windowBounds.height,
				isClickThrough: false,
				isTransparent: false,
			};

			store.set('savedWindowState', windowState);
		} else {
			// if the window should be null reset the window state entirely just in case
			store.reset('savedWindowState');
		}
	});

	window.on('closed', () => {
		store.set('channelOptions.channel', '');
	});
}
