import { ipcRenderer } from 'electron';

import type { AppStore, General, Keybinds, Options, Settings, StorePath, StorePathValue, Updater, WindowState } from '@shared/types';

import { IpcEvent } from '@shared/constants';

import { cloneValue } from './utils';

export default class IpcHandler {
    // ---------------------- getters ----------------------
    public static async getValueFromKey<K extends StorePath>(key: K): Promise<StorePathValue<AppStore, K>> {
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

    // values need to be cloned, otherwise their clone algorithm will throw an error for some reason
    public static async setValueFromKey<K extends StorePath>(key: K, value: StorePathValue<AppStore, K>): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key, value: cloneValue(value) });
    }

    public static async setOptions(value: Options): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'options', value: cloneValue(value) });
    }

    public static async setWindowState(value: WindowState): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'savedWindowState', value: cloneValue(value) });
    }

    public static async setSettings(value: Settings): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'settings', value: cloneValue(value) });
    }

    public static async setGeneral(value: General): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'general', value: cloneValue(value) });
    }

    public static async setUpdater(value: Updater): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key:
            'updater', value: cloneValue(value) });
    }

    public static async setKeybinds(value: Keybinds): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'keybinds', value: cloneValue(value) });
    }

    // only parent keys can be deleted
    public static async deleteValueFromKey(key: keyof AppStore): Promise<void> {
        return await ipcRenderer.invoke(IpcEvent.CallStore, { action: 'delete', key });
    }
}
