import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { create } from 'zustand';

type ConnectedMap = Record<Platform, boolean>;
type InputMap = Record<Platform, string>;

interface ConnectionState {
    connected: ConnectedMap;
    inputs: InputMap;
    setConnected: (platform: Platform, value: boolean) => void;
    setInput: (platform: Platform, value: string) => void;
}

const initialConnected: ConnectedMap = {
    [Platform.$zero]: false,
    [Platform.PlatformTwitch]: false,
    [Platform.PlatformYouTube]: false,
    [Platform.PlatformKick]: false,
};

const initialInputs: InputMap = {
    [Platform.$zero]: '',
    [Platform.PlatformTwitch]: '',
    [Platform.PlatformYouTube]: '',
    [Platform.PlatformKick]: '',
};

export const useConnectionStore = create<ConnectionState>(() => ({
    connected: initialConnected,
    inputs: initialInputs,

    setConnected: (platform, value) =>
        useConnectionStore.setState((s) => ({
            connected: { ...s.connected, [platform]: value },
        })),

    setInput: (platform, value) =>
        useConnectionStore.setState((s) => ({
            inputs: { ...s.inputs, [platform]: value },
        })),
}));
