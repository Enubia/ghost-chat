import { useState } from 'react';
import { useConfigStore } from '@/stores/config';
import { GeneralSettings } from './GeneralSettings';
import { TwitchSettings } from './TwitchSettings';
import { YouTubeSettings } from './YouTubeSettings';
import { ExternalSettings } from './ExternalSettings';
import styles from './Settings.module.css';

const tabs = ['General', 'Twitch', 'YouTube', 'External', 'Themes'] as const;
type Tab = (typeof tabs)[number];

export function Settings() {
    const [activeTab, setActiveTab] = useState<Tab>('General');
    const config = useConfigStore((s) => s.config);

    if (!config) {
        return null;
    }

    return (
        <div className={styles.settings}>
            <nav className={styles.sidebar}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
            <div className={styles.content}>
                {activeTab === 'General' && <GeneralSettings />}
                {activeTab === 'Twitch' && <TwitchSettings />}
                {activeTab === 'YouTube' && <YouTubeSettings />}
                {activeTab === 'External' && <ExternalSettings />}
                {activeTab === 'Themes' && (
                    <div className={styles.placeholder}>Theme editor coming soon</div>
                )}
            </div>
        </div>
    );
}
