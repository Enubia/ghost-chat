import type { TwitchConfig } from '@bindings/ghost-chat/internal/config/models.js';

import type { DeepPartial } from '@/types/utils';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';
import { stripWhitespace, validateFadeTimeout, validateTwitchChannel } from '@/utils/validate';

export function TwitchSettings() {
    const { t } = useTranslation();
    const twitch = useConfigStore((s) => s.config?.twitch);
    const update = useConfigStore((s) => s.update);
    const [defaultChannelText, setDefaultChannelText] = useState(twitch?.default_channel ?? '');
    const [blacklistText, setBlacklistText] = useState((twitch?.user_blacklist ?? []).join(', '));
    const [channelError, setChannelError] = useState<string | null>(null);
    const [fadeError, setFadeError] = useState<string | null>(null);

    const set = (partial: DeepPartial<TwitchConfig>) => update({ twitch: partial });

    const saveChannel = () => {
        const error = validateTwitchChannel(defaultChannelText);
        setChannelError(error);

        if (!error) {
            void set({ default_channel: defaultChannelText.trim().toLowerCase() });
        }
    };

    const saveFadeTimeout = (value: string) => {
        const num = Number(value);
        const error = validateFadeTimeout(num);
        setFadeError(error);

        if (!error) {
            void set({ fade_timeout: num });
        }
    };

    const saveBlacklist = () => {
        void set({
            user_blacklist: blacklistText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        });
    };

    return (
        <>
            <div className="field">
                <label className="field-label">{t('settings.twitch.default_channel')}</label>
                <input
                    type="text"
                    value={defaultChannelText}
                    onChange={(e) => {
                        setDefaultChannelText(stripWhitespace(e.target.value));
                        setChannelError(null);
                    }}
                    onBlur={saveChannel}
                    placeholder={t('settings.twitch.default_channel')}
                />
                {channelError && <span className="field-error">{t(channelError)}</span>}
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.twitch.fade')}</label>
                <Toggle
                    checked={twitch?.fade ?? false}
                    onChange={(v) => set({ fade: v })}
                />
            </div>

            {twitch?.fade && (
                <div className="field">
                    <label className="field-label">{t('settings.twitch.fade_timeout')}</label>
                    <input
                        type="number"
                        value={twitch?.fade_timeout ?? 30}
                        onChange={(e) => saveFadeTimeout(e.target.value)}
                        min={1}
                        max={300}
                    />
                    {fadeError && <span className="field-error">{t(fadeError)}</span>}
                </div>
            )}

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

            <div className="field">
                <label className="field-label">{t('settings.twitch.user_blacklist')}</label>
                <input
                    type="text"
                    value={blacklistText}
                    onChange={(e) => setBlacklistText(stripWhitespace(e.target.value))}
                    onBlur={saveBlacklist}
                    placeholder={t('settings.twitch.user_blacklist_placeholder')}
                />
            </div>
        </>
    );
}
