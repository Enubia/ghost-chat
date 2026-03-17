import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { Chat } from '@/components/Chat/Chat';
import { Home } from '@/components/Home/Home';
import { Settings } from '@/components/Settings/Settings';
import { TitleBar } from '@/components/TitleBar/TitleBar';
import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';
import { ExpandForSettings, ShrinkToChat } from '~/wailsjs/go/main/App';
import { EventsOn } from '~/wailsjs/runtime/runtime';

import styles from './App.module.css';

function App() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { i18n } = useTranslation();
    const load = useConfigStore((s) => s.load);
    const loaded = useConfigStore((s) => s.loaded);
    const language = useConfigStore((s) => s.config?.general?.language);
    const setConnected = useConnectionStore((s) => s.setConnected);

    const toggleSettings = () => {
        if (settingsOpen) {
            void ShrinkToChat();
        } else {
            void ExpandForSettings();
        }
        setSettingsOpen((v) => !v);
    };

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const cancelConnected = EventsOn('chat:connected', (data: unknown) => {
            const platform =
                typeof data === 'string' ? 'twitch' : ((data as { platform?: string })?.platform ?? 'twitch');
            setConnected(platform as 'twitch' | 'youtube' | 'kick', true);
        });
        const cancelDisconnected = EventsOn('chat:disconnected', (data: unknown) => {
            const platform =
                typeof data === 'string' ? 'twitch' : ((data as { platform?: string })?.platform ?? 'twitch');
            setConnected(platform as 'twitch' | 'youtube' | 'kick', false);
        });
        return () => {
            cancelConnected();
            cancelDisconnected();
        };
    }, [setConnected]);

    useEffect(() => {
        if (language && language !== i18n.language) {
            void i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    if (!loaded) {
        return null;
    }

    return (
        <HashRouter>
            <div className={`${styles.app} ${settingsOpen ? styles.withSettings : ''}`}>
                <TitleBar
                    onSettingsToggle={toggleSettings}
                    settingsOpen={settingsOpen}
                />
                <div className={styles.body}>
                    {settingsOpen && (
                        <div className={styles.settingsPanel}>
                            <Settings />
                        </div>
                    )}
                    <div className={styles.main}>
                        <Routes>
                            <Route
                                path="/"
                                element={<Home />}
                            />
                            <Route
                                path="/chat"
                                element={<Chat />}
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
