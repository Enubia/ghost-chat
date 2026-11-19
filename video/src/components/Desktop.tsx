import type React from 'react';

import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';

import ghost from '@/assets/ghost.svg';

import { GameScene } from './GameScene';

export const TASKBAR = 52;

interface Props {
    dim?: number;
    blur?: number;
    game?: number;
    video?: string | null;
    clickAt?: { frame: number; x: number; y: number }[];
}

function Wallpaper() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0 }}
        >
            <defs>
                <linearGradient
                    id="wp"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop
                        offset="0"
                        stopColor="#0a1030"
                    />
                    <stop
                        offset="0.6"
                        stopColor="#141a4a"
                    />
                    <stop
                        offset="1"
                        stopColor="#0b2236"
                    />
                </linearGradient>
                <filter id="soft">
                    <feGaussianBlur stdDeviation="40" />
                </filter>
            </defs>
            <rect
                width="1920"
                height="1080"
                fill="url(#wp)"
            />
            <g filter="url(#soft)">
                <path
                    d="M-100 820 C 300 520, 700 980, 1100 640 S 1800 380, 2050 560 L 2050 760 C 1700 620, 1400 900, 1000 860 S 300 980, -100 1000 Z"
                    fill="#3b5bdb"
                    opacity="0.55"
                />
                <path
                    d="M-100 420 C 400 260, 800 620, 1250 420 S 1850 160, 2050 260 L 2050 420 C 1700 360, 1300 640, 900 600 S 200 520, -100 600 Z"
                    fill="#7b4fd6"
                    opacity="0.45"
                />
                <ellipse
                    cx="1450"
                    cy="760"
                    rx="420"
                    ry="200"
                    fill="#1fb5c9"
                    opacity="0.3"
                />
            </g>
        </svg>
    );
}

function Icon({ children, active, open }: { children: React.ReactNode; active?: boolean; open?: boolean }) {
    return (
        <div
            style={{
                position: 'relative',
                width: 44,
                height: 44,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            }}
        >
            {children}
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 1,
                        width: active ? 16 : 6,
                        height: 3,
                        borderRadius: 2,
                        background: active ? '#8ab4ff' : '#9a9aa8',
                    }}
                />
            )}
        </div>
    );
}

function Taskbar({ game }: { game: number }) {
    const glyph = { width: 26, height: 26 };

    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: TASKBAR,
                background: 'rgba(28, 30, 42, 0.92)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                color: '#e8e8f0',
            }}
        >
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Icon>
                    <svg
                        {...glyph}
                        viewBox="0 0 24 24"
                    >
                        {[
                            [3, 3],
                            [13, 3],
                            [3, 13],
                            [13, 13],
                        ].map(([x, y]) => (
                            <rect
                                key={`${x}${y}`}
                                x={x}
                                y={y}
                                width="8"
                                height="8"
                                rx="2"
                                fill="#7fb2ff"
                            />
                        ))}
                    </svg>
                </Icon>
                <div
                    style={{
                        width: 190,
                        height: 34,
                        borderRadius: 17,
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '0 14px',
                        fontSize: 15,
                        color: '#a8a8b8',
                        margin: '0 4px',
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#c8c8d4"
                        strokeWidth="2.4"
                    >
                        <circle
                            cx="10"
                            cy="10"
                            r="7"
                        />
                        <path d="M15 15l6 6" />
                    </svg>
                    Search
                </div>
                <Icon>
                    <svg
                        {...glyph}
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
                            fill="#f4c34a"
                        />
                    </svg>
                </Icon>
                <Icon>
                    <svg
                        {...glyph}
                        viewBox="0 0 24 24"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="#2f8fe8"
                        />
                        <path
                            d="M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20"
                            stroke="#d6ecff"
                            strokeWidth="1.4"
                            fill="none"
                        />
                    </svg>
                </Icon>
                <Icon
                    open={game > 0}
                    active={game > 0}
                >
                    <svg
                        {...glyph}
                        viewBox="0 0 24 24"
                    >
                        <rect
                            width="24"
                            height="24"
                            rx="6"
                            fill="#3a1f5c"
                        />
                        <circle
                            cx="12"
                            cy="11"
                            r="6"
                            fill="#ffe3b0"
                        />
                        <path
                            d="M0 19l7-5 5 3 5-4 7 5v6H0z"
                            fill="#160b24"
                        />
                    </svg>
                </Icon>
                <Icon open>
                    <Img
                        src={ghost}
                        style={glyph}
                    />
                </Icon>
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: 14,
                }}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d0d0dc"
                    strokeWidth="2.4"
                >
                    <path d="M6 15l6-6 6 6" />
                </svg>
                <Img
                    data-tray
                    src={ghost}
                    style={{ width: 20, height: 20 }}
                />
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e0e0ea"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
                    <circle
                        cx="12"
                        cy="19.5"
                        r="1"
                        fill="#e0e0ea"
                    />
                </svg>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e0e0ea"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <path
                        d="M4 9h4l5-4v14l-5-4H4z"
                        fill="#e0e0ea"
                    />
                    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
                </svg>
                <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                    <div>9:41 PM</div>
                    <div>11/19/2026</div>
                </div>
            </div>
        </div>
    );
}

function GameWindow({ open, video }: { open: number; video?: string | null }) {
    if (open <= 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: TASKBAR,
                opacity: open,
                transform: `scale(${0.94 + 0.06 * open})`,
                display: 'flex',
                flexDirection: 'column',
                background: '#000',
            }}
        >
            <div
                style={{
                    height: 34,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#1c1c24',
                    color: '#d8d8e2',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    paddingLeft: 14,
                    gap: 10,
                }}
            >
                <div style={{ width: 16, height: 16, borderRadius: 4, background: '#3a1f5c' }} />
                <span style={{ flex: 1 }}>Moonwell</span>
                {['─', '☐', '✕'].map((g) => (
                    <span
                        key={g}
                        style={{ width: 46, textAlign: 'center', fontSize: 14, color: '#c8c8d4' }}
                    >
                        {g}
                    </span>
                ))}
            </div>
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                <GameScene video={video} />
            </div>
        </div>
    );
}

export function Desktop({ dim = 0, blur = 0, game = 0, video, clickAt = [] }: Props) {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill
            style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: blur ? 'scale(1.05)' : undefined }}
        >
            <Wallpaper />
            <GameWindow
                open={game}
                video={video}
            />
            {clickAt.map((c) => {
                const t = interpolate(frame - c.frame, [0, 24], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                return frame >= c.frame && t < 1 ? (
                    <div
                        key={c.frame}
                        style={{
                            position: 'absolute',
                            left: c.x - 70,
                            top: c.y - 70,
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            border: '4px solid #ffd27a',
                            boxShadow: '0 0 30px #ffb36b',
                            transform: `scale(${0.3 + t})`,
                            opacity: 1 - t,
                        }}
                    />
                ) : null;
            })}
            <AbsoluteFill style={{ background: `rgba(8, 8, 16, ${dim})`, bottom: TASKBAR }} />
            <Taskbar game={game} />
        </AbsoluteFill>
    );
}
