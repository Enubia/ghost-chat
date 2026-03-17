import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfigStore } from '@/stores/config';
import { EventsOn } from '~/wailsjs/runtime/runtime';

import styles from './Chat.module.css';
import { ChatMessage } from './ChatMessage';

const MAX_MESSAGES = 500;

export function Chat() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const config = useConfigStore((s) => s.config);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [connected, setConnected] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const messagesRef = useRef<HTMLDivElement>(null);

    const blacklist = config?.twitch?.user_blacklist ?? [];
    const hideBadges = config?.twitch?.hide_badges ?? false;
    const hideCommands = config?.twitch?.hide_commands ?? false;
    const fade = config?.twitch?.fade ?? false;
    const fadeTimeout = config?.twitch?.fade_timeout ?? 30;

    useEffect(() => {
        const cancelMessage = EventsOn('chat:message', (msg: ChatMessageType) => {
            if (blacklist.includes(msg.username.toLowerCase())) {
                return;
            }
            if (hideCommands && msg.text.startsWith('!')) {
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
    }, [blacklist, hideCommands]);

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
                            fade={fade}
                            fadeTimeout={fadeTimeout}
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
