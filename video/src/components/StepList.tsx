import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { clamp } from '../layout';

export interface Step {
    at: number;
    text: string;
}

interface Props {
    chapter: string;
    title: string;
    steps: Step[];
    note?: string;
    noteAt?: number;
    width?: number;
}

export function StepList({ chapter, title, steps, note, noteAt = 0, width = 500 }: Props) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const enter = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 200 } });
    const active = steps.findLastIndex((s) => frame >= s.at);

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(90deg, rgba(8, 8, 16, 0.88) 0%, rgba(8, 8, 16, 0.6) 30%, rgba(8, 8, 16, 0) 48%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 100,
                    top: 0,
                    bottom: 52,
                    width,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 18,
                    fontFamily: 'var(--font-sans)',
                }}
            >
                <div
                    style={{
                        opacity: enter(0),
                        fontFamily: 'var(--font-mono)',
                        fontSize: 20,
                        fontWeight: 500,
                        color: 'var(--color-accent)',
                        letterSpacing: 1,
                    }}
                >
                    {chapter}
                </div>
                <div
                    style={{
                        opacity: enter(4),
                        transform: `translateY(${(1 - enter(4)) * 20}px)`,
                        fontSize: 54,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: '#fff',
                        marginBottom: 12,
                    }}
                >
                    {title}
                </div>
                {steps.map((step, i) => {
                    const appear = interpolate(frame, [step.at, step.at + 10], [0, 1], clamp);
                    const isActive = i === active;
                    const done = i < active;

                    return (
                        <div
                            key={step.text}
                            style={{
                                opacity: appear * (isActive ? 1 : 0.55),
                                transform: `translateX(${(1 - appear) * -20}px)`,
                                display: 'flex',
                                gap: 16,
                                alignItems: 'flex-start',
                            }}
                        >
                            <div
                                style={{
                                    flexShrink: 0,
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 19,
                                    fontWeight: 700,
                                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                                    background: isActive ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                }}
                            >
                                {done ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: 27, lineHeight: 1.4, color: '#ececf4', paddingTop: 1 }}>
                                {step.text}
                            </div>
                        </div>
                    );
                })}
                {note && (
                    <div
                        style={{
                            opacity: interpolate(frame, [noteAt, noteAt + 10], [0, 1], clamp),
                            marginTop: 10,
                            fontSize: 21,
                            lineHeight: 1.45,
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
