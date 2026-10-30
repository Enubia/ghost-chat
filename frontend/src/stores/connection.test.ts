import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { AutoConnectResult } from '@bindings/ghost-chat/models.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { useConnectionStore } from './connection';

const yt = Platform.PlatformYouTube;
const tw = Platform.PlatformTwitch;
const label = (p: Platform) => `[${p}]`;

describe('connection store', () => {
    beforeEach(() => {
        useConnectionStore.setState({ connected: {}, waiting: {}, inputs: {}, error: null });
    });

    it('marks a platform as waiting', () => {
        useConnectionStore.getState().setWaiting(yt, true);

        expect(useConnectionStore.getState().waiting[yt]).toBe(true);
    });

    it('connected clears waiting', () => {
        useConnectionStore.getState().setWaiting(yt, true);
        useConnectionStore.getState().setConnected(yt, true);

        expect(useConnectionStore.getState().connected[yt]).toBe(true);
        expect(useConnectionStore.getState().waiting[yt]).toBe(false);
    });

    it('waiting clears connected', () => {
        useConnectionStore.getState().setConnected(yt, true);
        useConnectionStore.getState().setWaiting(yt, true);

        expect(useConnectionStore.getState().connected[yt]).toBe(false);
        expect(useConnectionStore.getState().waiting[yt]).toBe(true);
    });

    it('disconnected clears both', () => {
        useConnectionStore.getState().setWaiting(yt, true);
        useConnectionStore.getState().setConnected(yt, false);

        expect(useConnectionStore.getState().connected[yt]).toBe(false);
        expect(useConnectionStore.getState().waiting[yt]).toBe(false);
    });

    it('sets and clears the error', () => {
        useConnectionStore.getState().setError('boom');

        expect(useConnectionStore.getState().error).toBe('boom');

        useConnectionStore.getState().setError(null);

        expect(useConnectionStore.getState().error).toBeNull();
    });

    describe('applyAutoConnectResults', () => {
        const result = (platform: Platform, error = '') => new AutoConnectResult({ platform, error });

        it('returns false and keeps error for null results', () => {
            useConnectionStore.setState({ error: 'existing' });

            expect(useConnectionStore.getState().applyAutoConnectResults(null, label)).toBe(false);
            expect(useConnectionStore.getState().error).toBe('existing');
        });

        it('returns false and keeps error for empty results', () => {
            useConnectionStore.setState({ error: 'existing' });

            expect(useConnectionStore.getState().applyAutoConnectResults([], label)).toBe(false);
            expect(useConnectionStore.getState().error).toBe('existing');
        });

        it('returns true when a platform succeeded', () => {
            const ok = useConnectionStore.getState().applyAutoConnectResults([result(tw)], label);

            expect(ok).toBe(true);
            expect(useConnectionStore.getState().error).toBeNull();
        });

        it('prefixes and joins errors per platform', () => {
            const ok = useConnectionStore
                .getState()
                .applyAutoConnectResults([result(tw, 'bad channel'), result(yt, 'offline')], label);

            expect(ok).toBe(false);
            expect(useConnectionStore.getState().error).toBe('[twitch]: bad channel\n[youtube]: offline');
        });

        it('reports success and errors together', () => {
            const ok = useConnectionStore.getState().applyAutoConnectResults([result(tw), result(yt, 'boom')], label);

            expect(ok).toBe(true);
            expect(useConnectionStore.getState().error).toBe('[youtube]: boom');
        });
    });
});
