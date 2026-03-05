import { useConfigStore } from '@/stores/config';

const languages = [
    { value: 'en-US', label: 'English' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'es-ES', label: 'Español' },
];

export function GeneralSettings() {
    const config = useConfigStore((s) => s.config);
    const update = useConfigStore((s) => s.update);

    return (
        <>
            <div className="field">
                <label className="field-label">Language</label>
                <select
                    value={config?.general?.language ?? 'en-US'}
                    onChange={(e) => update({ general: { language: e.target.value } })}
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
        </>
    );
}
