import type React from 'react';

import type { ScriptedMessage } from '../data/messages';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { useTranslation } from 'react-i18next';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import chatStyles from '@/components/Chat/Chat.module.css';
import { ChatMessage } from '@/components/Chat/ChatMessage';
import { EventMessage } from '@/components/Chat/EventMessage';
import { fadePolicy } from '@/filter/messageFilter';
import { useConfigStore } from '@/stores/config';
import { getThemeById, themeToCSS } from '@/types/theme';

interface Props {
    script: ScriptedMessage[];
    chrome?: number;
    header?: boolean;
    hidden?: Partial<Record<Platform, boolean>>;
    fadeFrom?: number;
    pause?: { from: number; to: number; scroll: number };
}

export function ChatFeed({ script, chrome = 1, header = true, hidden = {}, fadeFrom = 0, pause }: Props) {
    const current = useCurrentFrame();
    const paused = pause !== undefined && current >= pause.from && current < pause.to;
    const frame = paused ? pause.from : current;
    const scrollBack = pause
        ? interpolate(
              current,
              [pause.from, pause.from + 12, pause.to - 12, pause.to],
              [0, pause.scroll, pause.scroll, 0],
              clamp
          )
        : 0;
    const { fps } = useVideoConfig();
    const { t } = useTranslation();
    const config = useConfigStore((s) => s.config);
    const theme = getThemeById(config?.theme?.active_theme_id ?? 'default', config?.theme?.custom_themes ?? []);
    const hideBadges = config?.twitch?.hide_badges ?? false;
    const showTimestamp = config?.general?.show_timestamps ?? false;

    const visible = script
        .filter((m) => m.at <= frame && !hidden[m.message.platform])
        .map((m) => {
            const { fade, timeoutSeconds } = fadePolicy(m.message.platform, config);
            const fadeStart = Math.max(m.at + timeoutSeconds * fps, fadeFrom);

            return { ...m, opacity: fade ? interpolate(frame, [fadeStart, fadeStart + 20], [1, 0], clamp) : 1 };
        })
        .filter((m) => m.opacity > 0)
        .slice(-30);

    return (
        <div className={chatStyles.chat}>
            {header && (
                <div
                    className={chatStyles.header}
                    style={{ opacity: chrome }}
                >
                    <button className="btn btn-ghost">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        {t('chat.back')}
                    </button>
                    <div className={chatStyles.filters}>
                        {(['T', 'YT', 'K'] as const).map((label, i) => {
                            const platform = [Platform.PlatformTwitch, Platform.PlatformYouTube, Platform.PlatformKick][
                                i
                            ];

                            return (
                                <button
                                    key={label}
                                    className={`${chatStyles.filterBtn} ${hidden[platform] ? '' : chatStyles.filterActive}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    <button className={chatStyles.vanishBtn}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle
                                cx="12"
                                cy="12"
                                r="3"
                            />
                        </svg>
                    </button>
                </div>
            )}
            <div
                className={chatStyles.messages}
                style={{ ...(themeToCSS(theme) as React.CSSProperties), overflow: 'hidden' }}
            >
                <div className={chatStyles.messagesSpacer} />
                {visible
                    .slice(0, Math.max(1, visible.length - Math.floor(scrollBack / 26)))
                    .map(({ at, message, opacity }) => {
                        const enter = interpolate(frame - at, [0, 8], [0, 1], clamp);

                        return (
                            <div
                                key={message.id}
                                style={{
                                    opacity: enter * opacity,
                                    transform: `translateY(${(1 - enter) * 10}px)`,
                                }}
                            >
                                {message.eventType ? (
                                    <EventMessage
                                        message={message}
                                        showTimestamp={showTimestamp}
                                    />
                                ) : (
                                    <ChatMessage
                                        message={message}
                                        hideBadges={hideBadges}
                                        showTimestamp={showTimestamp}
                                        showPlatformIcon
                                        showColon={theme.show_colon}
                                        showAvatars={theme.show_avatars}
                                    />
                                )}
                            </div>
                        );
                    })}
            </div>
            {paused && (
                <button className={`btn btn-ghost ${chatStyles.scrollBtn}`}>{t('chat.scroll_to_bottom')}</button>
            )}
        </div>
    );
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
