import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { stripWhitespace } from '@/utils/validate';

interface BlacklistFieldProps {
    initialValue: string[];
    onSave: (value: string[]) => void;
}

export function BlacklistField({ initialValue, onSave }: BlacklistFieldProps) {
    const { t } = useTranslation();

    const [text, setText] = useState(initialValue.join(', '));

    const handleSave = () => {
        onSave(
            text
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
        );
    };

    return (
        <div className="field">
            <label className="field-label">{t('settings.platform.user_blacklist')}</label>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(stripWhitespace(e.target.value))}
                onBlur={handleSave}
                placeholder={t('settings.platform.user_blacklist_placeholder')}
            />
        </div>
    );
}
