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
    Youtube,
} from '#ipc/types/store';

import { IpcEvent } from '#ipc/constants/events';
import { ipcRenderer } from 'electron';
import { cloneValue } from './utils/cloneValue';

/**
 * Only parent keys can be deleted
 */
export function deleteKeyValue(key: keyof AppStore): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'delete',
        key,
    });
}

export function getExternalOptions(): Promise<ExternalBrowserSource> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'options.external',
    });
}

export function getGeneral(): Promise<General> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'general',
    });
}

export function getKeybinds(): Promise<Keybinds> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'keybinds',
    });
}

export function getKickOptions(): Promise<Kick> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'options.kick',
    });
}

export function getOptions(): Promise<Options> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'options',
    });
}

export function getPlatform(): Promise<NodeJS.Platform> {
    return ipcRenderer.invoke(IpcEvent.GetPlatform);
}

export function getSettings(): Promise<Settings> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'settings',
    });
}

export function getTwitchOptions(): Promise<Twitch> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'options.twitch',
    });
}

export function getUpdater(): Promise<Updater> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'updater',
    });
}

export function getValueFromKey<K extends StorePath>(key: K): Promise<StorePathValue<AppStore, K>> {
    return ipcRenderer.invoke(IpcEvent.CallStore, { action: 'get', key });
}

export function getWindowState(): Promise<WindowState> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'savedWindowState',
    });
}

export function getYoutubeOptions(): Promise<Youtube> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'get',
        key: 'options.youtube',
    });
}

// ------------------------------------

export function setGeneral(value: General): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key: 'general',
        value: cloneValue(value),
    });
}

export function setKeybinds(value: Keybinds): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key: 'keybinds',
        value: cloneValue(value),
    });
}

// values need to be cloned, otherwise their clone algorithm will throw an error for some reason
export function setKeyValue<K extends StorePath>(key: K, value: StorePathValue<AppStore, K>): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key,
        value: cloneValue(value),
    });
}

export function setOptions(value: Options): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key: 'options',
        value: cloneValue(value),
    });
}

export function setSettings(value: Settings): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key: 'settings',
        value: cloneValue(value),
    });
}

export function setUpdater(value: Updater): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key: 'updater',
        value: cloneValue(value),
    });
}

export function setWindowState(value: WindowState): Promise<void> {
    return ipcRenderer.invoke(IpcEvent.CallStore, {
        action: 'set',
        key: 'savedWindowState',
        value: cloneValue(value),
    });
}
