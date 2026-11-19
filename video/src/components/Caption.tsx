import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
    step: string;
    title: string;
    body: string;
    note?: string;
    noteAt?: number;
    width?: number;
}

export function Caption({ step, title, body, note, noteAt = 0, width = 520 }: Props) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const enter = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 200 } });
    const style = (delay: number) => ({
        opacity: enter(delay),
        transform: `translateY(${(1 - enter(delay)) * 24}px)`,
    });

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(90deg, rgba(8, 8, 16, 0.8) 0%, rgba(8, 8, 16, 0.45) 32%, rgba(8, 8, 16, 0) 50%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 110,
                    top: 0,
                    bottom: 0,
                    width,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 22,
                    fontFamily: 'var(--font-sans)',
                }}
            >
                <div
                    style={{
                        ...style(0),
                        alignSelf: 'flex-start',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 22,
                        fontWeight: 500,
                        color: 'var(--color-accent)',
                        background: 'rgba(20, 20, 30, 0.7)',
                        border: '1px solid var(--color-accent-muted)',
                        borderRadius: 999,
                        padding: '6px 18px',
                    }}
                >
                    {step}
                </div>
                <div
                    style={{
                        ...style(4),
                        fontSize: 64,
                        fontWeight: 700,
                        lineHeight: 1.08,
                        color: '#fff',
                        textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        ...style(9),
                        fontSize: 28,
                        lineHeight: 1.45,
                        color: '#d8d8e6',
                        textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
                    }}
                >
                    {body}
                </div>
                {note && (
                    <div
                        style={{
                            opacity: interpolate(frame, [noteAt, noteAt + 10], [0, 1], {
                                extrapolateLeft: 'clamp',
                                extrapolateRight: 'clamp',
                            }),
                            fontSize: 22,
                            color: 'var(--color-text-muted)',
                            borderLeft: '3px solid var(--color-accent)',
                            paddingLeft: 14,
                        }}
                    >
                        {note}
                    </div>
                )}
            </div>
        </>
    );
}
