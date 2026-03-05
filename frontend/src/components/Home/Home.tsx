import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import twitchIcon from '@/assets/brands/twitch.png';
import { useConfigStore } from '@/stores/config';

import styles from './Home.module.css';

interface PlatformState {
    twitch: { channel: string; connected: boolean };
    youtube: { channelId: string; connected: boolean };
    external: { url: string; connected: boolean };
}

export function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);
    const [platforms, setPlatforms] = useState<PlatformState>({
        twitch: { channel: config?.twitch?.default_channel ?? '', connected: false },
        youtube: { channelId: config?.youtube?.default_channel_id ?? '', connected: false },
        external: { url: config?.external?.default_url ?? '', connected: false },
    });

    const anyConnected = platforms.twitch.connected || platforms.youtube.connected || platforms.external.connected;

    const handleConnect = (platform: keyof PlatformState) => {
        setPlatforms((prev) => ({
            ...prev,
            [platform]: { ...prev[platform], connected: !prev[platform].connected },
        }));
    };

    return (
        <div className={styles.home}>
            <div className={styles.cards}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.platformLabel}>
                            <img
                                src={twitchIcon}
                                alt=""
                                className={styles.platformIcon}
                            />
                            {t('home.twitch')}
                        </span>
                        <span className={`${styles.status} ${platforms.twitch.connected ? styles.connected : ''}`} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.channel')}
                        value={platforms.twitch.channel}
                        onChange={(e) =>
                            setPlatforms((p) => ({ ...p, twitch: { ...p.twitch, channel: e.target.value } }))
                        }
                    />
                    <button
                        className={`btn ${platforms.twitch.connected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => handleConnect('twitch')}
                        disabled={!platforms.twitch.channel}
                    >
                        {platforms.twitch.connected ? t('home.disconnect') : t('home.connect')}
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.platformLabel}>
                            <svg
                                className={styles.platformIcon}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            {t('home.youtube')}
                        </span>
                        <span className={`${styles.status} ${platforms.youtube.connected ? styles.connected : ''}`} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.channel_id')}
                        value={platforms.youtube.channelId}
                        onChange={(e) =>
                            setPlatforms((p) => ({ ...p, youtube: { ...p.youtube, channelId: e.target.value } }))
                        }
                    />
                    <button
                        className={`btn ${platforms.youtube.connected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => handleConnect('youtube')}
                        disabled={!platforms.youtube.channelId}
                    >
                        {platforms.youtube.connected ? t('home.disconnect') : t('home.connect')}
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.platformLabel}>
                            <svg
                                className={styles.platformIcon}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                />
                                <line
                                    x1="2"
                                    y1="12"
                                    x2="22"
                                    y2="12"
                                />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            {t('home.external')}
                        </span>
                        <span className={`${styles.status} ${platforms.external.connected ? styles.connected : ''}`} />
                    </div>
                    <input
                        type="url"
                        placeholder={t('home.placeholder.url')}
                        value={platforms.external.url}
                        onChange={(e) =>
                            setPlatforms((p) => ({ ...p, external: { ...p.external, url: e.target.value } }))
                        }
                    />
                    <button
                        className={`btn ${platforms.external.connected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => handleConnect('external')}
                        disabled={!platforms.external.url}
                    >
                        {platforms.external.connected ? t('home.disconnect') : t('home.connect')}
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
