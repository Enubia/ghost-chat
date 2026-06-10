import { Connect, Disconnect } from '@bindings/ghost-chat/app.js';
import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';

import styles from './Home.module.css';

export function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);

    const { connected, inputs, setInput } = useConnectionStore();
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<Platform | null>(null);

    const getInput = (platform: Platform): string => {
        if (platform === Platform.PlatformTwitch) {
            return inputs[platform] || (config?.twitch?.default_channel ?? '');
        }

        if (platform === Platform.PlatformYouTube) {
            return inputs[platform] || (config?.youtube?.channel_id ?? '');
        }

        return inputs[platform] || (config?.kick?.default_channel ?? '');
    };

    const anyConnected = Object.values(connected).some(Boolean);

    const handleToggle = async (platform: Platform) => {
        setError(null);

        if (connected[platform]) {
            void Disconnect(platform);
        } else {
            setConnecting(platform);

            try {
                await Connect(platform, getInput(platform));
            } catch (err) {
                setError(String(err));
            } finally {
                setConnecting(null);
            }
        }
    };

    return (
        <div className={styles.home}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.cards}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.platformLabel}>
                            <svg
                                className={styles.platformIcon}
                                viewBox="0 0 24 24"
                                fill="#9146ff"
                            >
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                            </svg>
                            {t('home.twitch')}
                        </span>
                        <span
                            className={`${styles.status} ${connected[Platform.PlatformTwitch] ? styles.connected : ''}`}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.channel')}
                        value={getInput(Platform.PlatformTwitch)}
                        onChange={(e) => setInput(Platform.PlatformTwitch, e.target.value)}
                    />
                    <button
                        className={`btn ${connected[Platform.PlatformTwitch] ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => void handleToggle(Platform.PlatformTwitch)}
                        disabled={!getInput(Platform.PlatformTwitch) || connecting !== null}
                    >
                        {connecting === Platform.PlatformTwitch
                            ? t('home.connecting')
                            : connected[Platform.PlatformTwitch]
                              ? t('home.disconnect')
                              : t('home.connect')}
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.platformLabel}>
                            <svg
                                className={styles.platformIcon}
                                viewBox="0 0 24 24"
                                fill="#ff0000"
                            >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            {t('home.youtube')}
                        </span>
                        <span
                            className={`${styles.status} ${connected[Platform.PlatformYouTube] ? styles.connected : ''}`}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.channel_or_url', {
                            defaultValue: '@handle, channel ID, or video URL',
                        })}
                        value={getInput(Platform.PlatformYouTube)}
                        onChange={(e) => setInput(Platform.PlatformYouTube, e.target.value)}
                    />
                    <button
                        className={`btn ${connected[Platform.PlatformYouTube] ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => void handleToggle(Platform.PlatformYouTube)}
                        disabled={!getInput(Platform.PlatformYouTube) || connecting !== null}
                    >
                        {connecting === Platform.PlatformYouTube
                            ? t('home.connecting')
                            : connected[Platform.PlatformYouTube]
                              ? t('home.disconnect')
                              : t('home.connect')}
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.platformLabel}>
                            <svg
                                className={styles.platformIcon}
                                width="16"
                                height="16"
                                viewBox="0 0 512 512"
                                fill="#53fc18"
                            >
                                <path d="M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z" />
                            </svg>
                            {t('home.kick')}
                        </span>
                        <span
                            className={`${styles.status} ${connected[Platform.PlatformKick] ? styles.connected : ''}`}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.kick_channel')}
                        value={getInput(Platform.PlatformKick)}
                        onChange={(e) => setInput(Platform.PlatformKick, e.target.value)}
                    />
                    <button
                        className={`btn ${connected[Platform.PlatformKick] ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => void handleToggle(Platform.PlatformKick)}
                        disabled={!getInput(Platform.PlatformKick) || connecting !== null}
                    >
                        {connecting === Platform.PlatformKick
                            ? t('home.connecting')
                            : connected[Platform.PlatformKick]
                              ? t('home.disconnect')
                              : t('home.connect')}
                    </button>
                </div>
            </div>

            {anyConnected && (
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/chat')}
                >
                    {t('home.open_chat')}
                </button>
            )}
        </div>
    );
}
