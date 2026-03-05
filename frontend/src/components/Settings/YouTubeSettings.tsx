import type { DeepPartial } from '@/types/utils';
import type { config } from '~/wailsjs/go/models';

import { useTranslation } from 'react-i18next';

import { useConfigStore } from '@/stores/config';

export function YouTubeSettings() {
    const { t } = useTranslation();
    const yt = useConfigStore((s) => s.config?.youtube);
    const update = useConfigStore((s) => s.update);

    const set = (partial: DeepPartial<config.YouTubeConfig>) => update({ youtube: partial });

    return (
        <>
            <div className="field">
                <label className="field-label">{t('settings.youtube.channel_id')}</label>
                <input
                    type="text"
                    value={yt?.channel_id ?? ''}
                    onChange={(e) => set({ channel_id: e.target.value })}
                    placeholder="UC..."
                />
            </div>

            <div className="field">
                <label className="field-label">{t('settings.youtube.default_channel_id')}</label>
                <input
                    type="text"
                    value={yt?.default_channel_id ?? ''}
                    onChange={(e) => set({ default_channel_id: e.target.value })}
                    placeholder="UC..."
                />
            </div>

            <div className="field">
                <label className="field-label">{t('settings.youtube.video_url')}</label>
                <input
                    type="url"
                    value={yt?.video_url ?? ''}
                    onChange={(e) => set({ video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                />
            </div>

            <div className="field">
                <label className="field-label">{t('settings.youtube.retries')}</label>
                <input
                    type="number"
                    value={yt?.retries ?? 50}
                    onChange={(e) => set({ retries: Number(e.target.value) })}
                    min={1}
                />
            </div>

            <div className="field">
                <label className="field-label">{t('settings.youtube.fetch_delay')}</label>
                <input
                    type="number"
                    value={yt?.fetch_delay ?? 5}
                    onChange={(e) => set({ fetch_delay: Number(e.target.value) })}
                    min={1}
                />
            </div>

            <div className="field">
                <label className="field-label">{t('settings.youtube.user_blacklist')}</label>
                <input
                    type="text"
                    value={(yt?.user_blacklist ?? []).join(', ')}
                    onChange={(e) =>
                        set({
                            user_blacklist: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        })
                    }
                    placeholder={t('settings.youtube.user_blacklist_placeholder')}
                />
            </div>
        </>
    );
}
