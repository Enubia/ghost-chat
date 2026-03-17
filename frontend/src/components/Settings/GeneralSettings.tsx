import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';

const languages = [
    { value: 'en-US', label: 'English' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'es-ES', label: 'Español' },
];

export function GeneralSettings() {
    const { t, i18n } = useTranslation();
    const config = useConfigStore((s) => s.config);
    const update = useConfigStore((s) => s.update);

    const handleLanguageChange = (lang: string) => {
        void i18n.changeLanguage(lang);
        void update({ general: { language: lang } });
    };

    return (
        <>
            <div className="field">
                <label className="field-label">{t('settings.general.language')}</label>
                <select
                    value={config?.general?.language ?? 'en-US'}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                >
                    {languages.map((lang) => (
                        <option
                            key={lang.value}
                            value={lang.value}
                        >
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="field-row">
                <label className="field-label">{t('settings.general.show_timestamps')}</label>
                <Toggle
                    checked={config?.general?.show_timestamps ?? false}
                    onChange={(v) => void update({ general: { show_timestamps: v } })}
                />
            </div>
        </>
    );
}
