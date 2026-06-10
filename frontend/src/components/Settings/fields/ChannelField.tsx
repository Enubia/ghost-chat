import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { stripWhitespace } from '@/utils/validate';

interface ChannelFieldProps {
    // captured once on mount; pass a `key` to remount if the config can change externally
    initialValue: string;
    labelKey: string;
    placeholderKey: string;
    onSave: (value: string) => void;
    normalize?: (value: string) => string;
    validator?: (value: string) => string | null;
    onTextChange?: (value: string) => void;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export function ChannelField({
    initialValue,
    labelKey,
    placeholderKey,
    onSave,
    normalize,
    validator,
    onTextChange,
    children,
    footer,
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
        }

        const normalized = normalize ? normalize(text.trim()) : text.trim();
        onSave(normalized);
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
                <div className="field-input-row">
                    {input}
                    {children}
                </div>
            ) : (
                input
            )}
            {error && <span className="field-error">{t(error)}</span>}
            {footer}
        </div>
    );
}
