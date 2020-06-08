// electron stuff
import { app, protocol, BrowserWindow, Tray, Menu, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import windowStateKeeper from 'electron-window-state';
import contextMenu from 'electron-context-menu';
import ElectronStore from 'electron-store';
import * as path from 'path';

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
    transparent: true,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.setIgnoreMouseEvents(store.get('clickThrough') || false);
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
        click: () => {
          if (win) {
            win.resizable = false;
            win.webContents.send('settings', { windowSize: win?.getSize() });
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
            win.webContents.send('chat');
          }
        },
      },
      {
        label: 'Quit',
        role: 'quit',
      },
    ],
  });

  tray = new Tray(path.join(__dirname, '../public/trayicon.png'));
  const trayIconMenu = Menu.buildFromTemplate([
    {
      label: 'Click through',
      type: 'checkbox',
      checked: store.get('clickThrough') === true,
      click: () => {
        if (store.get('clickThrough') === true) {
          win?.setIgnoreMouseEvents(false);
          store.set('clickThrough', false);
        }
      },
    },
    {
      label: 'Quit Ghost Chat',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Ghost Chat');
  tray.setContextMenu(trayIconMenu);

  mainWindowState.manage(win);

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('close', () => {
  if (process.platform !== 'darwin') {
    win?.close();
  }
});

ipcMain.on('relaunch', () => {
  app.relaunch();
  win?.close();
});

ipcMain.on('reload', () => {
  if (win) {
    win.reload();
    win.resizable = true;
  }
});

ipcMain.on('resize', (_event, args) => {
  if (win) {
    if (args.resizeAble) {
      win.resizable = true;
    }
    win.setSize(args.width, args.height);
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
  await createWindow();
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
