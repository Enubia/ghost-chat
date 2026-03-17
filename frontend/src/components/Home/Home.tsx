import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import twitchIcon from '@/assets/brands/twitch.png';
import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';
import { ConnectTwitch, ConnectYouTube, DisconnectTwitch, DisconnectYouTube } from '~/wailsjs/go/main/App';

import styles from './Home.module.css';

export function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);

    const { twitch: twitchConnected, youtube: youtubeConnected, setChannel } = useConnectionStore();
    const twitchChannel = useConnectionStore((s) => s.twitchChannel) || (config?.twitch?.default_channel ?? '');
    const youtubeInput = useConnectionStore((s) => s.youtubeInput) || (config?.youtube?.channel_id ?? '');

    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<'twitch' | 'youtube' | null>(null);

    const anyConnected = twitchConnected || youtubeConnected;

    const handleTwitchToggle = async () => {
        setError(null);
        if (twitchConnected) {
            void DisconnectTwitch();
        } else {
            setConnecting('twitch');
            try {
                await ConnectTwitch(twitchChannel);
            } catch (err) {
                setError(String(err));
            } finally {
                setConnecting(null);
            }
        }
    };

    const handleYouTubeToggle = async () => {
        setError(null);
        if (youtubeConnected) {
            void DisconnectYouTube();
        } else {
            setConnecting('youtube');
            try {
                await ConnectYouTube(youtubeInput);
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
                            <img
                                src={twitchIcon}
                                alt=""
                                className={styles.platformIcon}
                            />
                            {t('home.twitch')}
                        </span>
                        <span className={`${styles.status} ${twitchConnected ? styles.connected : ''}`} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.channel')}
                        value={twitchChannel}
                        onChange={(e) => setChannel('twitch', e.target.value)}
                    />
                    <button
                        className={`btn ${twitchConnected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleTwitchToggle}
                        disabled={!twitchChannel || connecting !== null}
                    >
                        {connecting === 'twitch'
                            ? t('home.connecting')
                            : twitchConnected
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
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            {t('home.youtube')}
                        </span>
                        <span className={`${styles.status} ${youtubeConnected ? styles.connected : ''}`} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.channel_or_url', {
                            defaultValue: '@handle, channel ID, or video URL',
                        })}
                        value={youtubeInput}
                        onChange={(e) => setChannel('youtube', e.target.value)}
                    />
                    <button
                        className={`btn ${youtubeConnected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleYouTubeToggle}
                        disabled={!youtubeInput || connecting !== null}
                    >
                        {connecting === 'youtube'
                            ? t('home.connecting')
                            : youtubeConnected
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
