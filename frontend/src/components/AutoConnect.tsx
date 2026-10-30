import { AutoConnect as runAutoConnect } from '@bindings/ghost-chat/app.js';
import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConnectionStore } from '@/stores/connection';

const labelKeys: Record<Platform, string> = {
    [Platform.$zero]: 'home.twitch',
    [Platform.PlatformTwitch]: 'home.twitch',
    [Platform.PlatformYouTube]: 'home.youtube',
    [Platform.PlatformKick]: 'home.kick',
};

export function AutoConnect() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        void runAutoConnect()
            .then((results) => {
                const label = (platform: Platform) => t(labelKeys[platform]);
                const anyConnected = useConnectionStore.getState().applyAutoConnectResults(results, label);

                if (anyConnected) {
                    void navigate('/chat');
                }
            })
            .catch((err: unknown) => {
                useConnectionStore.getState().setError(String(err));
            });
    }, [navigate, t]);

    return null;
}
