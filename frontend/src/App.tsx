import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useConfigStore } from '@/stores/config';
import { TitleBar } from '@/components/TitleBar/TitleBar';
import { Settings } from '@/components/Settings/Settings';
import { Home } from '@/components/Home/Home';
import { Chat } from '@/components/Chat/Chat';
import styles from './App.module.css';

function App() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const load = useConfigStore((s) => s.load);
    const loaded = useConfigStore((s) => s.loaded);

    useEffect(() => {
        load();
    }, [load]);

    if (!loaded) {
        return null;
    }

    return (
        <HashRouter>
            <div className={`${styles.app} ${settingsOpen ? styles.withSettings : ''}`}>
                <TitleBar
                    onSettingsToggle={() => setSettingsOpen((v) => !v)}
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
                            <Route path="/" element={<Home />} />
                            <Route path="/chat" element={<Chat />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
