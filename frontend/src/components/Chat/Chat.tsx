import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfigStore } from '@/stores/config';
import { EventsOn } from '~/wailsjs/runtime/runtime';

import styles from './Chat.module.css';
import { ChatMessage } from './ChatMessage';

const MAX_MESSAGES = 500;

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
    const [connected, setConnected] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const messagesRef = useRef<HTMLDivElement>(null);

    const hideBadges = config?.twitch?.hide_badges ?? false;
    const showTimestamp = config?.general?.show_timestamps ?? false;
    const fade = config?.twitch?.fade ?? false;
    const fadeTimeout = config?.twitch?.fade_timeout ?? 30;

    useEffect(() => {
        const cancelMessage = EventsOn('chat:message', (msg: ChatMessageType) => {
            const cfg = useConfigStore.getState().config;
            const blacklist = cfg?.twitch?.user_blacklist ?? [];
            const hideCommands = cfg?.twitch?.hide_commands ?? false;
            const showBots = cfg?.twitch?.bots ?? false;

            const lowerUsername = msg.username.toLowerCase();

            if (blacklist.some((u) => u.toLowerCase() === lowerUsername)) {
                return;
            }
            if (hideCommands && msg.text.startsWith('!')) {
                return;
            }
            if (!showBots && KNOWN_BOTS.has(lowerUsername)) {
                return;
            }

            setMessages((prev) => {
                const next = [...prev, msg];
                if (next.length > MAX_MESSAGES) {
                    return next.slice(next.length - MAX_MESSAGES);
                }
                return next;
            });
        });

        const cancelConnected = EventsOn('chat:connected', () => {
            setConnected(true);
        });

        const cancelDisconnected = EventsOn('chat:disconnected', () => {
            setConnected(false);
        });

        const cancelClear = EventsOn('chat:clear', (username: string) => {
            setMessages((prev) => prev.filter((m) => m.username.toLowerCase() !== username.toLowerCase()));
        });

        const cancelDelete = EventsOn('chat:delete-message', (msgId: string) => {
            setMessages((prev) => prev.filter((m) => m.id !== msgId));
        });

        return () => {
            cancelMessage();
            cancelConnected();
            cancelDisconnected();
            cancelClear();
            cancelDelete();
        };
    }, []);

    useEffect(() => {
        if (autoScroll && messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages, autoScroll]);

    const handleScroll = () => {
        const el = messagesRef.current;
        if (!el) {
            return;
        }
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        setAutoScroll(atBottom);
    };

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
                {!connected && <span className={styles.disconnected}>{t('chat.disconnected')}</span>}
            </div>
            <div
                ref={messagesRef}
                className={styles.messages}
                onScroll={handleScroll}
            >
                {messages.length === 0 ? (
                    <div className={styles.empty}>
                        <span>{t('chat.waiting')}</span>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            hideBadges={hideBadges}
                            showTimestamp={showTimestamp}
                            fade={fade}
                            fadeTimeout={fadeTimeout}
                            onFaded={(id) => setMessages((prev) => prev.filter((m) => m.id !== id))}
                        />
                    ))
                )}
            </div>
            {!autoScroll && (
                <button
                    className={`btn btn-ghost ${styles.scrollBtn}`}
                    onClick={() => {
                        setAutoScroll(true);
                        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
                    }}
                >
                    {t('chat.scroll_to_bottom')}
                </button>
            )}
        </div>
    );
}
