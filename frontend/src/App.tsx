import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

import { ExpandForSettings, ShrinkToChat } from '@bindings/ghost-chat/app.js';
import { Events } from '@wailsio/runtime';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { Chat } from '@/components/Chat/Chat';
import { CustomSource } from '@/components/CustomSource/CustomSource';
import { Home } from '@/components/Home/Home';
import { Settings } from '@/components/Settings/Settings';
import { ThemePreview } from '@/components/Settings/ThemePreview';
import { TitleBar } from '@/components/TitleBar/TitleBar';
import { useAuthStore } from '@/stores/auth';
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
    const seedAuth = useAuthStore((s) => s.seed);
    const setAuthPending = useAuthStore((s) => s.setPending);
    const setAuthConnected = useAuthStore((s) => s.setConnected);
    const setAuthLoggedOut = useAuthStore((s) => s.setLoggedOut);
    const setAuthError = useAuthStore((s) => s.setError);

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
            const { platform } = ev.data as { platform: Platform };
            setConnected(platform, true);
        });

        const cancelDisconnected = Events.On('chat:disconnected', (ev) => {
            const { platform } = ev.data as { platform: Platform };
            setConnected(platform, false);
        });

        return () => {
            cancelConnected();
            cancelDisconnected();
        };
    }, [setConnected]);

    useEffect(() => {
        void seedAuth();

        const cancelPending = Events.On('twitch:auth:pending', (ev) => {
            setAuthPending(ev.data as { userCode: string; verificationUri: string; expiresIn: number });
        });

        const cancelSuccess = Events.On('twitch:auth:success', (ev) => {
            const { login } = ev.data as { login: string };
            setAuthConnected(login);
        });

        const cancelError = Events.On('twitch:auth:error', (ev) => {
            const { reason } = ev.data as { reason: string };
            setAuthError(reason);
        });

        const cancelLoggedOut = Events.On('twitch:auth:loggedout', () => {
            setAuthLoggedOut();
        });

        return () => {
            cancelPending();
            cancelSuccess();
            cancelError();
            cancelLoggedOut();
        };
    }, [seedAuth, setAuthPending, setAuthConnected, setAuthError, setAuthLoggedOut]);

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
                <TitleBar
                    onSettingsToggle={toggleSettings}
                    settingsOpen={settingsOpen}
                    updateInfo={updateInfo}
                />
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
                                <Route
                                    path="/source"
                                    element={<CustomSource />}
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
