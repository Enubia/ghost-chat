import type React from 'react';

import type { Theme } from '@/types/theme';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';
import { BUILT_IN_THEMES, getThemeById } from '@/types/theme';

import styles from './ThemeSettings.module.css';

function isBuiltIn(id: string): boolean {
    return BUILT_IN_THEMES.some((t) => t.id === id);
}

export function ThemeSettings() {
    const { t } = useTranslation();
    const config = useConfigStore((s) => s.config);
    const update = useConfigStore((s) => s.update);
    const importRef = useRef<HTMLInputElement>(null);

    const activeId = config?.theme?.active_theme_id ?? 'default';
    const customThemes: Theme[] = (config?.theme?.custom_themes as Theme[]) ?? [];
    const allThemes = [...BUILT_IN_THEMES, ...customThemes];
    const theme = getThemeById(activeId, customThemes);
    const readonly = isBuiltIn(activeId);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    const pendingRef = useRef<Partial<Theme>>({});
    const [localTheme, setLocalTheme] = useState<Partial<Theme>>({});

    const displayTheme = { ...theme, ...localTheme };

    const setActiveTheme = (id: string) => {
        pendingRef.current = {};
        setLocalTheme({});
        void update({ theme: { active_theme_id: id } }, { silent: isBuiltIn(id) });
    };

    const updateProp = <K extends keyof Theme>(key: K, value: Theme[K]) => {
        if (readonly) {
            return;
        }

        pendingRef.current = { ...pendingRef.current, [key]: value };

        setLocalTheme((prev) => ({ ...prev, [key]: value }));

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const changes = pendingRef.current;
            pendingRef.current = {};

            setLocalTheme({});

            const current = (useConfigStore.getState().config?.theme?.custom_themes as Theme[]) ?? [];
            const updated = current.map((ct) => (ct.id === activeId ? { ...ct, ...changes } : ct));

            void update({ theme: { custom_themes: updated } });
        }, 500);
    };

    const duplicateTheme = () => {
        const newTheme: Theme = {
            ...displayTheme,
            id: `custom-${Date.now()}`,
            name: `${displayTheme.name} (copy)`,
        };

        void update({
            theme: {
                active_theme_id: newTheme.id,
                custom_themes: [...customThemes, newTheme],
            },
        });
    };

    const deleteTheme = () => {
        if (readonly) {
            return;
        }

        const filtered = customThemes.filter((ct) => ct.id !== activeId);

        void update({
            theme: {
                active_theme_id: 'default',
                custom_themes: filtered,
            },
        });
    };

    const exportTheme = () => {
        const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `${displayTheme.name.toLowerCase().replace(/\s+/g, '-')}.json`;

        a.click();
        URL.revokeObjectURL(url);
    };

    const importTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.addEventListener('load', () => {
            try {
                const imported = JSON.parse(reader.result as string) as Theme;
                imported.id = `custom-${Date.now()}`;

                if (!imported.name) {
                    imported.name = 'Imported';
                }

                void update({
                    theme: {
                        active_theme_id: imported.id,
                        custom_themes: [...customThemes, imported],
                    },
                });
            } catch {
                // invalid JSON, ignore
            }
        });

        reader.readAsText(file);

        if (importRef.current) {
            importRef.current.value = '';
        }
    };

    return (
        <div className={styles.editor}>
            <div className="field">
                <label className="field-label">{t('settings.themes.active_theme')}</label>
                <div className={styles.themeRow}>
                    <select
                        value={activeId}
                        onChange={(e) => setActiveTheme(e.target.value)}
                    >
                        {allThemes.map((th) => (
                            <option
                                key={th.id}
                                value={th.id}
                            >
                                {th.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className={styles.actionBtn}
                        onClick={duplicateTheme}
                    >
                        {t('settings.themes.duplicate')}
                    </button>
                    {!readonly && (
                        <button
                            className={styles.deleteBtn}
                            onClick={deleteTheme}
                        >
                            {t('settings.themes.delete')}
                        </button>
                    )}
                </div>
            </div>

            {readonly && <span className={styles.readonlyHint}>{t('settings.themes.readonly_hint')}</span>}

            {!readonly && (
                <div className="field">
                    <label className="field-label">{t('settings.themes.name')}</label>
                    <input
                        type="text"
                        value={displayTheme.name}
                        onChange={(e) => updateProp('name', e.target.value)}
                    />
                </div>
            )}

            <div className={styles.section}>
                <span className={styles.sectionTitle}>{t('settings.themes.typography')}</span>
                <div className="field">
                    <label className="field-label">{t('settings.themes.font_family')}</label>
                    <input
                        type="text"
                        value={displayTheme.font_family}
                        disabled={readonly}
                        onChange={(e) => updateProp('font_family', e.target.value)}
                    />
                </div>
                <Slider
                    label={t('settings.themes.font_size')}
                    value={displayTheme.font_size}
                    min={8}
                    max={24}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('font_size', v)}
                />
                <Slider
                    label={t('settings.themes.line_height')}
                    value={displayTheme.line_height}
                    min={1}
                    max={2.5}
                    step={0.1}
                    disabled={readonly}
                    onChange={(v) => updateProp('line_height', Math.round(v * 10) / 10)}
                />
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>{t('settings.themes.message')}</span>
                <div className="field">
                    <label className="field-label">{t('settings.themes.message_bg')}</label>
                    <input
                        type="text"
                        value={displayTheme.message_bg}
                        disabled={readonly}
                        onChange={(e) => updateProp('message_bg', e.target.value)}
                        placeholder="transparent"
                    />
                </div>
                <div className="field">
                    <label className="field-label">{t('settings.themes.message_padding')}</label>
                    <input
                        type="text"
                        value={displayTheme.message_padding}
                        disabled={readonly}
                        onChange={(e) => updateProp('message_padding', e.target.value)}
                        placeholder="2px 0"
                    />
                </div>
                <Slider
                    label={t('settings.themes.message_radius')}
                    value={displayTheme.message_radius}
                    min={0}
                    max={20}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('message_radius', v)}
                />
                <Slider
                    label={t('settings.themes.message_gap')}
                    value={displayTheme.message_gap}
                    min={0}
                    max={12}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('message_gap', v)}
                />
                <div className="field">
                    <label className="field-label">{t('settings.themes.text_color')}</label>
                    <input
                        type="text"
                        value={displayTheme.text_color}
                        disabled={readonly}
                        onChange={(e) => updateProp('text_color', e.target.value)}
                        placeholder="inherit"
                    />
                </div>
                <div className="field">
                    <label className="field-label">{t('settings.themes.text_shadow')}</label>
                    <input
                        type="text"
                        value={displayTheme.text_shadow}
                        disabled={readonly}
                        onChange={(e) => updateProp('text_shadow', e.target.value)}
                        placeholder="none"
                    />
                </div>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>{t('settings.themes.username_section')}</span>
                <Slider
                    label={t('settings.themes.username_weight')}
                    value={displayTheme.username_weight}
                    min={400}
                    max={900}
                    step={100}
                    disabled={readonly}
                    onChange={(v) => updateProp('username_weight', v)}
                />
                <div className="field-row">
                    <label className="field-label">{t('settings.themes.show_colon')}</label>
                    <Toggle
                        checked={displayTheme.show_colon}
                        onChange={(v) => updateProp('show_colon', v)}
                        disabled={readonly}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>{t('settings.themes.elements')}</span>
                <Slider
                    label={t('settings.themes.badge_size')}
                    value={displayTheme.badge_size}
                    min={10}
                    max={28}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('badge_size', v)}
                />
                <Slider
                    label={t('settings.themes.emote_size')}
                    value={displayTheme.emote_size}
                    min={16}
                    max={48}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('emote_size', v)}
                />
                <div className="field-row">
                    <label className="field-label">{t('settings.themes.show_avatars')}</label>
                    <Toggle
                        checked={displayTheme.show_avatars}
                        onChange={(v) => updateProp('show_avatars', v)}
                        disabled={readonly}
                    />
                </div>
                {displayTheme.show_avatars && (
                    <Slider
                        label={t('settings.themes.avatar_size')}
                        value={displayTheme.avatar_size}
                        min={12}
                        max={32}
                        unit="px"
                        disabled={readonly}
                        onChange={(v) => updateProp('avatar_size', v)}
                    />
                )}
            </div>

            <div className={styles.importExport}>
                <button
                    className={styles.actionBtn}
                    onClick={exportTheme}
                >
                    {t('settings.themes.export')}
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => importRef.current?.click()}
                >
                    {t('settings.themes.import')}
                </button>
                <input
                    ref={importRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={importTheme}
                />
            </div>
        </div>
    );
}

function Slider({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    disabled,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    onChange: (v: number) => void;
}) {
    return (
        <div className={styles.sliderRow}>
            <label>{label}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className={styles.value}>
                {value}
                {unit}
            </span>
        </div>
    );
}
