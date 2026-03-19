import type React from 'react';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './HotkeyInput.module.css';

const KEY_ALIASES: Record<string, string> = {
    arrowleft: 'left',
    arrowright: 'right',
    arrowup: 'up',
    arrowdown: 'down',
    ' ': 'space',
    backspace: 'delete',
};

const MODIFIER_KEYS = new Set(['control', 'shift', 'alt', 'meta']);

function normalizeKey(key: string): string {
    const lower = key.toLowerCase();

    return KEY_ALIASES[lower] ?? lower;
}

interface HotkeyInputProps {
    value: string;
    onChange: (keybind: string) => void;
}

export function HotkeyInput({ value, onChange }: HotkeyInputProps) {
    const { t } = useTranslation();
    const [capturing, setCapturing] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!capturing) {
            return;
        }

        const key = e.key.toLowerCase();

        if (MODIFIER_KEYS.has(key)) {
            return;
        }

        const parts: string[] = [];

        if (e.ctrlKey) {
            parts.push('ctrl');
        }

        if (e.shiftKey) {
            parts.push('shift');
        }

        if (e.altKey) {
            parts.push('alt');
        }

        if (e.metaKey) {
            parts.push('cmd');
        }

        if (parts.length === 0) {
            return;
        }

        parts.push(normalizeKey(e.key));

        onChange(parts.join('+'));
        setCapturing(false);
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <>
            <div className={styles.container}>
                <input
                    id="hotkey-input"
                    className={`${styles.input} ${capturing ? styles.capturing : ''}`}
                    type="text"
                    readOnly
                    value={capturing ? t('settings.general.press_keys') : value || t('settings.general.not_set')}
                    onFocus={() => setCapturing(true)}
                    onBlur={() => setCapturing(false)}
                    onKeyDown={handleKeyDown}
                />
                {value && (
                    <button
                        className={styles.clearBtn}
                        onClick={handleClear}
                    >
                        x
                    </button>
                )}
            </div>
            <span
                className={styles.hotkeyHint}
            >
                {t('settings.general.hotkey_hint')}
            </span>
        </>
    );
}
