import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

import { create } from 'zustand';

interface ConnectionState {
    connected: Record<Platform, boolean>;
    inputs: Record<Platform, string>;
    setConnected: (platform: Platform, value: boolean) => void;
    setInput: (platform: Platform, value: string) => void;
}

export const useConnectionStore = create<ConnectionState>(() => ({
    connected: { twitch: false, youtube: false, kick: false } as Record<Platform, boolean>,
    inputs: { twitch: '', youtube: '', kick: '' } as Record<Platform, string>,

    setConnected: (platform, value) =>
        useConnectionStore.setState((s) => ({
            connected: { ...s.connected, [platform]: value },
        })),

    setInput: (platform, value) =>
        useConnectionStore.setState((s) => ({
            inputs: { ...s.inputs, [platform]: value },
        })),
}));
