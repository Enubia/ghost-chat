import { interpolate, useCurrentFrame } from 'remotion';

import ghost from '@/assets/ghost.svg';

import { clamp } from '../layout';

const FONT = "'Segoe UI', var(--font-sans)";

export const EXPLORER = { x: 760, y: 150, width: 1000, height: 600 };

export function Explorer({ selectAt, opacity }: { selectAt: number; opacity: number }) {
    const frame = useCurrentFrame();
    const selected = frame >= selectAt;

    return (
        <div
            style={{
                position: 'absolute',
                left: EXPLORER.x,
                top: EXPLORER.y,
                width: EXPLORER.width,
                height: EXPLORER.height,
                opacity,
                fontFamily: FONT,
                color: '#e8e8ee',
                background: '#202028',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, fontSize: 15 }}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
                        fill="#f4c34a"
                    />
                </svg>
                <span style={{ flex: 1 }}>Downloads</span>
                {['─', '☐', '✕'].map((g) => (
                    <span
                        key={g}
                        style={{ width: 40, textAlign: 'center', color: '#b8b8c4' }}
                    >
                        {g}
                    </span>
                ))}
            </div>
            <div
                style={{
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    gap: 12,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: 15,
                    color: '#b8b8c4',
                }}
            >
                <span>←</span>
                <span>→</span>
                <span>↑</span>
                <div
                    style={{
                        flex: 1,
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: '#2b2b35',
                    }}
                >
                    This PC › Downloads
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex' }}>
                <div
                    style={{
                        width: 200,
                        padding: 12,
                        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: 15,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                    }}
                >
                    {['Home', 'Desktop', 'Downloads', 'Documents', 'Pictures', 'Videos'].map((item) => (
                        <div
                            key={item}
                            style={{
                                padding: '7px 10px',
                                borderRadius: 6,
                                background: item === 'Downloads' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, padding: '10px 16px', fontSize: 15 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 200px 140px',
                            color: '#9a9aa8',
                            padding: '6px 10px',
                            fontSize: 13,
                        }}
                    >
                        <span>Name</span>
                        <span>Date modified</span>
                        <span>Type</span>
                    </div>
                    {[
                        { name: 'ghost-chat.exe', type: 'Application', icon: ghost },
                        { name: 'stream-overlay.png', type: 'PNG File' },
                        { name: 'alerts-pack.zip', type: 'Compressed folder' },
                    ].map((file) => (
                        <div
                            key={file.name}
                            data-file={file.name}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 200px 140px',
                                alignItems: 'center',
                                padding: '8px 10px',
                                borderRadius: 6,
                                background: selected && file.icon ? 'rgba(96, 160, 255, 0.25)' : 'transparent',
                                border: `1px solid ${selected && file.icon ? 'rgba(96, 160, 255, 0.5)' : 'transparent'}`,
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {file.icon ? (
                                    <img
                                        src={file.icon}
                                        style={{ width: 22, height: 22 }}
                                    />
                                ) : (
                                    <span
                                        style={{
                                            width: 18,
                                            height: 22,
                                            borderRadius: 3,
                                            background: '#5a5a6a',
                                            display: 'inline-block',
                                            margin: '0 2px',
                                        }}
                                    />
                                )}
                                {file.name}
                            </span>
                            <span style={{ color: '#b8b8c4' }}>11/19/2026 9:32 PM</span>
                            <span style={{ color: '#b8b8c4' }}>{file.type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SmartScreen({ showAt, expandAt, hideAt }: { showAt: number; expandAt: number; hideAt: number }) {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [showAt, showAt + 6, hideAt, hideAt + 6], [0, 1, 1, 0], clamp);
    const expanded = frame >= expandAt;

    if (opacity <= 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: EXPLORER.x + 170,
                top: EXPLORER.y + 70,
                width: 660,
                minHeight: 440,
                opacity,
                fontFamily: FONT,
                background: '#1a5fa8',
                color: '#fff',
                padding: '40px 44px 28px',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
            }}
        >
            <div style={{ fontSize: 34, fontWeight: 300 }}>Windows protected your PC</div>
            <div style={{ fontSize: 17, lineHeight: 1.5 }}>
                Microsoft Defender SmartScreen prevented an unrecognized app from starting. Running this app might put
                your PC at risk.
            </div>
            <div style={{ position: 'relative', fontSize: 17, lineHeight: 1.7 }}>
                <div
                    data-target="more-info"
                    style={{
                        position: 'absolute',
                        textDecoration: 'underline',
                        visibility: expanded ? 'hidden' : 'visible',
                    }}
                >
                    More info
                </div>
                <div style={{ visibility: expanded ? 'visible' : 'hidden' }}>
                    <div>App: ghost-chat.exe</div>
                    <div>Publisher: Unknown publisher</div>
                </div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <div
                    data-target="run-anyway"
                    style={{
                        padding: '8px 26px',
                        border: '2px solid #fff',
                        fontSize: 16,
                        visibility: expanded ? 'visible' : 'hidden',
                    }}
                >
                    Run anyway
                </div>
                <div style={{ padding: '8px 26px', background: 'rgba(255, 255, 255, 0.2)', fontSize: 16 }}>
                    Don't run
                </div>
            </div>
        </div>
    );
}
