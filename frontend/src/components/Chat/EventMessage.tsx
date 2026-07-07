import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    redemption: styles.redemption,
    other: styles.other,
};

export function EventMessage({ message, showTimestamp, fade, fadeTimeout, onFaded }: Props) {
    const { t } = useTranslation();
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

    const category = classifyEvent(message.eventType ?? '');
    const accentClass = EVENT_ACCENT_CLASS[category];

    const headline =
        category === 'redemption'
            ? t('chat.redemption', {
                  user: message.username,
                  reward: message.eventData?.reward ?? '',
                  cost: message.eventData?.cost ?? '',
              })
            : message.systemMessage;

    return (
        <div
            className={`${styles.event} ${accentClass} ${fading ? styles.fade : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            {showTimestamp && message.timestamp && (
                <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
            )}
            <span className={styles.systemMessage}>{headline}</span>
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
