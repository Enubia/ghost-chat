import { ToggleVanish } from '@bindings/ghost-chat/app.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useConfigStore } from '@/stores/config';

import styles from './CustomSource.module.css';

export function CustomSource() {
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);
    const [reloadKey, setReloadKey] = useState(0);

    const url = config?.custom_source?.url ?? '';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/')}
                    title="Back"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button
                    className="btn btn-ghost"
                    onClick={() => setReloadKey((k) => k + 1)}
                    title="Reload"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 .49-3.54" />
                    </svg>
                </button>
                <button
                    className={styles.vanishBtn}
                    onClick={() => void ToggleVanish()}
                    title="Vanish"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                        />
                    </svg>
                </button>
            </div>
            {url && (
                <div className={styles.iframeWrapper}>
                    <iframe
                        key={reloadKey}
                        src={url}
                        title="Custom source"
                        className={styles.iframe}
                    />
                </div>
            )}
        </div>
    );
}
