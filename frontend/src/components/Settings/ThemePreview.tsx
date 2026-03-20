import type React from 'react';

import type { ChatMessage as ChatMessageType } from '@/types/chat';
import type { Theme } from '@/types/theme';

import { ChatMessage } from '@/components/Chat/ChatMessage';
import { EventMessage } from '@/components/Chat/EventMessage';
import { useConfigStore } from '@/stores/config';
import { getThemeById, themeToCSS } from '@/types/theme';

import styles from './ThemePreview.module.css';

const SAMPLE_MESSAGES: ChatMessageType[] = [
    {
        id: 'p1',
        platform: 'twitch',
        username: 'NightOwl',
        color: '#9146ff',
        text: 'Hello chat! Kappa How is everyone?',
        badges: [
            {
                name: 'moderator',
                version: '1',
                url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            },
            {
                name: 'subscriber',
                version: '6',
                url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
            },
        ],
        emotes: [
            { id: '25', start: 12, end: 16, url: 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0' },
        ],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p2',
        platform: 'youtube',
        username: 'StreamViewer',
        color: '',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: 'https://i.pravatar.cc/64?u=preview',
        fragments: [{ type: 'text', text: 'Hello from YouTube! Great stream today.', url: '' }],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p3',
        platform: 'twitch',
        username: 'ChatFan',
        color: '#e06f6f',
        text: 'is excited for the stream',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: true,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p4',
        platform: 'kick',
        username: 'KickUser99',
        color: '#53fc18',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [
            { type: 'text', text: 'Kick chat checking in! ', url: '' },
            { type: 'emote', text: 'KEKW', url: 'https://files.kick.com/emotes/37226/fullsize' },
        ],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p5',
        platform: 'twitch',
        username: 'Subscriber42',
        color: '#00b8d4',
        text: 'Love the new overlay PogChamp look LUL',
        badges: [
            {
                name: 'subscriber',
                version: '12',
                url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
            },
        ],
        emotes: [
            {
                id: '305954156',
                start: 23,
                end: 31,
                url: 'https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/1.0',
            },
            {
                id: '425618',
                start: 38,
                end: 40,
                url: 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/1.0',
            },
        ],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'e1',
        platform: 'twitch',
        username: 'Subscriber42',
        color: '#00b8d4',
        text: 'Love being part of this community!',
        badges: [
            {
                name: 'subscriber',
                version: '12',
                url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
            },
        ],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
        eventType: 'resub',
        systemMessage: 'Subscriber42 has subscribed for 12 months!',
        eventData: { months: '12', plan: '1000' },
    },
    {
        id: 'p6',
        platform: 'youtube',
        username: 'MemberPro',
        color: '',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: 'https://i.pravatar.cc/64?u=member',
        fragments: [{ type: 'text', text: 'Another message to see the theme in action', url: '' }],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p7',
        platform: 'twitch',
        username: 'ModeratorMax',
        color: '#00ff7f',
        text: 'Remember to follow the chat rules everyone!',
        badges: [
            {
                name: 'moderator',
                version: '1',
                url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            },
        ],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p8',
        platform: 'kick',
        username: 'GreenGamer',
        color: '#ff6b35',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [{ type: 'text', text: 'This stream is so chill, love the vibes', url: '' }],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p9',
        platform: 'twitch',
        username: 'LurkerLisa',
        color: '#ff69b4',
        text: 'finally decided to say something in chat',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: true,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'e2',
        platform: 'twitch',
        username: 'GenerousGifter',
        color: '#ff8c00',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
        eventType: 'subgift',
        systemMessage: 'GenerousGifter gifted a Tier 1 sub to LuckyViewer!',
        eventData: { months: '1', plan: '1000', recipient: 'LuckyViewer' },
    },
    {
        id: 'e3',
        platform: 'twitch',
        username: 'CoolStreamer',
        color: '#ff69b4',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
        eventType: 'raid',
        systemMessage: '150 raiders from CoolStreamer have joined!',
        eventData: { viewers: '150', raider: 'CoolStreamer' },
    },
    {
        id: 'e4',
        platform: 'twitch',
        username: 'ModeratorMax',
        color: '#00ff7f',
        text: 'Stream schedule has been updated for next week!',
        badges: [
            {
                name: 'moderator',
                version: '1',
                url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            },
        ],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
        eventType: 'announcement',
        systemMessage: 'Announcement',
        eventData: {},
    },
    {
        id: 'p10',
        platform: 'youtube',
        username: 'TechWatcher',
        color: '',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: 'https://i.pravatar.cc/64?u=tech',
        fragments: [{ type: 'text', text: 'What resolution is the stream at?', url: '' }],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p11',
        platform: 'twitch',
        username: 'EmoteKing',
        color: '#daa520',
        text: 'LOL HeyGuys that was hilarious',
        badges: [
            {
                name: 'subscriber',
                version: '24',
                url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
            },
        ],
        emotes: [
            { id: '30259', start: 4, end: 11, url: 'https://static-cdn.jtvnw.net/emoticons/v2/30259/default/dark/1.0' },
        ],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
    },
    {
        id: 'p12',
        platform: 'kick',
        username: 'FirstTimer',
        color: '#87ceeb',
        text: '',
        badges: [],
        emotes: [],
        timestamp: new Date().toISOString(),
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [{ type: 'text', text: 'First time watching, this is awesome!', url: '' }],
        superChat: null,
        membershipEvent: false,
        eventType: '',
        systemMessage: '',
        eventData: {},
    },
];

export function ThemePreview() {
    const config = useConfigStore((s) => s.config);
    const activeId = config?.theme?.active_theme_id ?? 'default';
    const customThemes = (config?.theme?.custom_themes as Theme[]) ?? [];
    const theme = getThemeById(activeId, customThemes);
    const cssVars = themeToCSS(theme);

    return (
        <div className={styles.container}>
            <div className={styles.label}>Preview</div>
            <div
                className={styles.messages}
                style={cssVars as React.CSSProperties}
            >
                {SAMPLE_MESSAGES.map((msg) =>
                    msg.eventType ? (
                        <EventMessage
                            key={msg.id}
                            message={msg}
                        />
                    ) : (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            showColon={theme.show_colon}
                            showAvatars={theme.show_avatars}
                            showPlatformIcon
                            showTimestamp={false}
                        />
                    )
                )}
            </div>
        </div>
    );
}
