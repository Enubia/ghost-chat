import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { useEffect, useState } from 'react';

import styles from './EventMessage.module.css';

const TWITCH_EMOTE_CDN = 'https://static-cdn.jtvnw.net/emoticons/v2';

interface Props {
    message: ChatMessageType;
    showTimestamp?: boolean;
    fade?: boolean;
    fadeTimeout?: number;
    onFaded?: (id: string) => void;
}

function formatTime(ts: string) {
    const date = new Date(ts);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function eventAccentClass(eventType: string) {
    switch (eventType) {
        case 'sub':
        case 'resub':
        case 'subgift':
        case 'submysterygift':
        case 'giftpaidupgrade':
        case 'anongiftpaidupgrade':
        case 'primepaidupgrade':
        case 'standardpayforward':
        case 'communitypayforward':
            return styles.sub;
        case 'raid':
        case 'unraid':
            return styles.raid;
        case 'announcement':
            return styles.announcement;
        default:
            return styles.other;
    }
}

function renderUserMessage(text: string, emotes: ChatMessageType['emotes']) {
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

export function EventMessage({ message, showTimestamp, fade, fadeTimeout, onFaded }: Props) {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        if (!fade || !fadeTimeout) {
            return;
        }

        const timer = setTimeout(() => setFading(true), fadeTimeout * 1000);

        return () => clearTimeout(timer);
    }, [fade, fadeTimeout]);

    const handleAnimationEnd = () => {
        if (fading) {
            onFaded?.(message.id);
        }
    };

    const accentClass = eventAccentClass(message.eventType ?? '');

    return (
        <div
            className={`${styles.event} ${accentClass} ${fading ? styles.fade : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            {showTimestamp && message.timestamp && (
                <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
            )}
            <span className={styles.systemMessage}>{message.systemMessage}</span>
            {message.text && (
                <span className={styles.userMessage}>{renderUserMessage(message.text, message.emotes)}</span>
            )}
        </div>
    );
}
