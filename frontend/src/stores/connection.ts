import { create } from 'zustand';

type Platform = 'twitch' | 'youtube' | 'kick';

interface ConnectionState {
    twitch: boolean;
    youtube: boolean;
    kick: boolean;
    twitchChannel: string;
    youtubeInput: string;
    kickInput: string;
    setConnected: (platform: Platform, connected: boolean) => void;
    setChannel: (platform: Platform, value: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
    twitch: false,
    youtube: false,
    kick: false,
    twitchChannel: '',
    youtubeInput: '',
    kickInput: '',

    setConnected: (platform, connected) => set((s) => ({ ...s, [platform]: connected })),

    setChannel: (platform, value) => {
        if (platform === 'twitch') {
            set({ twitchChannel: value });
        } else if (platform === 'youtube') {
            set({ youtubeInput: value });
        } else {
            set({ kickInput: value });
        }
    },
}));
