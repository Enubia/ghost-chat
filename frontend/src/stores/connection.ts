import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import type { AutoConnectResult } from '@bindings/ghost-chat/models.js';

import { create } from 'zustand';

type PlatformFlags = Partial<Record<Platform, boolean>>;
type InputMap = Partial<Record<Platform, string>>;

interface ConnectionState {
    connected: PlatformFlags;
    waiting: PlatformFlags;
    inputs: InputMap;
    error: string | null;
    setConnected: (platform: Platform, value: boolean) => void;
    setWaiting: (platform: Platform, value: boolean) => void;
    setInput: (platform: Platform, value: string) => void;
    setError: (error: string | null) => void;
    applyAutoConnectResults: (
        results: AutoConnectResult[] | null | undefined,
        label: (platform: Platform) => string
    ) => boolean;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
    connected: {},
    waiting: {},
    inputs: {},
    error: null,

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

    setError: (error) => set({ error }),

    applyAutoConnectResults: (results, label) => {
        if (!results || results.length === 0) {
            return false;
        }

        const errors = results.filter((r) => r.error).map((r) => `${label(r.platform)}: ${r.error}`);

        set({ error: errors.length > 0 ? errors.join('\n') : null });

        return results.some((r) => !r.error);
    },
}));
