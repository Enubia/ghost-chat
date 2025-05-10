import type {
    AppStore,
    ExternalBrowserSource,
    General,
    Keybinds,
    Kick,
    Options,
    Settings,
    StorePath,
    StorePathValue,
    Twitch,
    Updater,
    WindowState,
} from '#ipc/types/store';

import { ipcRenderer } from 'electron';

import { IpcEvent } from '#ipc/constants/events';

import { cloneValue } from './utils/clonevalue';

export default class IpcHandler {
    // only parent keys can be deleted
    public static deleteKeyValue(key: keyof AppStore): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'delete', key });
    }

    public static getExternalOptions(): Promise<ExternalBrowserSource> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'options.external' });
    }

    public static getGeneral(): Promise<General> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'general' });
    }

    public static getKeybinds(): Promise<Keybinds> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'keybinds' });
    }

    public static getKickOptions(): Promise<Kick> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'options.kick' });
    }

    public static getOptions(): Promise<Options> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'options' });
    }

    public static getPlatform(): Promise<NodeJS.Platform> {
        return ipcRenderer.invoke(IpcEvent.GetPlatform);
    }

    public static getSettings(): Promise<Settings> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'settings' });
    }

    public static getTwitchOptions(): Promise<Twitch> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'options.twitch' });
    }

    public static getUpdater(): Promise<Updater> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'updater' });
    }

    public static getValueFromKey<K extends StorePath>(key: K): Promise<StorePathValue<AppStore, K>> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key });
    }

    public static getWindowState(): Promise<WindowState> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key: 'savedWindowState' });
    }

    public static setGeneral(value: General): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'general', value: cloneValue(value) });
    }

    public static setKeybinds(value: Keybinds): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'keybinds', value: cloneValue(value) });
    }

    // values need to be cloned, otherwise their clone algorithm will throw an error for some reason
    public static setKeyValue<K extends StorePath>(key: K, value: StorePathValue<AppStore, K>): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key, value: cloneValue(value) });
    }

    public static setOptions(value: Options): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'options', value: cloneValue(value) });
    }

    public static setSettings(value: Settings): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'settings', value: cloneValue(value) });
    }

    public static setUpdater(value: Updater): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key:
            'updater', value: cloneValue(value) });
    }

    public static setWindowState(value: WindowState): Promise<void> {
        return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'set', key: 'savedWindowState', value: cloneValue(value) });
    }
}
