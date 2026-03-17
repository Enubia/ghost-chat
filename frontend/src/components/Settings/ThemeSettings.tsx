import { useTranslation } from 'react-i18next';

import { useConfigStore } from '@/stores/config';
import { BUILT_IN_THEMES, getThemeById } from '@/types/theme';

export function ThemeSettings() {
    const { t } = useTranslation();
    const config = useConfigStore((s) => s.config);
    const update = useConfigStore((s) => s.update);

    const activeId = config?.theme?.active_theme_id ?? 'default';
    const customThemes = config?.theme?.custom_themes ?? [];
    const allThemes = [...BUILT_IN_THEMES, ...customThemes];
    const activeTheme = getThemeById(activeId, customThemes);

    const setActiveTheme = (id: string) => {
        void update({ theme: { active_theme_id: id } });
    };

    return (
        <>
            <div className="field">
                <label className="field-label">{t('settings.themes.active_theme')}</label>
                <select
                    value={activeId}
                    onChange={(e) => setActiveTheme(e.target.value)}
                >
                    {allThemes.map((theme) => (
                        <option
                            key={theme.id}
                            value={theme.id}
                        >
                            {theme.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                {t('settings.themes.description', { name: activeTheme.name })}
            </div>
        </>
    );
}
