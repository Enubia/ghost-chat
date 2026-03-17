import type React from 'react';

import type { ChatMessage as ChatMessageType, Emote } from '@/types/chat';

import styles from './ChatMessage.module.css';

const TWITCH_EMOTE_CDN = 'https://static-cdn.jtvnw.net/emoticons/v2';

interface Props {
    message: ChatMessageType;
    hideBadges?: boolean;
    fade?: boolean;
    fadeTimeout?: number;
}

function renderTextWithEmotes(text: string, emotes: Emote[]) {
    if (!emotes || emotes.length === 0) {
        return <span>{text}</span>;
    }

    const sorted = [...emotes].toSorted((a, b) => a.start - b.start);
    const parts: (string | React.ReactElement)[] = [];
    let cursor = 0;

    for (const emote of sorted) {
        if (emote.start > cursor) {
            parts.push(text.slice(cursor, emote.start));
        }
        const emoteName = text.slice(emote.start, emote.end + 1);
        parts.push(
            <img
                key={`${emote.id}-${emote.start}`}
                className={styles.emote}
                src={emote.url || `${TWITCH_EMOTE_CDN}/${emote.id}/default/dark/1.0`}
                alt={emoteName}
                title={emoteName}
            />
        );
        cursor = emote.end + 1;
    }

    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }

    return <span>{parts}</span>;
}

export function ChatMessage({ message, hideBadges, fade, fadeTimeout }: Props) {
    const fadeStyle = fade && fadeTimeout ? { animationDelay: `${fadeTimeout}s`, animationDuration: '1s' } : undefined;

    return (
        <div
            className={`${styles.message} ${message.isAction ? styles.action : ''} ${fade ? styles.fade : ''}`}
            style={fadeStyle}
        >
            {!hideBadges && message.badges && message.badges.length > 0 && (
                <span className={styles.badges}>
                    {message.badges.map((badge) =>
                        badge.url ? (
                            <img
                                key={`${badge.name}-${badge.version}`}
                                className={styles.badgeImg}
                                src={badge.url}
                                alt={badge.name}
                                title={badge.name}
                            />
                        ) : (
                            <span
                                key={`${badge.name}-${badge.version}`}
                                className={styles.badge}
                                title={badge.name}
                            >
                                {badge.name}
                            </span>
                        )
                    )}
                </span>
            )}
            <span
                className={styles.username}
                style={{ color: message.color || 'var(--color-accent)' }}
            >
                {message.username}
            </span>
            <span className={styles.separator}>{message.isAction ? ' ' : ': '}</span>
            <span className={styles.text}>{renderTextWithEmotes(message.text, message.emotes)}</span>
        </div>
    );
}
