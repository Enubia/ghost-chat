import type { DeepPartial } from '@/types/utils';
import type { config } from '~/wailsjs/go/models';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';

export function TwitchSettings() {
    const twitch = useConfigStore((s) => s.config?.twitch);
    const update = useConfigStore((s) => s.update);

    const set = (partial: DeepPartial<config.TwitchConfig>) => update({ twitch: partial });

    return (
        <>
            <div className="field">
                <label className="field-label">Channel</label>
                <input
                    type="text"
                    value={twitch?.channel ?? ''}
                    onChange={(e) => set({ channel: e.target.value })}
                    placeholder="Channel name"
                />
            </div>

            <div className="field">
                <label className="field-label">Default Channel</label>
                <input
                    type="text"
                    value={twitch?.default_channel ?? ''}
                    onChange={(e) => set({ default_channel: e.target.value })}
                    placeholder="Default channel"
                />
            </div>

            <div className="field-row">
                <label className="field-label">Fade Messages</label>
                <Toggle
                    checked={twitch?.fade ?? false}
                    onChange={(v) => set({ fade: v })}
                />
            </div>

            {twitch?.fade && (
                <div className="field">
                    <label className="field-label">Fade Timeout (seconds)</label>
                    <input
                        type="number"
                        value={twitch?.fade_timeout ?? 30}
                        onChange={(e) => set({ fade_timeout: Number(e.target.value) })}
                        min={1}
                    />
                </div>
            )}

            <div className="field-row">
                <label className="field-label">Show Bots</label>
                <Toggle
                    checked={twitch?.bots ?? false}
                    onChange={(v) => set({ bots: v })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">Hide Commands</label>
                <Toggle
                    checked={twitch?.hide_commands ?? false}
                    onChange={(v) => set({ hide_commands: v })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">Hide Badges</label>
                <Toggle
                    checked={twitch?.hide_badges ?? false}
                    onChange={(v) => set({ hide_badges: v })}
                />
            </div>

            <div className="field">
                <label className="field-label">User Blacklist</label>
                <input
                    type="text"
                    value={(twitch?.user_blacklist ?? []).join(', ')}
                    onChange={(e) =>
                        set({
                            user_blacklist: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        })
                    }
                    placeholder="user1, user2, ..."
                />
            </div>
        </>
    );
}
