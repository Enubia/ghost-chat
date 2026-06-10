import type { Config } from '@bindings/ghost-chat/internal/config/models.js';

import type { ChatMessage } from '@/types/chat';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

const KNOWN_BOTS = new Set([
    'nightbot',
    'streamelements',
    'streamlabs',
    'moobot',
    'fossabot',
    'wizebot',
    'coebot',
    'deepbot',
    'phantombot',
    'stay_hydrated_bot',
    'soundalerts',
    'botrix',
    'sery_bot',
]);

const SUB_EVENTS = new Set([
    'sub',
    'resub',
    'subgift',
    'submysterygift',
    'giftpaidupgrade',
    'anongiftpaidupgrade',
    'primepaidupgrade',
    'standardpayforward',
    'communitypayforward',
]);

const RAID_EVENTS = new Set(['raid', 'unraid']);
const ANNOUNCEMENT_EVENTS = new Set(['announcement']);

export function classifyEvent(eventType: string): 'sub' | 'raid' | 'announcement' | 'other' {
    if (SUB_EVENTS.has(eventType)) {
        return 'sub';
    }

    if (RAID_EVENTS.has(eventType)) {
        return 'raid';
    }

    if (ANNOUNCEMENT_EVENTS.has(eventType)) {
        return 'announcement';
    }

    return 'other';
}

export function fadePolicy(
    platform: Platform,
    config: Config | null | undefined
): { fade: boolean; timeoutSeconds: number } {
    if (platform === Platform.PlatformYouTube) {
        return {
            fade: config?.youtube?.fade ?? false,
            timeoutSeconds: config?.youtube?.fade_timeout || 30,
        };
    }

    if (platform === Platform.PlatformKick) {
        return {
            fade: config?.kick?.fade ?? false,
            timeoutSeconds: config?.kick?.fade_timeout || 30,
        };
    }

    return {
        fade: config?.twitch?.fade ?? false,
        timeoutSeconds: config?.twitch?.fade_timeout || 30,
    };
}

export function shouldDisplay(msg: ChatMessage, config: Config | null | undefined): boolean {
    const lowerUsername = msg.username.toLowerCase();

    if (msg.platform === Platform.PlatformTwitch) {
        const blacklist = config?.twitch?.user_blacklist ?? [];
        const hideCommands = config?.twitch?.hide_commands ?? false;
        const showBots = config?.twitch?.bots ?? false;
        const events = config?.twitch?.events ?? {};

        if (blacklist.some((u) => u.toLowerCase() === lowerUsername)) {
            return false;
        }

        if (hideCommands && msg.text.startsWith('!')) {
            return false;
        }

        if (!showBots && KNOWN_BOTS.has(lowerUsername)) {
            return false;
        }

        if (msg.eventType && !isEventAllowed(msg.eventType, events)) {
            return false;
        }

        return true;
    }

    if (msg.platform === Platform.PlatformYouTube) {
        const blacklist = config?.youtube?.user_blacklist ?? [];

        return !blacklist.some((u) => u.toLowerCase() === lowerUsername);
    }

    if (msg.platform === Platform.PlatformKick) {
        const blacklist = config?.kick?.user_blacklist ?? [];

        return !blacklist.some((u) => u.toLowerCase() === lowerUsername);
    }

    return true;
}

function isEventAllowed(
    eventType: string,
    events: { subscriptions?: boolean; raids?: boolean; announcements?: boolean; other?: boolean }
): boolean {
    const category = classifyEvent(eventType);

    if (category === 'sub') {
        return events.subscriptions !== false;
    }

    if (category === 'raid') {
        return events.raids !== false;
    }

    if (category === 'announcement') {
        return events.announcements !== false;
    }

    return events.other !== false;
}
