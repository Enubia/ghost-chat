import type React from 'react';

import type { Badge, ChatMessage as ChatMessageType, MessageFragment } from '@/types/chat';

import { useEffect, useState } from 'react';

import styles from './ChatMessage.module.css';

const TWITCH_EMOTE_CDN = 'https://static-cdn.jtvnw.net/emoticons/v2';

interface Props {
    message: ChatMessageType;
    hideBadges?: boolean;
    showTimestamp?: boolean;
    showPlatformIcon?: boolean;
    showColon?: boolean;
    showAvatars?: boolean;
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

function isDark(hex: string): boolean {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function platformClass(platform: string) {
    if (platform === 'twitch') {
        return styles.twitch;
    }
    if (platform === 'youtube') {
        return styles.youtube;
    }
    return '';
}

function renderTextWithEmotes(text: string, emotes: ChatMessageType['emotes']) {
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

function renderFragments(fragments: MessageFragment[]) {
    return (
        <span>
            {fragments.map((frag, i) =>
                frag.type === 'emote' ? (
                    <img
                        key={i}
                        className={styles.emote}
                        src={frag.url}
                        alt={frag.text}
                        title={frag.text}
                    />
                ) : (
                    <span key={i}>{frag.text}</span>
                )
            )}
        </span>
    );
}

function BadgeList({ badges, hidden }: { badges: Badge[]; hidden?: boolean }) {
    if (hidden || !badges || badges.length === 0) {
        return null;
    }
    return (
        <span className={styles.badges}>
            {badges.map((badge) =>
                badge.url ? (
                    <img
                        key={`${badge.name}-${badge.version}`}
                        className={styles.badgeImg}
                        src={badge.url}
                        alt={badge.name}
                        title={badge.version || badge.name}
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
    );
}

function KickIcon() {
    return (
        <svg
            className={styles.platformIcon}
            viewBox="0 0 512 512"
            fill="#53fc18"
            aria-hidden="true"
        >
            <path d="M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z" />
        </svg>
    );
}

function TwitchIcon() {
    return (
        <svg
            className={styles.platformIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg
            className={styles.platformIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

function PlatformIcon({ platform }: { platform: string }) {
    if (platform === 'twitch') {
        return <TwitchIcon />;
    }
    if (platform === 'youtube') {
        return <YouTubeIcon />;
    }
    if (platform === 'kick') {
        return <KickIcon />;
    }
    return null;
}

export function ChatMessage({
    message,
    hideBadges,
    showTimestamp,
    showPlatformIcon,
    showColon = true,
    showAvatars = true,
    fade,
    fadeTimeout,
    onFaded,
}: Props) {
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

    const pc = platformClass(message.platform);
    const wrapperClass = `${styles.message} ${pc} ${fading ? styles.fade : ''}`;
    const body =
        message.fragments && message.fragments.length > 0
            ? renderFragments(message.fragments)
            : renderTextWithEmotes(message.text, message.emotes);

    if (message.superChat) {
        const { headerColor, bodyColor, amount } = message.superChat;
        const headerTextColor = isDark(headerColor) ? '#ffffff' : 'rgba(0,0,0,0.87)';
        const bodyTextColor = isDark(bodyColor) ? '#ffffff' : 'rgba(0,0,0,0.87)';
        return (
            <div
                className={`${styles.message} ${styles.superChatWrapper} ${pc} ${fading ? styles.fade : ''}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <div
                    className={styles.superChatHeader}
                    style={{ background: headerColor, color: headerTextColor }}
                >
                    {message.avatar && (
                        <img
                            className={styles.avatar}
                            src={message.avatar}
                            alt=""
                        />
                    )}
                    <span className={styles.superChatUsername}>{message.username}</span>
                    <span className={styles.superChatAmount}>{amount}</span>
                </div>
                {message.fragments && message.fragments.length > 0 && (
                    <div
                        className={styles.superChatBody}
                        style={{ background: bodyColor, color: bodyTextColor }}
                    >
                        {body}
                    </div>
                )}
            </div>
        );
    }

    if (message.membershipEvent) {
        return (
            <div
                className={`${styles.message} ${styles.membershipWrapper} ${pc} ${fading ? styles.fade : ''}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <BadgeList
                    badges={message.badges}
                    hidden={hideBadges}
                />
                {message.avatar && (
                    <img
                        className={styles.avatar}
                        src={message.avatar}
                        alt=""
                    />
                )}
                <span className={styles.membershipUsername}>{message.username}</span>
                <span className={styles.membershipText}>{body}</span>
            </div>
        );
    }

    return (
        <div
            className={`${wrapperClass} ${message.isAction ? styles.action : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            {showTimestamp && message.timestamp && (
                <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
            )}
            {showPlatformIcon && <PlatformIcon platform={message.platform} />}
            {showAvatars && message.avatar && (
                <img
                    className={styles.avatar}
                    src={message.avatar}
                    alt=""
                />
            )}
            <BadgeList
                badges={message.badges}
                hidden={hideBadges}
            />
            <span
                className={styles.username}
                style={{ color: message.color || 'var(--color-accent)' }}
            >
                {message.username}
            </span>
            <span className={styles.separator}>{message.isAction ? ' ' : showColon ? ': ' : ' '}</span>
            <span className={styles.text}>{body}</span>
        </div>
    );
}
