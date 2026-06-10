import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

import { create } from 'zustand';

type ConnectedMap = Partial<Record<Platform, boolean>>;
type InputMap = Partial<Record<Platform, string>>;

interface ConnectionState {
    connected: ConnectedMap;
    inputs: InputMap;
    setConnected: (platform: Platform, value: boolean) => void;
    setInput: (platform: Platform, value: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
    connected: {},
    inputs: {},

    setConnected: (platform, value) =>
        set((s) => ({
            connected: { ...s.connected, [platform]: value },
        })),

    setInput: (platform, value) =>
        set((s) => ({
            inputs: { ...s.inputs, [platform]: value },
        })),
}));
