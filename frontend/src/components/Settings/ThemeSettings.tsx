import type React from 'react';

import type { Theme } from '@/types/theme';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { useConfigStore } from '@/stores/config';
import { BUILT_IN_THEMES, getThemeById } from '@/types/theme';
import { validateThemeName } from '@/utils/validate';

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
    const [nameError, setNameError] = useState<string | null>(null);

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

        if (key === 'name') {
            const error = validateThemeName(value as string);
            setNameError(error);

            if (error) {
                setLocalTheme((prev) => ({ ...prev, [key]: value }));
                return;
            }
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
        const exportData = {
            ...theme,
            _llm_instructions: [
                'This is a Ghost Chat theme file. You can modify the values below and import it back.',
                'Fields:',
                '  name: Display name for the theme',
                '  font_family: CSS font-family value (e.g. "Arial, sans-serif", "inherit")',
                '  font_size: Font size in pixels (8-24)',
                '  line_height: Line height multiplier (1-2.5)',
                '  message_bg: CSS background value (e.g. "transparent", "rgba(0,0,0,0.3)", "#1a1a2e")',
                '  message_padding: CSS padding value (e.g. "2px 0", "4px 8px")',
                '  message_radius: Border radius in pixels (0-20)',
                '  message_gap: Vertical spacing between messages in pixels (0-12)',
                '  username_weight: CSS font-weight for usernames (400-900, step 100)',
                '  show_colon: Show ":" after username (true/false)',
                '  badge_size: Badge icon size in pixels (10-28)',
                '  emote_size: Emote size in pixels (16-48)',
                '  show_avatars: Show user avatars (true/false)',
                '  avatar_size: Avatar size in pixels (12-32)',
                '  text_weight: CSS font-weight for message text (100-900, step 100; 400=normal, 700=bold)',
                '  text_shadow: CSS text-shadow value (e.g. "none", "0 1px 2px rgba(0,0,0,0.5)")',
                '  text_color: CSS color value (e.g. "inherit", "#ffffff")',
                '  top_to_bottom: Show newest messages at top (true/false)',
                'Do NOT modify the "id" field. Only return valid JSON.',
            ],
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
                const raw = JSON.parse(reader.result as string);
                delete raw._llm_instructions;
                const imported = raw as Theme;
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
                    {nameError && <span className="field-error">{t(nameError)}</span>}
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
                        placeholder={t('settings.themes.font_family_hint')}
                    />
                    <span className={styles.fieldHint}>{t('settings.themes.font_family_desc')}</span>
                </div>
                <Slider
                    label={t('settings.themes.font_size')}
                    hint={t('settings.themes.font_size_desc')}
                    value={displayTheme.font_size}
                    min={8}
                    max={24}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('font_size', v)}
                />
                <Slider
                    label={t('settings.themes.line_height')}
                    hint={t('settings.themes.line_height_desc')}
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
                <div>
                    <div className="field-row">
                        <label className="field-label">{t('settings.themes.top_to_bottom')}</label>
                        <Toggle
                            checked={displayTheme.top_to_bottom ?? false}
                            onChange={(v) => updateProp('top_to_bottom', v)}
                            disabled={readonly}
                        />
                    </div>
                    <span className={styles.fieldHint}>{t('settings.themes.top_to_bottom_desc')}</span>
                </div>
                <div className="field">
                    <label className="field-label">{t('settings.themes.message_bg')}</label>
                    <input
                        type="text"
                        value={displayTheme.message_bg}
                        disabled={readonly}
                        onChange={(e) => updateProp('message_bg', e.target.value)}
                        placeholder={t('settings.themes.message_bg_hint')}
                    />
                    <span className={styles.fieldHint}>{t('settings.themes.message_bg_desc')}</span>
                </div>
                <div className="field">
                    <label className="field-label">{t('settings.themes.message_padding')}</label>
                    <input
                        type="text"
                        value={displayTheme.message_padding}
                        disabled={readonly}
                        onChange={(e) => updateProp('message_padding', e.target.value)}
                        placeholder={t('settings.themes.message_padding_hint')}
                    />
                    <span className={styles.fieldHint}>{t('settings.themes.message_padding_desc')}</span>
                </div>
                <Slider
                    label={t('settings.themes.message_radius')}
                    hint={t('settings.themes.message_radius_desc')}
                    value={displayTheme.message_radius}
                    min={0}
                    max={20}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('message_radius', v)}
                />
                <Slider
                    label={t('settings.themes.message_gap')}
                    hint={t('settings.themes.message_gap_desc')}
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
                        placeholder={t('settings.themes.text_color_hint')}
                    />
                    <span className={styles.fieldHint}>{t('settings.themes.text_color_desc')}</span>
                </div>
                <Slider
                    label={t('settings.themes.text_weight')}
                    hint={t('settings.themes.text_weight_desc')}
                    value={displayTheme.text_weight}
                    min={100}
                    max={900}
                    step={100}
                    disabled={readonly}
                    onChange={(v) => updateProp('text_weight', v)}
                />
                <div className="field">
                    <label className="field-label">{t('settings.themes.text_shadow')}</label>
                    <input
                        type="text"
                        value={displayTheme.text_shadow}
                        disabled={readonly}
                        onChange={(e) => updateProp('text_shadow', e.target.value)}
                        placeholder={t('settings.themes.text_shadow_hint')}
                    />
                    <span className={styles.fieldHint}>{t('settings.themes.text_shadow_desc')}</span>
                </div>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>{t('settings.themes.username_section')}</span>
                <Slider
                    label={t('settings.themes.username_weight')}
                    hint={t('settings.themes.username_weight_desc')}
                    value={displayTheme.username_weight}
                    min={400}
                    max={900}
                    step={100}
                    disabled={readonly}
                    onChange={(v) => updateProp('username_weight', v)}
                />
                <div>
                    <div className="field-row">
                        <label className="field-label">{t('settings.themes.show_colon')}</label>
                        <Toggle
                            checked={displayTheme.show_colon}
                            onChange={(v) => updateProp('show_colon', v)}
                            disabled={readonly}
                        />
                    </div>
                    <span className={styles.fieldHint}>{t('settings.themes.show_colon_desc')}</span>
                </div>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionTitle}>{t('settings.themes.elements')}</span>
                <Slider
                    label={t('settings.themes.badge_size')}
                    hint={t('settings.themes.badge_size_desc')}
                    value={displayTheme.badge_size}
                    min={10}
                    max={28}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('badge_size', v)}
                />
                <Slider
                    label={t('settings.themes.emote_size')}
                    hint={t('settings.themes.emote_size_desc')}
                    value={displayTheme.emote_size}
                    min={16}
                    max={48}
                    unit="px"
                    disabled={readonly}
                    onChange={(v) => updateProp('emote_size', v)}
                />
                <div>
                    <div className="field-row">
                        <label className="field-label">{t('settings.themes.show_avatars')}</label>
                        <Toggle
                            checked={displayTheme.show_avatars}
                            onChange={(v) => updateProp('show_avatars', v)}
                            disabled={readonly}
                        />
                    </div>
                    <span className={styles.fieldHint}>{t('settings.themes.show_avatars_desc')}</span>
                </div>
                {displayTheme.show_avatars && (
                    <Slider
                        label={t('settings.themes.avatar_size')}
                        hint={t('settings.themes.avatar_size_desc')}
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
            <span className={styles.llmHint}>{t('settings.themes.llm_hint')}</span>
        </div>
    );
}

function Slider({
    label,
    hint,
    value,
    min,
    max,
    step = 1,
    unit = '',
    disabled,
    onChange,
}: {
    label: string;
    hint?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    onChange: (v: number) => void;
}) {
    return (
        <div className={styles.sliderGroup}>
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
            {hint && <span className={styles.fieldHint}>{hint}</span>}
        </div>
    );
}
