import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import ghost from '@/assets/ghost.svg';

import { Desktop } from '../components/Desktop';
import { clamp, sceneFade } from '../layout';

export function TitleCard() {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const pop = (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Desktop
                dim={0.55}
                blur={14}
            />
            <AbsoluteFill
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 22,
                    fontFamily: 'var(--font-sans)',
                    color: '#fff',
                }}
            >
                <Img
                    src={ghost}
                    style={{ width: 170, height: 170, transform: `scale(${pop(0, 12)})` }}
                />
                <div style={{ fontSize: 88, fontWeight: 700, opacity: pop(8) }}>Getting started with Ghost Chat</div>
                <div style={{ fontSize: 34, color: '#d8d8e6', opacity: pop(18) }}>Windows setup, step by step</div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
}

const TIPS = [
    {
        title: 'Chat not showing over your game?',
        body: 'Run the game in windowed or borderless fullscreen. Exclusive fullscreen blocks every overlay.',
    },
    {
        title: 'Streaming it?',
        body: 'Add a Window Capture source in your streaming software and pick Ghost Chat. Transparency carries over.',
    },
    {
        title: 'Something broken?',
        body: 'Settings, Report a bug. No GitHub account needed, and you preview everything before it is sent.',
    },
    {
        title: 'Where are my settings?',
        body: 'In %APPDATA%\\ghost-chat\\config.json. The tray menu has Open Config Folder.',
    },
];

export function Tips() {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Desktop
                dim={0.6}
                blur={14}
            />
            <AbsoluteFill
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 40,
                    fontFamily: 'var(--font-sans)',
                    color: '#fff',
                }}
            >
                <div style={{ fontSize: 60, fontWeight: 700, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
                    Good to know
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '600px 600px', gap: 28 }}>
                    {TIPS.map((tip, i) => {
                        const appear = spring({ frame: frame - 15 - i * 150, fps, config: { damping: 200 } });

                        return (
                            <div
                                key={tip.title}
                                style={{
                                    opacity: appear,
                                    transform: `translateY(${(1 - appear) * 24}px)`,
                                    padding: '28px 32px',
                                    borderRadius: 14,
                                    background: 'rgba(30, 30, 45, 0.85)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                }}
                            >
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-accent)' }}>
                                    {tip.title}
                                </div>
                                <div style={{ fontSize: 24, lineHeight: 1.45, color: '#d8d8e6' }}>{tip.body}</div>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
}

export function EndCard() {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const pop = (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });

    return (
        <AbsoluteFill style={{ opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
            <Desktop
                dim={0.6}
                blur={14}
            />
            <AbsoluteFill
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 24,
                    fontFamily: 'var(--font-sans)',
                    color: '#fff',
                }}
            >
                <Img
                    src={ghost}
                    style={{ width: 150, height: 150, transform: `scale(${pop(0, 12)})` }}
                />
                <div style={{ fontSize: 88, fontWeight: 700, opacity: pop(8) }}>You're all set</div>
                <div style={{ fontSize: 34, color: '#d8d8e6', opacity: pop(18) }}>
                    Questions, ideas or bugs: github.com/Enubia/ghost-chat
                </div>
                <div style={{ fontSize: 44, fontWeight: 600, color: 'var(--color-accent)', opacity: pop(28) }}>
                    getghostchat.com
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
}
