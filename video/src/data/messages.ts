import type { Badge, ChatMessage, MessageFragment } from '@/types/chat';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

const emote = (id: string) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`;
const badge = (id: string) => `https://static-cdn.jtvnw.net/badges/v1/${id}/2`;

export const EMOTES = {
    Kappa: emote('25'),
    LUL: emote('425618'),
    PogChamp: emote('305954156'),
    HeyGuys: emote('30259'),
    SeemsGood: emote('64138'),
};

const BADGES: Record<string, Badge> = {
    mod: { name: 'moderator', version: '1', url: badge('3267646d-33f0-4b17-b3df-f923a41db1d0') },
    sub: { name: 'subscriber', version: '0', url: badge('5d9f2208-5dd8-11e7-8513-2ff4adfae661') },
    vip: { name: 'vip', version: '1', url: badge('b817aba4-fad8-49e2-b88a-7cc744dfa6ec') },
    prime: { name: 'premium', version: '1', url: badge('bbbe0db0-a598-423e-86d0-f9fb98ca1933') },
};

export const REMOTE_IMAGES = [...Object.values(EMOTES), ...Object.values(BADGES).map((b) => b.url)];

function avatar(name: string, color: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${color}"/><text x="32" y="42" font-family="sans-serif" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${name[0].toUpperCase()}</text></svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function fragments(text: string): MessageFragment[] {
    return text
        .split(/(\s+)/)
        .filter(Boolean)
        .map((word) =>
            word in EMOTES
                ? { type: 'emote', text: word, url: EMOTES[word as keyof typeof EMOTES] }
                : { type: 'text', text: word, url: '' }
        );
}

let seq = 0;

function base(platform: Platform, username: string, color: string, text: string): ChatMessage {
    seq += 1;

    return {
        id: `m${seq}`,
        platform,
        username,
        color,
        text,
        badges: [],
        fragments: fragments(text),
        timestamp: '',
        isAction: false,
        tags: {},
        avatar: '',
        superChat: null,
        membershipEvent: false,
    };
}

const twitch = (user: string, color: string, text: string, badges: (keyof typeof BADGES)[] = []) => ({
    ...base(Platform.PlatformTwitch, user, color, text),
    badges: badges.map((b) => BADGES[b]),
});

const youtube = (user: string, color: string, text: string) => ({
    ...base(Platform.PlatformYouTube, user, '', text),
    avatar: avatar(user.replace('@', ''), color),
});

const kick = (user: string, color: string, text: string) => base(Platform.PlatformKick, user, color, text);

export interface ScriptedMessage {
    at: number;
    message: ChatMessage;
}

export const CHAT_SCRIPT: ScriptedMessage[] = [
    { at: 0, message: twitch('pixelpaladin', '#ff7f50', 'gg that boss fight was insane PogChamp', ['sub']) },
    { at: 14, message: youtube('@MiraPlays', '#e65100', 'hello from youtube!') },
    { at: 26, message: kick('dunecrawler', '#53fc18', 'kick chat checking in') },
    { at: 40, message: twitch('secretseeker', '#1e90ff', 'did you find the secret room yet? Kappa') },
    { at: 54, message: twitch('mod_lumen', '#00c853', 'remember to stay hydrated SeemsGood', ['mod', 'sub']) },
    {
        at: 70,
        message: {
            ...youtube('@SkyeWanders', '#1565c0', 'Love the stream, keep it up!'),
            superChat: { amount: '$5.00', headerColor: '#1565c0', bodyColor: '#1e88e5' },
        },
    },
    { at: 88, message: kick('ravenfeather', '#f06292', 'that jump LUL') },
    {
        at: 102,
        message: {
            ...base(Platform.PlatformTwitch, 'cozyfox', '', ''),
            eventType: 'resub',
            systemMessage: "cozyfox subscribed at Tier 1. They've subscribed for 12 months!",
            text: 'a whole year of night owl streams HeyGuys',
            fragments: fragments('a whole year of night owl streams HeyGuys'),
        },
    },
    { at: 120, message: twitch('glitchwizard', '#b388ff', 'chat is so clean in this overlay', ['vip']) },
    { at: 134, message: youtube('@TomRuns', '#2e7d32', 'first time catching you live') },
    {
        at: 150,
        message: {
            ...base(Platform.PlatformTwitch, 'pixelpaladin', '', ''),
            eventType: 'channel_points_redemption',
            eventData: { reward: 'Hydrate!', cost: '500' },
        },
    },
    { at: 166, message: kick('dunecrawler', '#53fc18', 'left side has the loot') },
    { at: 180, message: twitch('lowkey_lena', '#ff4081', 'LUL LUL LUL', ['prime']) },
    { at: 196, message: twitch('mod_lumen', '#00c853', 'next run starts in 2 min', ['mod', 'sub']) },
    { at: 212, message: youtube('@MiraPlays', '#e65100', 'can you show the settings?') },
    { at: 228, message: twitch('bytebandit', '#ffd600', 'Ghost Chat W PogChamp', ['sub']) },
    { at: 244, message: kick('ravenfeather', '#f06292', 'GG') },
    { at: 260, message: twitch('pixelpaladin', '#ff7f50', 'this run is clean', ['sub']) },
    { at: 276, message: youtube('@SkyeWanders', '#1565c0', 'the overlay looks so good') },
    { at: 292, message: twitch('glitchwizard', '#b388ff', 'boss phase 2 incoming', ['vip']) },
    { at: 308, message: kick('dunecrawler', '#53fc18', 'dodge left dodge left') },
    { at: 324, message: twitch('lowkey_lena', '#ff4081', 'chat is going crazy', ['prime']) },
];

export function scriptLoop(offset: number): ScriptedMessage[] {
    const span = 340;

    return [0, 1, 2, 3, 4, 5, 6, 7].flatMap((round) =>
        CHAT_SCRIPT.map(({ at, message }) => ({
            at: at + round * span - offset,
            message: {
                ...message,
                id: `${message.id}-${round}`,
                timestamp: new Date(2026, 10, 19, 21, 4, Math.floor((at + round * span) / 6)).toISOString(),
            },
        }))
    );
}
