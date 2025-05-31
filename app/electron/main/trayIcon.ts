import { IpcEvent } from '#ipc/constants/events.js';
import type { AppStore } from '#ipc/types/store.js';
import { app, clipboard, ipcMain, Menu, shell, Tray } from 'electron';
import log from 'electron-log';
import type ElectronStore from 'electron-store';
import fs from 'node:fs';
import path from 'node:path';

export default class TrayIcon {
    private tray: Tray | null = null;

    constructor(private store: ElectronStore<AppStore>) {}

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
                    {
                        label: 'Clear logs',
                        type: 'normal',
                        click: () => {
                            try {
                                log.info('Clearing logs');
                                const filePath = log.transports.file.getFile().path;
                                const directory = path.dirname(filePath);
                                const files = fs.readdirSync(directory);

                                for (const file of files) {
                                    if (!file.endsWith('.log')) {
                                        continue;
                                    }

                                    log.info(`Deleting ${file}`);
                                    fs.unlinkSync(path.join(directory, file));
                                }
                            } catch (error) {
                                log.error('Failed to clear logs');
                                log.error(error);
                            }
                        },
                    },
                    {
                        label: 'Reset config',
                        type: 'normal',
                        click: () => {
                            log.info('Resetting config');
                            this.store.clear();
                        },
                    },
                    {
                        label: 'Copy System Debug Information',
                        type: 'normal',
                        click: () => {
                            log.info('Copying system debug information to clipboard');

                            const appVersion = app.getVersion();
                            const electronVersion = process.versions.electron;
                            const chromeVersion = process.versions.chrome;
                            const nodeVersion = process.versions.node;
                            const platform = process.platform;
                            const arch = process.arch;
                            const locale = app.getLocale();
                            const store = this.store.store;

                            log.info(
                                JSON.stringify(
                                    {
                                        appVersion,
                                        electronVersion,
                                        chromeVersion,
                                        nodeVersion,
                                        platform,
                                        arch,
                                        locale,
                                        store,
                                    },
                                    null,
                                    4,
                                ),
                            );

                            let clipboardText = `**App Version:** ${appVersion}\n\n`;
                            clipboardText += `**Electron Version:** ${electronVersion}\n\n`;
                            clipboardText += `**Chrome Version:** ${chromeVersion}\n\n`;
                            clipboardText += `**Node Version:** ${nodeVersion}\n\n`;
                            clipboardText += `**Platform:** ${platform}\n\n`;
                            clipboardText += `**Arch:** ${arch}\n\n`;
                            clipboardText += `**Locale:** ${locale}\n\n`;
                            clipboardText += '**Store:**\n\n';
                            clipboardText += `\`\`\`json\n${JSON.stringify(store, null, 4)}\n\`\`\``;
                            clipboard.writeText(clipboardText);
                        },
                    },
                ],
            },
            {
                label: 'Toggle Vanish',
                click: () => {
                    ipcMain.emit(IpcEvent.Vanish);
                },
            },
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
