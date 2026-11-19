import type React from 'react';

import type { Rect } from './Stage';

import { interpolate, useCurrentFrame } from 'remotion';

interface Props {
    rect?: Rect;
    from: number;
    to: number;
    label: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    pad?: number;
}

export function Callout({ rect, from, to, label, side = 'left', pad = 8 }: Props) {
    const frame = useCurrentFrame();

    if (!rect || frame < from || frame > to + 10) {
        return null;
    }

    const opacity = interpolate(frame, [from, from + 8, to, to + 10], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const box = {
        left: rect.x - pad,
        top: rect.y - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
    };
    const labelPos: Record<string, React.CSSProperties> = {
        left: { right: 1920 - box.left + 18, top: rect.cy, transform: 'translateY(-50%)' },
        right: { left: box.left + box.width + 18, top: rect.cy, transform: 'translateY(-50%)' },
        top: { left: rect.cx, bottom: 1080 - box.top + 14, transform: 'translateX(-50%)' },
        bottom: { left: rect.cx, top: box.top + box.height + 14, transform: 'translateX(-50%)' },
    };

    return (
        <div style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
            <div
                style={{
                    position: 'absolute',
                    ...box,
                    borderRadius: 10,
                    border: '3px solid var(--color-accent)',
                    boxShadow: '0 0 0 6px rgba(139, 128, 232, 0.25), 0 0 30px rgba(139, 128, 232, 0.5)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    ...labelPos[side],
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'var(--color-accent)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
            >
                {label}
            </div>
        </div>
    );
}
