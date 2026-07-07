import { TwitchAuthStatus } from '@bindings/ghost-chat/app.js';
import { create } from 'zustand';

export type AuthStatus = 'loggedOut' | 'pending' | 'connected';

export interface PendingInfo {
    userCode: string;
    verificationUri: string;
    expiresIn: number;
}

interface AuthState {
    status: AuthStatus;
    login: string;
    pending: PendingInfo | null;
    setPending: (info: PendingInfo) => void;
    setConnected: (login: string) => void;
    setLoggedOut: () => void;
    setError: (reason: string) => void;
    seed: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    status: 'loggedOut',
    login: '',
    pending: null,

    setPending: (info) => set({ status: 'pending', pending: info }),

    setConnected: (login) => set({ status: 'connected', login, pending: null }),

    setLoggedOut: () => set({ status: 'loggedOut', login: '', pending: null }),

    setError: () => set((state) => (state.status === 'connected' ? {} : { status: 'loggedOut', pending: null })),

    seed: async () => {
        try {
            const status = await TwitchAuthStatus();

            if (status.loggedIn) {
                set({ status: 'connected', login: status.login });
            }
        } catch {
            console.warn('Failed to load Twitch auth status');
        }
    },
}));
