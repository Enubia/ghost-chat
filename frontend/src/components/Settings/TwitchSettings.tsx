import type { TwitchConfig } from '@bindings/ghost-chat/internal/config/models.js';

import type { DeepPartial } from '@/types/utils';

import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';
import { validateTwitchChannel } from '@/utils/validate';

import { BlacklistField } from './fields/BlacklistField';
import { ChannelField } from './fields/ChannelField';
import { FadeControls } from './fields/FadeControls';

export function TwitchSettings() {
    const { t } = useTranslation();
    const twitch = useConfigStore((s) => s.config?.twitch);
    const update = useConfigStore((s) => s.update);

    const set = (partial: DeepPartial<TwitchConfig>) => update({ twitch: partial });

    return (
        <>
            <ChannelField
                initialValue={twitch?.default_channel ?? ''}
                labelKey="settings.twitch.default_channel"
                placeholderKey="settings.twitch.default_channel"
                onSave={(v) => set({ default_channel: v })}
                validator={validateTwitchChannel}
            />

            <FadeControls
                fade={twitch?.fade ?? false}
                fadeTimeout={twitch?.fade_timeout ?? 30}
                onFadeChange={(v) => set({ fade: v })}
                onFadeTimeoutChange={(v) => set({ fade_timeout: v })}
            />

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.bots')}</label>
                <Toggle
                    checked={twitch?.bots ?? false}
                    onChange={(v) => set({ bots: v })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.hide_commands')}</label>
                <Toggle
                    checked={twitch?.hide_commands ?? false}
                    onChange={(v) => set({ hide_commands: v })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.hide_badges')}</label>
                <Toggle
                    checked={twitch?.hide_badges ?? false}
                    onChange={(v) => set({ hide_badges: v })}
                />
            </div>

            <BlacklistField
                initialValue={twitch?.user_blacklist ?? []}
                onSave={(v) => set({ user_blacklist: v })}
            />

            <div className="field-section">
                <label className="field-section-label">{t('settings.twitch.events')}</label>
                <span className="field-hint">{t('settings.twitch.events_hint')}</span>
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.events_subs')}</label>
                <Toggle
                    checked={twitch?.events?.subscriptions !== false}
                    onChange={(v) => set({ events: { subscriptions: v } })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.events_raids')}</label>
                <Toggle
                    checked={twitch?.events?.raids !== false}
                    onChange={(v) => set({ events: { raids: v } })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.events_announcements')}</label>
                <Toggle
                    checked={twitch?.events?.announcements !== false}
                    onChange={(v) => set({ events: { announcements: v } })}
                />
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.events_other')}</label>
                <Toggle
                    checked={twitch?.events?.other !== false}
                    onChange={(v) => set({ events: { other: v } })}
                />
            </div>
        </>
    );
}
