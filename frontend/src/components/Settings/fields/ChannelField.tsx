import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { stripWhitespace } from '@/utils/validate';

interface ChannelFieldProps {
    initialValue: string;
    labelKey: string;
    placeholderKey: string;
    onSave: (value: string) => void;
    validator?: (value: string) => string | null;
    onTextChange?: (value: string) => void;
    children?: React.ReactNode;
}

export function ChannelField({
    initialValue,
    labelKey,
    placeholderKey,
    onSave,
    validator,
    onTextChange,
    children,
}: ChannelFieldProps) {
    const { t } = useTranslation();

    const [text, setText] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (value: string) => {
        const stripped = stripWhitespace(value);
        setText(stripped);
        setError(null);
        onTextChange?.(stripped);
    };

    const handleSave = () => {
        if (validator) {
            const err = validator(text);
            setError(err);

            if (err) {
                return;
            }

            onSave(text.trim().toLowerCase());
        } else {
            onSave(text.trim());
        }
    };

    const input = (
        <input
            type="text"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleSave}
            placeholder={t(placeholderKey)}
        />
    );

    return (
        <div className="field">
            <label className="field-label">{t(labelKey)}</label>
            {children ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                    {input}
                    {children}
                </div>
            ) : (
                input
            )}
            {error && <span className="field-error">{t(error)}</span>}
        </div>
    );
}
