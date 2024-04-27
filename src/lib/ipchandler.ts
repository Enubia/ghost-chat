import { ipcRenderer } from 'electron';

import type { AppStore, General, Keybinds, Options, Settings, StorePath, Updater, WindowState } from '@shared/types';

import { IpcEvent } from '@shared/constants';

export default class IpcHandler {
    // ---------------------- getters ----------------------
    public static async getValueFromKey(key: StorePath): Promise<any> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key });
    }

    public static async getOptions(): Promise<Options> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'options' });
    }

    public static async getWindowState(): Promise<WindowState> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'savedWindowState' });
    }

    public static async getSettings(): Promise<Settings> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'settings' });
    }

    public static async getGeneral(): Promise<General> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'general' });
    }

    public static async getUpdater(): Promise<Updater> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'updater' });
    }

    public static async getKeybinds(): Promise<Keybinds> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'keybinds' });
    }

    // ---------------------- setters ----------------------

    public static async setValueFromKey(key: StorePath, value: string | number | Record<string, unknown>): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key, value });
    }

    public static async setOptions(value: Options): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'options', value });
    }

    public static async setWindowState(value: WindowState): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'savedWindowState', value });
    }

    public static async setSettings(value: Settings): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'settings', value });
    }

    public static async setGeneral(value: General): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'general', value });
    }

    public static async setUpdater(value: Updater): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key:
            'updater', value });
    }

    public static async setKeybinds(value: Keybinds): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'keybinds', value });
    }

    // only parent keys can be deleted
    public static async deleteValueFromKey(key: keyof AppStore): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'delete', key });
    }
}
