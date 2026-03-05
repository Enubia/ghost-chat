import { create } from 'zustand';
import { GetConfig, UpdateConfig } from '../../wailsjs/go/main/App';

interface ConfigState {
    config: Record<string, any> | null;
    loaded: boolean;
    load: () => Promise<void>;
    update: (partial: Record<string, any>) => Promise<void>;
    set: (config: Record<string, any>) => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
    config: null,
    loaded: false,

    load: async () => {
        try {
            const cfg = await GetConfig();
            set({ config: cfg as unknown as Record<string, any>, loaded: true });
        } catch {
            console.warn('Failed to load config from Go backend');
            set({ loaded: true });
        }
    },

    update: async (partial) => {
        const current = get().config;
        if (!current) {
            return;
        }

        const merged = deepMerge(current, partial);
        try {
            await UpdateConfig(merged as any);
            set({ config: merged });
        } catch (err) {
            console.error('Failed to update config:', err);
        }
    },

    set: (config) => set({ config }),
}));

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === 'object'
        ) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}
