import fs from 'node:fs';
import path from 'node:path';

import { app, globalShortcut } from 'electron';
import log from 'electron-log';

export function cleanLogs() {
    try {
        log.info('Checking for logfile cleanup');

        const filePath = log.transports.file.getFile().path;
        const directory = path.dirname(filePath);
        const files = fs.readdirSync(directory);

        for (const file of files) {
            if (!file.endsWith('.log')) {
                continue;
            }

            const [_, day, month, year] = file.split('-');
            const fileDate = new Date(`${year}-${month}-${day}`);
            const date = new Date();
            const diff = date.getTime() - fileDate.getTime();

            // 1 week
            const week = 604800000;

            if (diff < week) {
                continue;
            }

            log.info(`Deleting logfile: ${file}`);
            fs.unlinkSync(path.join(directory, file));
        }
    } catch (error) {
        log.error('Failed to clear logs');
        log.error(error);
    }
}

export function quit() {
    log.info('Deregistering all keybinds');
    globalShortcut.unregisterAll();

    log.info('App closing');
    app.quit();
}
