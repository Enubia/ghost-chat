import { useTranslation } from 'react-i18next';

import ghostSvg from '@/assets/ghost.svg';
import { WindowMinimise, Quit } from '~/wailsjs/runtime/runtime';

import styles from './TitleBar.module.css';

interface TitleBarProps {
    onSettingsToggle: () => void;
    settingsOpen: boolean;
}

export function TitleBar({ onSettingsToggle, settingsOpen }: TitleBarProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.titlebar}>
            <div className={styles.drag}>
                <img
                    src={ghostSvg}
                    alt=""
                    className={styles.logo}
                />
                <span className={styles.title}>Ghost Chat</span>
            </div>
            <div className={styles.controls}>
                <button
                    className={`${styles.controlBtn} ${settingsOpen ? styles.active : ''}`}
                    onClick={onSettingsToggle}
                    title={t('titlebar.settings')}
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
                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                        />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
                <button
                    className={styles.controlBtn}
                    onClick={() => WindowMinimise()}
                    title={t('titlebar.minimize')}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <line
                            x1="5"
                            y1="12"
                            x2="19"
                            y2="12"
                        />
                    </svg>
                </button>
                <button
                    className={`${styles.controlBtn} ${styles.close}`}
                    onClick={() => Quit()}
                    title={t('titlebar.close')}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <line
                            x1="18"
                            y1="6"
                            x2="6"
                            y2="18"
                        />
                        <line
                            x1="6"
                            y1="6"
                            x2="18"
                            y2="18"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
