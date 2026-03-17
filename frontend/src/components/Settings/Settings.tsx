import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useConfigStore } from '@/stores/config';

import { GeneralSettings } from './GeneralSettings';
import styles from './Settings.module.css';
import { TwitchSettings } from './TwitchSettings';
import { YouTubeSettings } from './YouTubeSettings';

const tabKeys = ['general', 'twitch', 'youtube', 'themes'] as const;
type Tab = (typeof tabKeys)[number];

export function Settings() {
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
                        onClick={() => setActiveTab(key)}
                    >
                        {t(`settings.tabs.${key}`)}
                    </button>
                ))}
            </nav>
            <div className={styles.content}>
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'twitch' && <TwitchSettings />}
                {activeTab === 'youtube' && <YouTubeSettings />}
                {activeTab === 'themes' && <div className={styles.placeholder}>{t('settings.themes.coming_soon')}</div>}
            </div>
            {saved && <span className={styles.saved}>Saved</span>}
        </div>
    );
}
