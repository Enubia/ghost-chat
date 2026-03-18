import type { KickConfig } from '@bindings/ghost-chat/internal/config/models.js';

import type { DeepPartial } from '@/types/utils';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';

export function KickSettings() {
    const { t } = useTranslation();
    const kick = useConfigStore((s) => s.config?.kick);
    const update = useConfigStore((s) => s.update);

    const [defaultChannelText, setDefaultChannelText] = useState(kick?.default_channel ?? '');
    const [blacklistText, setBlacklistText] = useState((kick?.user_blacklist ?? []).join(', '));

    const set = (partial: DeepPartial<KickConfig>) => update({ kick: partial });

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
                <label className="field-label">{t('settings.kick.default_channel')}</label>
                <input
                    type="text"
                    value={defaultChannelText}
                    onChange={(e) => setDefaultChannelText(e.target.value)}
                    onBlur={() => set({ default_channel: defaultChannelText })}
                    placeholder={t('settings.kick.default_channel_placeholder')}
                />
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.kick.fade')}</label>
                <Toggle
                    checked={kick?.fade ?? false}
                    onChange={(v) => set({ fade: v })}
                />
            </div>

            {kick?.fade && (
                <div className="field">
                    <label className="field-label">{t('settings.kick.fade_timeout')}</label>
                    <input
                        type="number"
                        value={kick?.fade_timeout ?? 30}
                        onChange={(e) => set({ fade_timeout: Number(e.target.value) })}
                        min={1}
                    />
                </div>
            )}

            <div className="field">
                <label className="field-label">{t('settings.kick.user_blacklist')}</label>
                <input
                    type="text"
                    value={blacklistText}
                    onChange={(e) => setBlacklistText(e.target.value)}
                    onBlur={saveBlacklist}
                    placeholder={t('settings.kick.user_blacklist_placeholder')}
                />
            </div>
        </>
    );
}
