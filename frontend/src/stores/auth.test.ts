import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from './auth';

vi.mock('@bindings/ghost-chat/app.js', () => ({
    TwitchAuthStatus: vi.fn(() => Promise.resolve({ loggedIn: false, login: '' })),
}));

describe('auth store', () => {
    beforeEach(() => {
        useAuthStore.setState({ status: 'loggedOut', login: '', pending: null });
    });

    it('starts logged out', () => {
        expect(useAuthStore.getState().status).toBe('loggedOut');
    });

    it('moves to pending with the device-code info', () => {
        useAuthStore.getState().setPending({
            userCode: 'ABCD-EFGH',
            verificationUri: 'https://twitch.tv/activate',
            expiresIn: 1800,
        });

        const state = useAuthStore.getState();

        expect(state.status).toBe('pending');
        expect(state.pending?.userCode).toBe('ABCD-EFGH');
    });

    it('moves to connected and clears pending on success', () => {
        useAuthStore.getState().setPending({ userCode: 'X', verificationUri: 'u', expiresIn: 1 });
        useAuthStore.getState().setConnected('streamer');

        const state = useAuthStore.getState();

        expect(state.status).toBe('connected');
        expect(state.login).toBe('streamer');
        expect(state.pending).toBeNull();
    });

    it('returns to logged out and clears login', () => {
        useAuthStore.getState().setConnected('streamer');
        useAuthStore.getState().setLoggedOut();

        const state = useAuthStore.getState();

        expect(state.status).toBe('loggedOut');
        expect(state.login).toBe('');
    });

    it('drops from pending back to logged out on error', () => {
        useAuthStore.getState().setPending({ userCode: 'X', verificationUri: 'u', expiresIn: 1 });
        useAuthStore.getState().setError('device code expired');

        const state = useAuthStore.getState();

        expect(state.status).toBe('loggedOut');
        expect(state.pending).toBeNull();
    });

    it('ignores a stale error while connected', () => {
        useAuthStore.getState().setConnected('streamer');
        useAuthStore.getState().setError('device code expired');

        const state = useAuthStore.getState();

        expect(state.status).toBe('connected');
        expect(state.login).toBe('streamer');
    });
});
