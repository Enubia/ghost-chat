import { AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import ghost from '@/assets/ghost.svg';

import { Desktop } from '../components/Desktop';
import { sceneFade } from '../layout';

const PLATFORMS = [
    { name: 'Twitch', color: '#9146ff' },
    { name: 'YouTube', color: '#ff3b3b' },
    { name: 'Kick', color: '#53fc18' },
];

export function Intro({ video }: { video: string | null }) {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const pop = (delay: number, damping = 12) => spring({ frame: frame - delay, fps, config: { damping } });

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Desktop
                dim={0.55}
                blur={14}
                video={video}
            />
            <AbsoluteFill
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 28,
                    fontFamily: 'var(--font-sans)',
                    color: '#fff',
                }}
            >
                <Img
                    src={ghost}
                    style={{
                        width: 200,
                        height: 200,
                        transform: `scale(${pop(0)}) translateY(${Math.sin(frame / 14) * 6}px)`,
                        filter: 'drop-shadow(0 0 40px rgba(139, 128, 232, 0.6))',
                    }}
                />
                <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -2, opacity: pop(10, 200) }}>
                    Ghost Chat
                </div>
                <div style={{ fontSize: 40, color: '#d8d8e6', opacity: pop(22, 200) }}>
                    Your live chat, floating over your game.
                </div>
                <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
                    {PLATFORMS.map((p, i) => (
                        <div
                            key={p.name}
                            style={{
                                transform: `scale(${pop(40 + i * 6)})`,
                                fontSize: 28,
                                fontWeight: 600,
                                padding: '10px 26px',
                                borderRadius: 999,
                                color: p.color,
                                background: 'rgba(15, 15, 25, 0.75)',
                                border: `2px solid ${p.color}`,
                            }}
                        >
                            {p.name}
                        </div>
                    ))}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
}
