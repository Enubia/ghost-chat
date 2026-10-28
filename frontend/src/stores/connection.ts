import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

import { create } from 'zustand';

type PlatformFlags = Partial<Record<Platform, boolean>>;
type InputMap = Partial<Record<Platform, string>>;

interface ConnectionState {
    connected: PlatformFlags;
    waiting: PlatformFlags;
    inputs: InputMap;
    setConnected: (platform: Platform, value: boolean) => void;
    setWaiting: (platform: Platform, value: boolean) => void;
    setInput: (platform: Platform, value: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
    connected: {},
    waiting: {},
    inputs: {},

    setConnected: (platform, value) =>
        set((s) => ({
            connected: { ...s.connected, [platform]: value },
            waiting: { ...s.waiting, [platform]: false },
        })),

    setWaiting: (platform, value) =>
        set((s) => ({
            waiting: { ...s.waiting, [platform]: value },
            connected: value ? { ...s.connected, [platform]: false } : s.connected,
        })),

    setInput: (platform, value) =>
        set((s) => ({
            inputs: { ...s.inputs, [platform]: value },
        })),
}));
