import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import type { Config } from '@bindings/ghost-chat/internal/config/models.js';

import type { Theme } from '@/types/theme';

import { Platform as PlatformValue } from '@bindings/ghost-chat/internal/chat/models.js';
import { useLayoutEffect } from 'react';

import { useAuthStore } from '@/stores/auth';
import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';

type Flags = Partial<Record<Platform, boolean>>;

export interface StageState {
    hotkey?: string;
    showTimestamps?: boolean;
    twitch?: Partial<Config['twitch']>;
    fadeOthers?: boolean;
    themeId?: string;
    customThemes?: Theme[];
    connected?: Flags;
    inputs?: Partial<Record<Platform, string>>;
    waiting?: Flags;
    auth?: 'loggedOut' | 'pending' | 'connected';
    hideFromTaskbar?: boolean;
    customUrl?: string;
}

function buildConfig(s: StageState): Config {
    return {
        version: '4',
        install_id: 'video',
        window_state: { x: 0, y: 0, width: 420, height: 640 },
        general: {
            language: 'en-US',
            show_timestamps: s.showTimestamps ?? false,
            show_waiting_message: true,
            hide_from_taskbar: s.hideFromTaskbar ?? false,
        },
        keybinds: { vanish: { keybind: s.hotkey ?? 'ctrl+shift+g' } },
        theme: { active_theme_id: s.themeId ?? 'default', custom_themes: s.customThemes ?? [] },
        twitch: {
            default_channel: 'nightowl_plays',
            connect_on_startup: true,
            fade: false,
            fade_timeout: 30,
            bots: false,
            hide_commands: false,
            hide_badges: false,
            hide_gifs: false,
            user_blacklist: [],
            events: { subscriptions: true, raids: true, announcements: true, redemptions: true, other: true },
            account: { login: 'nightowl_plays' },
            ...s.twitch,
        },
        youtube: {
            channel_id: '',
            connect_on_startup: false,
            video_url: '',
            fade: s.fadeOthers ?? false,
            fade_timeout: 6,
            user_blacklist: [],
        },
        kick: {
            default_channel: '',
            connect_on_startup: false,
            fade: s.fadeOthers ?? false,
            fade_timeout: 6,
            user_blacklist: [],
        },
        custom_source: { url: s.customUrl ?? '' },
    } as Config;
}

export function useStage(state: StageState) {
    const key = JSON.stringify(state);

    useLayoutEffect(() => {
        const s = JSON.parse(key) as StageState;

        useConfigStore.setState({ config: buildConfig(s), loaded: true, saved: false });
        useConnectionStore.setState({
            connected: s.connected ?? {},
            waiting: s.waiting ?? {},
            inputs: s.inputs ?? {},
            error: null,
        });
        useAuthStore.setState({
            status: s.auth ?? 'connected',
            login: s.auth === 'connected' || !s.auth ? 'nightowl_plays' : '',
            pending:
                s.auth === 'pending'
                    ? { userCode: 'GHST-4K2Q', verificationUri: 'https://www.twitch.tv/activate', expiresIn: 600 }
                    : null,
        });
    }, [key]);
}

export const ALL_CONNECTED: Flags = {
    [PlatformValue.PlatformTwitch]: true,
    [PlatformValue.PlatformYouTube]: true,
    [PlatformValue.PlatformKick]: true,
};
