import type { DeepPartial } from '@/types/utils';
import type { config } from '~/wailsjs/go/models';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';
import { ResolveYouTubeVideo } from '~/wailsjs/go/main/App';

export function YouTubeSettings() {
    const { t } = useTranslation();
    const yt = useConfigStore((s) => s.config?.youtube);
    const update = useConfigStore((s) => s.update);

    const [channelText, setChannelText] = useState(yt?.channel_id ?? '');
    const [blacklistText, setBlacklistText] = useState((yt?.user_blacklist ?? []).join(', '));
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);
    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

    const set = (partial: DeepPartial<config.YouTubeConfig>) => update({ youtube: partial });

    const saveChannel = () => {
        setResolveError(null);
        setResolvedUrl(null);
        void set({ channel_id: channelText });
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
                            setChannelText(e.target.value);
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
                {resolveError && (
                    <span style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '2px' }}>
                        {resolveError}
                    </span>
                )}
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
                        onChange={(e) => set({ fade_timeout: Number(e.target.value) })}
                        min={1}
                    />
                </div>
            )}

            <div className="field">
                <label className="field-label">{t('settings.youtube.user_blacklist')}</label>
                <input
                    type="text"
                    value={blacklistText}
                    onChange={(e) => setBlacklistText(e.target.value)}
                    onBlur={saveBlacklist}
                    placeholder={t('settings.youtube.user_blacklist_placeholder')}
                />
            </div>
        </>
    );
}
