import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { GeneralSettings } from '@/components/Settings/GeneralSettings';
import styles from '@/components/Settings/Settings.module.css';
import { ThemeSettings } from '@/components/Settings/ThemeSettings';
import { TwitchSettings } from '@/components/Settings/TwitchSettings';

const TABS = ['general', 'twitch', 'youtube', 'kick', 'themes', 'report'] as const;

export type SettingsTab = (typeof TABS)[number];

export function SettingsPanel({ tab, scrollTop = 0 }: { tab: SettingsTab; scrollTop?: number }) {
    const { t } = useTranslation();
    const contentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = scrollTop;
        }
    });

    return (
        <div className={styles.settings}>
            <nav className={styles.sidebar}>
                {TABS.map((key) => (
                    <button
                        key={key}
                        className={`${styles.tab} ${tab === key ? styles.active : ''}`}
                    >
                        {t(`settings.tabs.${key}`)}
                    </button>
                ))}
                <div className={styles.supportLinks}>
                    <span className={styles.supportText}>{t('settings.support')}</span>
                    <button
                        className={styles.supportLink}
                        style={{ background: 'rgba(255, 99, 51, 0.15)', color: '#ff6333' }}
                    >
                        Ko-fi
                    </button>
                    <button
                        className={styles.supportLink}
                        style={{ background: 'rgba(0, 155, 222, 0.15)', color: '#009bde' }}
                    >
                        PayPal
                    </button>
                </div>
            </nav>
            <div
                ref={contentRef}
                className={styles.content}
                style={{ overflow: 'hidden' }}
            >
                {tab === 'general' && <GeneralSettings />}
                {tab === 'twitch' && <TwitchSettings />}
                {tab === 'themes' && <ThemeSettings />}
            </div>
        </div>
    );
}
