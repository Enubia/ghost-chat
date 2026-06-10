import type { Config } from '@bindings/ghost-chat/internal/config/models.js';

import type { ChatMessage } from '@/types/chat';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { describe, expect, it } from 'vitest';

import { classifyEvent, fadePolicy, shouldDisplay } from './messageFilter';

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return {
        id: 'test-id',
        platform: Platform.PlatformTwitch,
        username: 'testuser',
        color: '',
        text: 'hello',
        badges: [],
        emotes: [],
        timestamp: '',
        isAction: false,
        tags: {},
        avatar: '',
        fragments: [],
        superChat: null,
        membershipEvent: false,
        ...overrides,
    };
}

function makeTwitchConfig(overrides: Partial<Config['twitch']> = {}): Config {
    return {
        twitch: {
            default_channel: '',
            fade: false,
            fade_timeout: 0,
            bots: false,
            hide_commands: false,
            hide_badges: false,
            user_blacklist: [],
            events: {
                subscriptions: true,
                raids: true,
                announcements: true,
                other: true,
            },
            ...overrides,
        },
    } as Config;
}

describe('shouldDisplay', () => {
    describe('blacklist', () => {
        it('allows messages not on the blacklist', () => {
            const config = makeTwitchConfig({ user_blacklist: ['blockeduser'] });
            expect(shouldDisplay(makeMsg({ username: 'normaluser' }), config)).toBe(true);
        });

        it('blocks exact match on blacklist', () => {
            const config = makeTwitchConfig({ user_blacklist: ['blockeduser'] });
            expect(shouldDisplay(makeMsg({ username: 'blockeduser' }), config)).toBe(false);
        });

        it('blocks blacklist match case-insensitively', () => {
            const config = makeTwitchConfig({ user_blacklist: ['BlockedUser'] });
            expect(shouldDisplay(makeMsg({ username: 'blockeduser' }), config)).toBe(false);
        });

        it('blocks when username has different casing than blacklist entry', () => {
            const config = makeTwitchConfig({ user_blacklist: ['blockeduser'] });
            expect(shouldDisplay(makeMsg({ username: 'BLOCKEDUSER' }), config)).toBe(false);
        });

        it('blocks YouTube messages from blacklisted users', () => {
            const config = {
                youtube: { user_blacklist: ['spammer'], channel_id: '', video_url: '', fade: false, fade_timeout: 0 },
            } as Config;

            expect(shouldDisplay(makeMsg({ platform: Platform.PlatformYouTube, username: 'spammer' }), config)).toBe(
                false
            );
        });

        it('blocks YouTube blacklist case-insensitively', () => {
            const config = {
                youtube: { user_blacklist: ['Spammer'], channel_id: '', video_url: '', fade: false, fade_timeout: 0 },
            } as Config;

            expect(shouldDisplay(makeMsg({ platform: Platform.PlatformYouTube, username: 'spammer' }), config)).toBe(
                false
            );
        });

        it('blocks Kick messages from blacklisted users', () => {
            const config = {
                kick: { user_blacklist: ['troll'], default_channel: '', fade: false, fade_timeout: 0 },
            } as Config;

            expect(shouldDisplay(makeMsg({ platform: Platform.PlatformKick, username: 'troll' }), config)).toBe(false);
        });
    });

    describe('command hiding', () => {
        it('allows commands when hide_commands is false', () => {
            const config = makeTwitchConfig({ hide_commands: false });
            expect(shouldDisplay(makeMsg({ text: '!command' }), config)).toBe(true);
        });

        it('blocks commands when hide_commands is true', () => {
            const config = makeTwitchConfig({ hide_commands: true });
            expect(shouldDisplay(makeMsg({ text: '!command' }), config)).toBe(false);
        });

        it('allows non-command messages when hide_commands is true', () => {
            const config = makeTwitchConfig({ hide_commands: true });
            expect(shouldDisplay(makeMsg({ text: 'hello world' }), config)).toBe(true);
        });
    });

    describe('bot visibility', () => {
        it('hides known bot when bots setting is false', () => {
            const config = makeTwitchConfig({ bots: false });
            expect(shouldDisplay(makeMsg({ username: 'nightbot' }), config)).toBe(false);
        });

        it('shows known bot when bots setting is true', () => {
            const config = makeTwitchConfig({ bots: true });
            expect(shouldDisplay(makeMsg({ username: 'nightbot' }), config)).toBe(true);
        });

        it('hides known bot case-insensitively', () => {
            const config = makeTwitchConfig({ bots: false });
            expect(shouldDisplay(makeMsg({ username: 'NightBot' }), config)).toBe(false);
        });

        it('allows unknown users when bots is false', () => {
            const config = makeTwitchConfig({ bots: false });
            expect(shouldDisplay(makeMsg({ username: 'regularuser' }), config)).toBe(true);
        });
    });

    describe('event gating', () => {
        it('allows sub event when subscriptions is enabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: true, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'sub' }), config)).toBe(true);
        });

        it('blocks sub event when subscriptions is disabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: false, raids: true, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'sub' }), config)).toBe(false);
        });

        it('blocks resub event when subscriptions is disabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: false, raids: true, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'resub' }), config)).toBe(false);
        });

        it('allows raid event when raids is enabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: true, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'raid' }), config)).toBe(true);
        });

        it('blocks raid event when raids is disabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: false, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'raid' }), config)).toBe(false);
        });

        it('allows announcement event when announcements is enabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: true, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'announcement' }), config)).toBe(true);
        });

        it('blocks announcement event when announcements is disabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: true, announcements: false, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'announcement' }), config)).toBe(false);
        });

        it('allows unknown event type when other is enabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: true, announcements: true, other: true },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'somefutureevent' }), config)).toBe(true);
        });

        it('blocks unknown event type when other is disabled', () => {
            const config = makeTwitchConfig({
                events: { subscriptions: true, raids: true, announcements: true, other: false },
            });
            expect(shouldDisplay(makeMsg({ eventType: 'somefutureevent' }), config)).toBe(false);
        });

        it('treats missing events config as allowed (default true)', () => {
            const config = makeTwitchConfig({ events: {} as Config['twitch']['events'] });
            expect(shouldDisplay(makeMsg({ eventType: 'sub' }), config)).toBe(true);
        });
    });
});

describe('fadePolicy', () => {
    it('returns no fade and 30 seconds when config is null', () => {
        expect(fadePolicy(Platform.PlatformTwitch, null)).toEqual({ fade: false, timeoutSeconds: 30 });
    });

    it('returns no fade and 30 seconds when config is undefined', () => {
        expect(fadePolicy(Platform.PlatformTwitch, undefined)).toEqual({ fade: false, timeoutSeconds: 30 });
    });

    it('returns configured twitch fade settings', () => {
        const config = makeTwitchConfig({ fade: true, fade_timeout: 15 });
        expect(fadePolicy(Platform.PlatformTwitch, config)).toEqual({ fade: true, timeoutSeconds: 15 });
    });

    it('returns 30 seconds default when twitch fade_timeout is 0', () => {
        const config = makeTwitchConfig({ fade: true, fade_timeout: 0 });
        expect(fadePolicy(Platform.PlatformTwitch, config)).toEqual({ fade: true, timeoutSeconds: 30 });
    });

    it('returns configured youtube fade settings', () => {
        const config = {
            youtube: { fade: true, fade_timeout: 20, channel_id: '', video_url: '', user_blacklist: [] },
        } as unknown as Config;

        expect(fadePolicy(Platform.PlatformYouTube, config)).toEqual({ fade: true, timeoutSeconds: 20 });
    });

    it('returns 30 seconds default when youtube fade_timeout is 0', () => {
        const config = {
            youtube: { fade: false, fade_timeout: 0, channel_id: '', video_url: '', user_blacklist: [] },
        } as unknown as Config;

        expect(fadePolicy(Platform.PlatformYouTube, config)).toEqual({ fade: false, timeoutSeconds: 30 });
    });

    it('returns configured kick fade settings', () => {
        const config = {
            kick: { fade: true, fade_timeout: 45, default_channel: '', user_blacklist: [] },
        } as unknown as Config;

        expect(fadePolicy(Platform.PlatformKick, config)).toEqual({ fade: true, timeoutSeconds: 45 });
    });

    it('returns 30 seconds default when kick fade_timeout is 0', () => {
        const config = {
            kick: { fade: false, fade_timeout: 0, default_channel: '', user_blacklist: [] },
        } as unknown as Config;

        expect(fadePolicy(Platform.PlatformKick, config)).toEqual({ fade: false, timeoutSeconds: 30 });
    });
});

describe('classifyEvent', () => {
    it('classifies sub as sub', () => {
        expect(classifyEvent('sub')).toBe('sub');
    });

    it('classifies resub as sub', () => {
        expect(classifyEvent('resub')).toBe('sub');
    });

    it('classifies subgift as sub', () => {
        expect(classifyEvent('subgift')).toBe('sub');
    });

    it('classifies submysterygift as sub', () => {
        expect(classifyEvent('submysterygift')).toBe('sub');
    });

    it('classifies giftpaidupgrade as sub', () => {
        expect(classifyEvent('giftpaidupgrade')).toBe('sub');
    });

    it('classifies anongiftpaidupgrade as sub', () => {
        expect(classifyEvent('anongiftpaidupgrade')).toBe('sub');
    });

    it('classifies primepaidupgrade as sub', () => {
        expect(classifyEvent('primepaidupgrade')).toBe('sub');
    });

    it('classifies standardpayforward as sub', () => {
        expect(classifyEvent('standardpayforward')).toBe('sub');
    });

    it('classifies communitypayforward as sub', () => {
        expect(classifyEvent('communitypayforward')).toBe('sub');
    });

    it('classifies raid as raid', () => {
        expect(classifyEvent('raid')).toBe('raid');
    });

    it('classifies unraid as raid', () => {
        expect(classifyEvent('unraid')).toBe('raid');
    });

    it('classifies announcement as announcement', () => {
        expect(classifyEvent('announcement')).toBe('announcement');
    });

    it('classifies unknown event as other', () => {
        expect(classifyEvent('somethingelse')).toBe('other');
    });

    it('classifies empty string as other', () => {
        expect(classifyEvent('')).toBe('other');
    });
});
