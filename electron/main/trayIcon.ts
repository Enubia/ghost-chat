import { Tray, Menu, app, BrowserWindow, shell, ipcMain } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';

import { IpcEvent } from '../../shared/constants';
import { AppStore } from '../../shared/types';

export default class TrayIcon {
    private tray: Tray;

    constructor(
        private store: ElectronStore<AppStore>,
        private overlay: BrowserWindow,
    ) {}

    buildTray(trayIconPath: string) {
        this.tray = new Tray(trayIconPath);

        this.tray.setToolTip(`GhostChat v${app.getVersion()}`);

        const trayIconMenu = Menu.buildFromTemplate([
            {
                label: `GhostChat v${app.getVersion()}`,
                enabled: false,
            },
            {
                label: 'Miscellaneous',
                type: 'submenu',
                submenu: [
                    {
                        label: 'Open logs',
                        type: 'normal',
                        click: () => {
                            log.info('Opening logs folder');
                            shell.showItemInFolder(log.transports.file.getFile().path);
                        },
                    },
                    {
                        label: 'Open config',
                        type: 'normal',
                        click: () => {
                            log.info('Opening config folder');
                            shell.showItemInFolder(this.store.path);
                        },
                    },
                ],
            },
            {
                label: 'Toggle Vanish',
                type: 'normal',
                click: () => {
                    /* ###################### REFACTORED INTO IPC EVENT VANISH ##################################
                    ################### Commented out for reference, get rid of in the future
                    if (!this.store.get('settings').isOpen && this.store.get('savedWindowState').isTransparent) {
                        log.info('Disabling Vanish');
                        this.store.set<typeof StoreKeys.SavedWindowState>('savedWindowState', {
                            ...this.store.get('savedWindowState'),
                            isClickThrough: false,
                            isTransparent: false,
                        });

                        this.overlay.setIgnoreMouseEvents(false);
                        */
                    // this.overlay.webContents.send(IpcEvent.Vanish);
                    ipcMain.emit(IpcEvent.Vanish);
                    // } #######################################################################################
                },
            },
            // should not be needed anymore, the previous menu item should be enough
            // {
            //     label: 'Disable Click-Through',
            //     type: 'normal',
            //     click: () => {
            //         log.info('Disabling Click-Through');
            //         this.store.set('savedWindowState.isClickThrough', false);

            //         this.overlay.setIgnoreMouseEvents(false);
            //     },
            // },
            {
                label: 'Exit',
                click: () => {
                    log.info('App closing via tray menu');
                    app.quit();
                },
            },
        ]);

        this.tray.setContextMenu(trayIconMenu);
    }
}
