import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';
import {
    ConnectKick,
    ConnectTwitch,
    ConnectYouTube,
    DisconnectKick,
    DisconnectTwitch,
    DisconnectYouTube,
} from '~/wailsjs/go/main/App';

import styles from './Home.module.css';

export function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);

    const {
        twitch: twitchConnected,
        youtube: youtubeConnected,
        kick: kickConnected,
        setChannel,
    } = useConnectionStore();
    const twitchChannel = useConnectionStore((s) => s.twitchChannel) || (config?.twitch?.default_channel ?? '');
    const youtubeInput = useConnectionStore((s) => s.youtubeInput) || (config?.youtube?.channel_id ?? '');
    const kickInput = useConnectionStore((s) => s.kickInput) || (config?.kick?.default_channel ?? '');

    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<'twitch' | 'youtube' | 'kick' | null>(null);

    const anyConnected = twitchConnected || youtubeConnected || kickConnected;

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

    const handleKickToggle = async () => {
        setError(null);
        if (kickConnected) {
            void DisconnectKick();
        } else {
            setConnecting('kick');
            try {
                await ConnectKick(kickInput);
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
                                viewBox="0 0 24 24"
                                fill="#ff0000"
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
                        <span className={`${styles.status} ${kickConnected ? styles.connected : ''}`} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('home.placeholder.kick_channel')}
                        value={kickInput}
                        onChange={(e) => setChannel('kick', e.target.value)}
                    />
                    <button
                        className={`btn ${kickConnected ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleKickToggle}
                        disabled={!kickInput || connecting !== null}
                    >
                        {connecting === 'kick'
                            ? t('home.connecting')
                            : kickConnected
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
