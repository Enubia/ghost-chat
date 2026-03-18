import { ExpandForSettings, ShrinkToChat } from '@bindings/ghost-chat/app.js';
import { Events } from '@wailsio/runtime';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { Chat } from '@/components/Chat/Chat';
import { Home } from '@/components/Home/Home';
import { Settings } from '@/components/Settings/Settings';
import { ThemePreview } from '@/components/Settings/ThemePreview';
import { TitleBar } from '@/components/TitleBar/TitleBar';
import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';

import styles from './App.module.css';

function App() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState('general');
    const [vanished, setVanished] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<{ version: string; url: string } | null>(null);
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
        const cancelConnected = Events.On('chat:connected', (ev) => {
            const { platform } = ev.data as { platform: 'twitch' | 'youtube' | 'kick' };
            setConnected(platform, true);
        });

        const cancelDisconnected = Events.On('chat:disconnected', (ev) => {
            const { platform } = ev.data as { platform: 'twitch' | 'youtube' | 'kick' };
            setConnected(platform, false);
        });

        return () => {
            cancelConnected();
            cancelDisconnected();
        };
    }, [setConnected]);

    useEffect(() => {
        const cancelVanish = Events.On('vanish:toggle', (ev) => {
            setVanished(ev.data as boolean);
        });

        return () => {
            cancelVanish();
        };
    }, []);

    useEffect(() => {
        const cancelUpdate = Events.On('update:available', (ev) => {
            setUpdateInfo(ev.data as { version: string; url: string });
        });

        return () => {
            cancelUpdate();
        };
    }, []);

    useEffect(() => {
        if (vanished) {
            document.documentElement.setAttribute('data-vanished', '');
        } else {
            document.documentElement.removeAttribute('data-vanished');
        }
    }, [vanished]);

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
            <div
                className={`${styles.app} ${settingsOpen ? styles.withSettings : ''} ${vanished ? styles.vanished : ''}`}
                data-vanished={vanished || undefined}
            >
                {!vanished && (
                    <TitleBar
                        onSettingsToggle={toggleSettings}
                        settingsOpen={settingsOpen}
                        updateInfo={updateInfo}
                    />
                )}
                <div className={styles.body}>
                    {settingsOpen && !vanished && (
                        <div className={styles.settingsPanel}>
                            <Settings onTabChange={setSettingsTab} />
                        </div>
                    )}
                    <div className={styles.main}>
                        {settingsOpen && !vanished && settingsTab === 'themes' && <ThemePreview />}
                        <div
                            style={{
                                display: settingsOpen && !vanished && settingsTab === 'themes' ? 'none' : 'contents',
                            }}
                        >
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
            </div>
        </HashRouter>
    );
}

export default App;
