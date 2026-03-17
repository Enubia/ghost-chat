import { create } from 'zustand';

interface ConnectionState {
    twitch: boolean;
    youtube: boolean;
    twitchChannel: string;
    youtubeInput: string;
    setConnected: (platform: 'twitch' | 'youtube', connected: boolean) => void;
    setChannel: (platform: 'twitch' | 'youtube', value: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
    twitch: false,
    youtube: false,
    twitchChannel: '',
    youtubeInput: '',

    setConnected: (platform, connected) => set((s) => ({ ...s, [platform]: connected })),

    setChannel: (platform, value) => set(platform === 'twitch' ? { twitchChannel: value } : { youtubeInput: value }),
}));
