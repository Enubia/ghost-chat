import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@/components/Toggle';
import { validateFadeTimeout } from '@/utils/validate';

interface FadeControlsProps {
    fade: boolean;
    fadeTimeout: number;
    onFadeChange: (value: boolean) => void;
    onFadeTimeoutChange: (value: number) => void;
}

export function FadeControls({ fade, fadeTimeout, onFadeChange, onFadeTimeoutChange }: FadeControlsProps) {
    const { t } = useTranslation();

    const [fadeError, setFadeError] = useState<string | null>(null);

    const handleTimeoutChange = (value: string) => {
        const num = Number(value);
        const error = validateFadeTimeout(num);
        setFadeError(error);

        if (!error) {
            onFadeTimeoutChange(num);
        }
    };

    return (
        <>
            <div className="field-row">
                <label className="field-label">{t('settings.platform.fade')}</label>
                <Toggle
                    checked={fade}
                    onChange={onFadeChange}
                />
            </div>

            {fade && (
                <div className="field">
                    <label className="field-label">{t('settings.platform.fade_timeout')}</label>
                    <input
                        type="number"
                        value={fadeTimeout}
                        onChange={(e) => handleTimeoutChange(e.target.value)}
                        min={1}
                        max={300}
                    />
                    {fadeError && <span className="field-error">{t(fadeError)}</span>}
                </div>
            )}
        </>
    );
}
