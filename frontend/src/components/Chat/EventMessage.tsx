import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { useEffect, useState } from 'react';

import { classifyEvent } from '@/filter/messageFilter';

import styles from './EventMessage.module.css';
import { renderFragments } from './renderFragments';

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

const EVENT_ACCENT_CLASS: Record<ReturnType<typeof classifyEvent>, string> = {
    sub: styles.sub,
    raid: styles.raid,
    announcement: styles.announcement,
    other: styles.other,
};

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

    const accentClass = EVENT_ACCENT_CLASS[classifyEvent(message.eventType ?? '')];

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
                <span className={styles.userMessage}>
                    {message.fragments && message.fragments.length > 0 ? (
                        renderFragments(message.fragments)
                    ) : (
                        <span>{message.text}</span>
                    )}
                </span>
            )}
        </div>
    );
}
