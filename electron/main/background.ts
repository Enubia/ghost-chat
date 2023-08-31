import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow, crashReporter } from 'electron';
import log from 'electron-log';
import unhandled from 'electron-unhandled';

import { IpcEvent } from '../../shared/constants';

import AutoUpdater from './autoUpdater';
import IpcEvents from './ipcEvents';
import createStore from './store';
import TrayIcon from './trayIcon';
import Overlay from './window/overlay';

log.transports.file.level = 'info';

const date = new Date();
const logFileDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

log.transports.file.fileName = `app-${logFileDate}.log`;

log.info('App starting');

crashReporter.start({ submitURL: '', uploadToServer: false });

log.info('Crash reporter started');

unhandled({
	logger: (error) => {
		log.error(error);
	},
	showDialog: true,
	reportButton: async (error) => {
		await fetch(
			'https://discord.com/api/webhooks/1122184754465341570/9EjYJkd5zgwdAq_rQlNeX5PYZBHenE9ZCN-ZddlFbgOcIcKGJJrxlxGBiZeS3OzkjOOp',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content: `
						App crash report for ${process.platform} <@277132742087671808>\n**${error.name}**\n${error.message}\n\`\`\`${error.stack}\`\`\`
					`,
				}),
			},
		);

		log.info('Crash report sent, exiting app');
		process.exit(1);
	},
});

if ((process.platform === 'win32' && release().startsWith('6.1')) || process.platform === 'linux') {
	log.info('called disableHardwareAcceleration');
	app.disableHardwareAcceleration();
}

if (process.platform === 'win32') {
	log.info('called setAppUserModelId');
	app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
	log.error('quit due to requestSingleInstanceLock');
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

let overlay: BrowserWindow | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let child: BrowserWindow | null = null;
let ipcEvents: IpcEvents;

app.on('ready', () => {
	setTimeout(
		async () => {
			overlay = new Overlay(store).buildWindow(indexHtml);
			new TrayIcon(store, overlay).buildTray(trayIconPath);
			ipcEvents = new IpcEvents(store);
			ipcEvents.registerWindow(overlay);
			ipcEvents.registerEvents(indexHtml);

			// only call auto-updater for prod environment
			if (!process.env.VITE_DEV_SERVER_URL) {
				new AutoUpdater(store, overlay, false);
			} else {
				// if you want to test the autoupdater and loading screen comment the line below and uncomment the autoupdater init
				overlay.on('show', () => overlay?.webContents.send(IpcEvent.UpdateNotAvailable));
				// new AutoUpdater(store, overlay, true);
			}
		},
		process.platform === 'linux' ? 1000 : 0,
	);
});

app.on('activate', () => {
	log.info('App activated');

	if (overlay?.isMinimized()) {
		log.info('Restoring overlay');
		overlay.restore();
	} else {
		const allWindows = BrowserWindow.getAllWindows();
		if (allWindows.length) {
			// log.info('Focusing overlay');
			// allWindows[0].focus();
			if (overlay) {
				child = new Overlay(store, { parent: overlay }).buildWindow(indexHtml);
			}
		} else {
			log.info('Recreating overlay');
			overlay = new Overlay(store).buildWindow(indexHtml);
			// register the events and overlay again since they still hold a reference to a null object in case the overlay was recreated
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
	child = null;

	if (process.platform === 'darwin') {
		if (store.get('general').mac.quitOnClose) {
			log.info('App closing');
			app.quit();
		} else {
			app.dock.show();
		}
	} else {
		log.info('App closing');
		app.quit();
	}
});
