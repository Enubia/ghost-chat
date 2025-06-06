import { useIpcRenderer } from '@vueuse/electron';

import { IpcEvent } from '#ipc/constants/events';
import type { AppStore, StorePath, StorePathValue } from '#ipc/types/store';
import * as IpcHandler from '#lib/ipchandler';

export async function save<K extends StorePath>(key: K, value: StorePathValue<AppStore, K>) {
    await IpcHandler.setKeyValue(key, value);
    useIpcRenderer().send(IpcEvent.Rerender, 'parent');
}
