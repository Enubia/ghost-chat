import type { DeepPartial } from '@/types/utils';
import type { config } from '~/wailsjs/go/models';

import { useTranslation } from 'react-i18next';

import { useConfigStore } from '@/stores/config';

export function ExternalSettings() {
    const { t } = useTranslation();
    const ext = useConfigStore((s) => s.config?.external);
    const update = useConfigStore((s) => s.update);

    const set = (partial: DeepPartial<config.ExternalConfig>) => update({ external: partial });

    return (
        <>
            <div className="field">
                <label className="field-label">{t('settings.external.default_url')}</label>
                <input
                    type="url"
                    value={ext?.default_url ?? ''}
                    onChange={(e) => set({ default_url: e.target.value })}
                    placeholder="https://..."
                />
            </div>

            <div className="field">
                <label className="field-label">{t('settings.external.sources')}</label>
                <input
                    type="text"
                    value={(ext?.sources ?? []).join(', ')}
                    onChange={(e) =>
                        set({
                            sources: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        })
                    }
                    placeholder={t('settings.external.sources_placeholder')}
                />
            </div>
        </>
    );
}
