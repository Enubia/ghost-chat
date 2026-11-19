import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import ghost from '@/assets/ghost.svg';

import { Desktop } from '../components/Desktop';
import { clamp } from '../layout';

const EXTRAS = ['Channel point redemptions', 'Custom overlay sources', 'Auto-connect on startup', 'System tray'];

export function Outro({ video }: { video: string | null }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const pop = (delay: number, damping = 200) => spring({ frame: frame - delay, fps, config: { damping } });

    return (
        <AbsoluteFill style={{ opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>
            <Desktop
                dim={0.6}
                blur={14}
                video={video}
            />
            <AbsoluteFill
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 26,
                    fontFamily: 'var(--font-sans)',
                    color: '#fff',
                }}
            >
                <Img
                    src={ghost}
                    style={{
                        width: 150,
                        height: 150,
                        transform: `scale(${pop(0, 12)})`,
                        filter: 'drop-shadow(0 0 40px rgba(139, 128, 232, 0.6))',
                    }}
                />
                <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2, opacity: pop(8) }}>Ghost Chat</div>
                <div style={{ fontSize: 34, color: '#d8d8e6', opacity: pop(18) }}>
                    Free and open source · macOS and Windows
                </div>
                <div
                    style={{
                        marginTop: 10,
                        fontSize: 44,
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        opacity: pop(30),
                    }}
                >
                    getghostchat.com
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 14,
                        maxWidth: 1300,
                        marginTop: 40,
                    }}
                >
                    {EXTRAS.map((e, i) => (
                        <div
                            key={e}
                            style={{
                                opacity: pop(70 + i * 5),
                                transform: `translateY(${(1 - pop(70 + i * 5)) * 20}px)`,
                                fontSize: 26,
                                color: '#d8d8e6',
                                padding: '10px 22px',
                                borderRadius: 999,
                                background: 'rgba(30, 30, 45, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                            }}
                        >
                            + {e}
                        </div>
                    ))}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
}
