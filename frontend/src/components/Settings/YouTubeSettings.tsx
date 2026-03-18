import type { YouTubeConfig } from '@bindings/ghost-chat/internal/config/models.js';

import type { DeepPartial } from '@/types/utils';

import { ResolveYouTubeVideo } from '@bindings/ghost-chat/app.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';
import { stripWhitespace, validateFadeTimeout } from '@/utils/validate';

export function YouTubeSettings() {
    const { t } = useTranslation();
    const yt = useConfigStore((s) => s.config?.youtube);
    const update = useConfigStore((s) => s.update);

    const [channelText, setChannelText] = useState(yt?.channel_id ?? '');
    const [blacklistText, setBlacklistText] = useState((yt?.user_blacklist ?? []).join(', '));
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);
    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
    const [fadeError, setFadeError] = useState<string | null>(null);

    const set = (partial: DeepPartial<YouTubeConfig>) => update({ youtube: partial });

    const saveChannel = () => {
        setResolveError(null);
        setResolvedUrl(null);
        void set({ channel_id: channelText });
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

    const handleAutoDetect = async () => {
        if (!channelText) {
            return;
        }

        setResolving(true);
        setResolveError(null);
        setResolvedUrl(null);

        try {
            const url = await ResolveYouTubeVideo(channelText);

            setResolvedUrl(url);
            void set({ channel_id: channelText, video_url: url });
        } catch (err) {
            setResolveError(String(err));
        } finally {
            setResolving(false);
        }
    };

    return (
        <>
            <div className="field">
                <label className="field-label">{t('settings.youtube.channel')}</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                        type="text"
                        value={channelText}
                        onChange={(e) => {
                            setChannelText(stripWhitespace(e.target.value));
                            setResolvedUrl(null);
                            setResolveError(null);
                        }}
                        onBlur={saveChannel}
                        placeholder={t('settings.youtube.channel_placeholder')}
                    />
                    <button
                        className="btn btn-ghost"
                        onClick={handleAutoDetect}
                        disabled={!channelText || resolving}
                        style={{ flexShrink: 0 }}
                    >
                        {resolving ? t('settings.youtube.detecting') : t('settings.youtube.detect')}
                    </button>
                </div>
                {resolvedUrl && (
                    <span style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '2px' }}>
                        {resolvedUrl}
                    </span>
                )}
                {resolveError && <span className="field-error">{resolveError}</span>}
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.youtube.fade')}</label>
                <Toggle
                    checked={yt?.fade ?? false}
                    onChange={(v) => set({ fade: v })}
                />
            </div>

            {yt?.fade && (
                <div className="field">
                    <label className="field-label">{t('settings.youtube.fade_timeout')}</label>
                    <input
                        type="number"
                        value={yt?.fade_timeout ?? 30}
                        onChange={(e) => saveFadeTimeout(e.target.value)}
                        min={1}
                        max={300}
                    />
                    {fadeError && <span className="field-error">{t(fadeError)}</span>}
                </div>
            )}

            <div className="field">
                <label className="field-label">{t('settings.youtube.user_blacklist')}</label>
                <input
                    type="text"
                    value={blacklistText}
                    onChange={(e) => setBlacklistText(stripWhitespace(e.target.value))}
                    onBlur={saveBlacklist}
                    placeholder={t('settings.youtube.user_blacklist_placeholder')}
                />
            </div>
        </>
    );
}
