import type React from 'react';

import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { ToggleVanish } from '@bindings/ghost-chat/app.js';
import { Events } from '@wailsio/runtime';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfigStore } from '@/stores/config';
import { useConnectionStore } from '@/stores/connection';
import { getThemeById, themeToCSS } from '@/types/theme';

import styles from './Chat.module.css';
import { ChatMessage } from './ChatMessage';
import { EventMessage } from './EventMessage';

const MAX_MESSAGES = 500;

const SUB_EVENTS = new Set([
    'sub',
    'resub',
    'subgift',
    'submysterygift',
    'giftpaidupgrade',
    'anongiftpaidupgrade',
    'primepaidupgrade',
    'standardpayforward',
    'communitypayforward',
]);

const RAID_EVENTS = new Set(['raid', 'unraid']);
const ANNOUNCEMENT_EVENTS = new Set(['announcement']);

function isEventAllowed(
    eventType: string,
    events: { subscriptions?: boolean; raids?: boolean; announcements?: boolean; other?: boolean }
): boolean {
    if (SUB_EVENTS.has(eventType)) {
        return events.subscriptions !== false;
    }

    if (RAID_EVENTS.has(eventType)) {
        return events.raids !== false;
    }

    if (ANNOUNCEMENT_EVENTS.has(eventType)) {
        return events.announcements !== false;
    }

    return events.other !== false;
}

const KNOWN_BOTS = new Set([
    'nightbot',
    'streamelements',
    'streamlabs',
    'moobot',
    'fossabot',
    'wizebot',
    'coebot',
    'deepbot',
    'phantombot',
    'stay_hydrated_bot',
    'soundalerts',
    'botrix',
    'sery_bot',
]);

export function Chat() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const autoScrollRef = useRef(true);
    const userScrollingRef = useRef(false);
    const [showTwitch, setShowTwitch] = useState(true);
    const [showYoutube, setShowYoutube] = useState(true);
    const [showKick, setShowKick] = useState(true);
    const twitchConnected = useConnectionStore((s) => s.twitch);
    const youtubeConnected = useConnectionStore((s) => s.youtube);
    const kickConnected = useConnectionStore((s) => s.kick);
    const connected = twitchConnected || youtubeConnected || kickConnected;
    const connectedCount = [twitchConnected, youtubeConnected, kickConnected].filter(Boolean).length;
    const messagesRef = useRef<HTMLDivElement>(null);

    const activeThemeId = config?.theme?.active_theme_id ?? 'default';
    const customThemes = config?.theme?.custom_themes ?? [];
    const theme = getThemeById(activeThemeId, customThemes);
    const themeCSSVars = themeToCSS(theme);

    const topToBottom = theme.top_to_bottom ?? false;

    const hideBadges = config?.twitch?.hide_badges ?? false;
    const showTimestamp = config?.general?.show_timestamps ?? false;
    const twitchFade = config?.twitch?.fade ?? false;
    const twitchFadeTimeout = config?.twitch?.fade_timeout ?? 30;
    const youtubeFade = config?.youtube?.fade ?? false;
    const youtubeFadeTimeout = config?.youtube?.fade_timeout ?? 30;
    const kickFade = config?.kick?.fade ?? false;
    const kickFadeTimeout = config?.kick?.fade_timeout ?? 30;

    useEffect(() => {
        const cancelMessage = Events.On('chat:message', (ev) => {
            const msg = ev.data as ChatMessageType;
            const cfg = useConfigStore.getState().config;
            const lowerUsername = msg.username.toLowerCase();

            if (msg.platform === 'twitch') {
                const blacklist = cfg?.twitch?.user_blacklist ?? [];
                const hideCommands = cfg?.twitch?.hide_commands ?? false;
                const showBots = cfg?.twitch?.bots ?? false;

                if (blacklist.some((u) => u.toLowerCase() === lowerUsername)) {
                    return;
                }

                if (hideCommands && msg.text.startsWith('!')) {
                    return;
                }

                if (!showBots && KNOWN_BOTS.has(lowerUsername)) {
                    return;
                }

                if (msg.eventType && !isEventAllowed(msg.eventType, cfg?.twitch?.events ?? {})) {
                    return;
                }
            } else if (msg.platform === 'youtube') {
                const blacklist = cfg?.youtube?.user_blacklist ?? [];

                if (blacklist.some((u) => u.toLowerCase() === lowerUsername)) {
                    return;
                }
            } else if (msg.platform === 'kick') {
                const blacklist = cfg?.kick?.user_blacklist ?? [];

                if (blacklist.some((u) => u.toLowerCase() === lowerUsername)) {
                    return;
                }
            }

            setMessages((prev) => {
                const next = [...prev, msg];
                if (next.length > MAX_MESSAGES) {
                    return next.slice(next.length - MAX_MESSAGES);
                }
                return next;
            });
        });

        const cancelClear = Events.On('chat:clear', (ev) => {
            const username = ev.data as string;

            setMessages((prev) => prev.filter((m) => m.username.toLowerCase() !== username.toLowerCase()));
        });

        const cancelDelete = Events.On('chat:delete-message', (ev) => {
            const msgId = ev.data as string;

            setMessages((prev) => prev.filter((m) => m.id !== msgId));
        });

        return () => {
            cancelMessage();
            cancelClear();
            cancelDelete();
        };
    }, []);

    useEffect(() => {
        if (autoScrollRef.current && !userScrollingRef.current && messagesRef.current) {
            messagesRef.current.scrollTop = topToBottom ? 0 : messagesRef.current.scrollHeight;
        }
    }, [messages, topToBottom]);

    useEffect(() => {
        const el = messagesRef.current;

        if (!el) {
            return;
        }

        let scrollTimer: ReturnType<typeof setTimeout>;

        const handleWheel = (e: WheelEvent) => {
            const scrollingAway = topToBottom ? e.deltaY > 0 : e.deltaY < 0;

            if (scrollingAway) {
                userScrollingRef.current = true;
                autoScrollRef.current = false;
                setAutoScroll(false);

                clearTimeout(scrollTimer);

                scrollTimer = setTimeout(() => {
                    userScrollingRef.current = false;
                }, 150);
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: true });

        return () => {
            el.removeEventListener('wheel', handleWheel);
            clearTimeout(scrollTimer);
        };
    }, [topToBottom]);

    const handleScroll = () => {
        const el = messagesRef.current;

        if (!el) {
            return;
        }

        let atEdge: boolean;

        if (topToBottom) {
            atEdge = el.scrollTop < 40;
        } else {
            atEdge = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }

        if (atEdge && !autoScrollRef.current) {
            autoScrollRef.current = true;
            setAutoScroll(true);
        }
    };

    const getFade = (platform: string) => {
        if (platform === 'youtube') {
            return youtubeFade;
        }

        if (platform === 'kick') {
            return kickFade;
        }

        return twitchFade;
    };

    const getFadeTimeout = (platform: string) => {
        if (platform === 'youtube') {
            return youtubeFadeTimeout;
        }

        if (platform === 'kick') {
            return kickFadeTimeout;
        }

        return twitchFadeTimeout;
    };

    const displayMessages = topToBottom ? [...messages].toReversed() : messages;

    const visibleMessages = displayMessages.filter((m) => {
        if (m.platform === 'twitch') {
            return showTwitch;
        }

        if (m.platform === 'youtube') {
            return showYoutube;
        }

        if (m.platform === 'kick') {
            return showKick;
        }

        return true;
    });

    return (
        <div className={styles.chat}>
            <div className={styles.header}>
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/')}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t('chat.back')}
                </button>
                {connectedCount > 1 && (
                    <div className={styles.filters}>
                        {twitchConnected && (
                            <button
                                className={`${styles.filterBtn} ${showTwitch ? styles.filterActive : ''}`}
                                onClick={() => setShowTwitch((v) => !v)}
                                title="Toggle Twitch messages"
                            >
                                T
                            </button>
                        )}
                        {youtubeConnected && (
                            <button
                                className={`${styles.filterBtn} ${showYoutube ? styles.filterActive : ''}`}
                                onClick={() => setShowYoutube((v) => !v)}
                                title="Toggle YouTube messages"
                            >
                                YT
                            </button>
                        )}
                        {kickConnected && (
                            <button
                                className={`${styles.filterBtn} ${showKick ? styles.filterActive : ''}`}
                                onClick={() => setShowKick((v) => !v)}
                                title="Toggle Kick messages"
                            >
                                K
                            </button>
                        )}
                    </div>
                )}
                <button
                    className={styles.vanishBtn}
                    onClick={() => void ToggleVanish()}
                    title={t('chat.vanish')}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                        />
                    </svg>
                </button>
                {!connected && <span className={styles.disconnected}>{t('chat.disconnected')}</span>}
            </div>
            <div
                ref={messagesRef}
                className={styles.messages}
                style={themeCSSVars as React.CSSProperties}
                onScroll={handleScroll}
            >
                {!topToBottom && <div className={styles.messagesSpacer} />}
                {visibleMessages.length === 0
                    ? config?.general?.show_waiting_message !== false && (
                          <div className={styles.empty}>
                              <span>{t('chat.waiting')}</span>
                          </div>
                      )
                    : visibleMessages.map((msg) =>
                          msg.eventType ? (
                              <EventMessage
                                  key={msg.id}
                                  message={msg}
                                  showTimestamp={showTimestamp}
                                  fade={getFade(msg.platform)}
                                  fadeTimeout={getFadeTimeout(msg.platform)}
                                  onFaded={(id) => setMessages((prev) => prev.filter((m) => m.id !== id))}
                              />
                          ) : (
                              <ChatMessage
                                  key={msg.id}
                                  message={msg}
                                  hideBadges={hideBadges}
                                  showTimestamp={showTimestamp}
                                  showPlatformIcon={connectedCount > 1}
                                  showColon={theme.show_colon}
                                  showAvatars={theme.show_avatars}
                                  fade={getFade(msg.platform)}
                                  fadeTimeout={getFadeTimeout(msg.platform)}
                                  onFaded={(id) => setMessages((prev) => prev.filter((m) => m.id !== id))}
                              />
                          )
                      )}
            </div>
            {!autoScroll && (
                <button
                    className={`btn btn-ghost ${styles.scrollBtn}`}
                    onClick={() => {
                        autoScrollRef.current = true;
                        setAutoScroll(true);
                        messagesRef.current?.scrollTo({
                            top: topToBottom ? 0 : messagesRef.current.scrollHeight,
                            behavior: 'smooth',
                        });
                    }}
                >
                    {topToBottom ? t('chat.scroll_to_top') : t('chat.scroll_to_bottom')}
                </button>
            )}
        </div>
    );
}
