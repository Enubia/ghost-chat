import { useState, useEffect } from 'react';

import { GetConfig, UpdateConfig } from '../wailsjs/go/main/App';

function App() {
    const [config, setConfig] = useState<any>(null);
    const [language, setLanguage] = useState('');

    useEffect(() => {
        GetConfig().then((cfg) => {
            setConfig(cfg);
            setLanguage(cfg.general.language);
        });
    }, []);

    const handleSave = async () => {
        if (!config) {
            return;
        }

        const updated = { ...config, general: { ...config.general, language } };

        try {
            await UpdateConfig(updated);
            setConfig(updated);
        } catch (err) {
            console.error('save failed:', err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Config Test</h1>
            <p>Current language: {config?.general?.language}</p>
            <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            />
            <button onClick={handleSave}>Save</button>
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
    );
}

export default App;
