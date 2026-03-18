import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfigStore } from '@/stores/config';

import { GeneralSettings } from './GeneralSettings';
import { KickSettings } from './KickSettings';
import styles from './Settings.module.css';
import { ThemeSettings } from './ThemeSettings';
import { TwitchSettings } from './TwitchSettings';
import { YouTubeSettings } from './YouTubeSettings';

const tabKeys = ['general', 'twitch', 'youtube', 'kick', 'themes'] as const;
type Tab = (typeof tabKeys)[number];

export function Settings({ onTabChange }: { onTabChange?: (tab: string) => void }) {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const { t } = useTranslation();
    const config = useConfigStore((s) => s.config);
    const saved = useConfigStore((s) => s.saved);

    if (!config) {
        return null;
    }

    return (
        <div className={styles.settings}>
            <nav className={styles.sidebar}>
                {tabKeys.map((key) => (
                    <button
                        key={key}
                        className={`${styles.tab} ${activeTab === key ? styles.active : ''}`}
                        onClick={() => {
                            setActiveTab(key);
                            onTabChange?.(key);
                        }}
                    >
                        {t(`settings.tabs.${key}`)}
                    </button>
                ))}
                <div className={styles.supportLinks}>
                    <span className={styles.supportText}>{t('settings.support')}</span>
                    <a
                        className={styles.supportLink}
                        href="https://ko-fi.com/enubia"
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: 'rgba(255, 99, 51, 0.15)', color: '#ff6333' }}
                    >
                        Ko-fi
                    </a>
                    <a
                        className={styles.supportLink}
                        href="https://www.paypal.com/donate/?hosted_button_id=JMYLMVGSKXXEW"
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: 'rgba(0, 155, 222, 0.15)', color: '#009bde' }}
                    >
                        PayPal
                    </a>
                </div>
            </nav>
            <div className={styles.content}>
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'twitch' && <TwitchSettings />}
                {activeTab === 'youtube' && <YouTubeSettings />}
                {activeTab === 'kick' && <KickSettings />}
                {activeTab === 'themes' && <ThemeSettings />}
            </div>
            {saved && <span className={styles.saved}>Saved</span>}
        </div>
    );
}
