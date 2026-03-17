import type { DeepPartial } from '@/types/utils';
import type { config } from '~/wailsjs/go/models';

import { create } from 'zustand';

import { GetConfig, UpdateConfig } from '~/wailsjs/go/main/App';

interface ConfigState {
    config: config.Config | null;
    loaded: boolean;
    saved: boolean;
    load: () => Promise<void>;
    update: (partial: DeepPartial<config.Config>) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
    config: null,
    loaded: false,
    saved: false,

    load: async () => {
        try {
            const cfg = await GetConfig();
            set({ config: cfg, loaded: true });
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
            await UpdateConfig(merged);
            set({ config: merged, saved: true });
            setTimeout(() => set({ saved: false }), 1500);
        } catch (err) {
            console.error('Failed to update config:', err);
        }
    },
}));

function deepMerge(target: config.Config, source: DeepPartial<config.Config>): config.Config {
    return mergeObject(target, source) as config.Config;
}

function mergeObject(target: unknown, source: unknown): unknown {
    if (
        !source ||
        typeof source !== 'object' ||
        Array.isArray(source) ||
        !target ||
        typeof target !== 'object' ||
        Array.isArray(target)
    ) {
        return source;
    }

    const tgt = target as Record<string, unknown>;
    const src = source as Record<string, unknown>;
    const result = Object.assign(
        Object.create(Object.getPrototypeOf(target) as object) as Record<string, unknown>,
        tgt
    );

    for (const key of Object.keys(src)) {
        const srcVal = src[key];
        const tgtVal = tgt[key];

        if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) && tgtVal && typeof tgtVal === 'object') {
            result[key] = mergeObject(tgtVal, srcVal);
        } else {
            result[key] = srcVal;
        }
    }
    return result;
}
