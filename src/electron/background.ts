// electron stuff
import { app, protocol, BrowserWindow, Tray, Menu, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import windowStateKeeper from 'electron-window-state';
import contextMenu from 'electron-context-menu';
import ElectronStore from 'electron-store';
import * as logger from 'electron-log';
import * as path from 'path';

// custom stuff
import { StoreConstants, IpcConstants } from '@/utils/constants';
import { IWindowState } from '@/renderer/types/IWindowState';
import clearConfigData from './helper/clearConfigData';

const isDevelopment = process.env.NODE_ENV !== 'production';

app.disableHardwareAcceleration();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;
let tray: Tray | null;

const store = new ElectronStore();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

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
  const mainWindowState = windowStateKeeper({
    defaultWidth: 400,
    defaultHeight: 800,
  });

  // Create the browser window.
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minHeight: 335,
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.setIgnoreMouseEvents(Boolean(store.get(StoreConstants.ClickThrough)) || false);
  win.setAlwaysOnTop(true, 'pop-up-menu');
  win.setMaximizable(false);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol('app');
    await win.loadURL('app://./index.html');
  }

  contextMenu({
    prepend: () => [
      {
        label: 'Settings',
        click: async () => {
          if (win) {
            win.resizable = false;

            const [posX, posY] = win.getPosition();
            const [sizeX, sizeY] = win.getSize();

            store.set(StoreConstants.SavedWindowState, { posX, posY, sizeX, sizeY });
            store.set(StoreConstants.IsSettingsPage, true);

            win.setSize(400, 800);
            win.center();

            win.webContents.send('settings');
          }
        },
      },
      {
        label: 'Back to index',
        click: () => {
          if (win) {
            if (!win.resizable) {
              win.resizable = true;
            }

            store.delete(StoreConstants.IsSettingsPage);

            if (store.has(StoreConstants.SavedWindowState)) {
              const state = store.get(StoreConstants.SavedWindowState) as IWindowState;
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
              const state = store.get(StoreConstants.SavedWindowState) as IWindowState;
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
  const trayIcnPath = process.env.WEBPACK_DEV_SERVER_URL
    ? path.join(__dirname, `../public/${trayIcnName}`)
    : path.join(__dirname, `../app.asar/${trayIcnName}`);

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

  mainWindowState.manage(win);

  win.on('closed', async () => {
    if (store.has(StoreConstants.HideBordersByIcon)) {
      await revertWindowSettings();
    }

    store.delete(StoreConstants.Channel);

    win = null;
  });
}

ipcMain.on(IpcConstants.Close, async () => {
  if (store.has(StoreConstants.IsSettingsPage)) {
    store.delete(StoreConstants.IsSettingsPage);
  }

  const state = store.get(StoreConstants.SavedWindowState) as IWindowState;
  win?.setSize(state.sizeX, state.sizeY);
  win?.setPosition(state.posX, state.posY);

  if (process.platform !== 'darwin') {
    store.delete(StoreConstants.Channel);
    win?.close();
  }
});

ipcMain.on(IpcConstants.Relaunch, (_event, args) => {
  app.relaunch();

  store.delete(StoreConstants.IsSettingsPage);

  if (args) {
    win?.setSize(parseInt(args.winSize.width, 10), parseInt(args.winSize.height, 10));
    win?.setPosition(parseInt(args.winPos.x, 10), parseInt(args.winPos.y, 10));
  }
  win?.close();
});

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
    const state = store.get(StoreConstants.SavedWindowState) as IWindowState;

    win?.setSize(state.sizeX, state.sizeY);

    win?.setPosition(state.posX, state.posY);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (win === null) {
    await createWindow();
  }
});

app.on('ready', async () => {
  if (!store.has(StoreConstants.DataCleared)) {
    clearConfigData(store);
  }

  await createWindow();
});

process.on('uncaughtException', (error) => {
  logger.error(error);
});

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
