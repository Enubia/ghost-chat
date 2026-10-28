import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { useConnectionStore } from './connection';

const yt = Platform.PlatformYouTube;

describe('connection store', () => {
    beforeEach(() => {
        useConnectionStore.setState({ connected: {}, waiting: {}, inputs: {} });
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
});
