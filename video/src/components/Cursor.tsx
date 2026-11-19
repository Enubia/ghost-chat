import { Easing, interpolate, useCurrentFrame } from 'remotion';

export interface Waypoint {
    at: number;
    x?: number;
    y?: number;
    click?: boolean;
}

const TRAVEL = 18;

export function Cursor({ points }: { points: Waypoint[] }) {
    const frame = useCurrentFrame();
    const resolved = points.filter((p): p is Required<Waypoint> => p.x !== undefined && p.y !== undefined);

    if (resolved.length === 0) {
        return null;
    }

    let x = resolved[0].x;
    let y = resolved[0].y;

    for (let i = 1; i < resolved.length; i++) {
        const prev = resolved[i - 1];
        const next = resolved[i];
        const start = Math.max(prev.at, next.at - TRAVEL);
        const t = interpolate(frame, [start, next.at], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.cubic),
        });

        if (frame >= start) {
            x = prev.x + (next.x - prev.x) * t;
            y = prev.y + (next.y - prev.y) * t;
        }
    }

    const clicks = resolved.filter((p) => p.click);
    const lastClick = clicks.filter((p) => p.at <= frame).at(-1);
    const sinceClick = lastClick ? frame - lastClick.at : Infinity;
    const press = interpolate(sinceClick, [0, 3, 8], [1, 0.82, 1], { extrapolateRight: 'clamp' });
    const ripple = interpolate(sinceClick, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <>
            {lastClick && sinceClick < 18 && (
                <div
                    style={{
                        position: 'absolute',
                        left: lastClick.x - 40,
                        top: lastClick.y - 40,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        border: '3px solid rgba(139, 128, 232, 0.9)',
                        transform: `scale(${0.2 + ripple})`,
                        opacity: 1 - ripple,
                    }}
                />
            )}
            <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                style={{
                    position: 'absolute',
                    left: x - 6,
                    top: y - 3,
                    transform: `scale(${press})`,
                    transformOrigin: '6px 3px',
                    filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))',
                }}
            >
                <path
                    d="M5 2.5v17.2l4.6-4.4 2.9 6.6 2.8-1.2-2.9-6.5h6.4z"
                    fill="#fff"
                    stroke="#111"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
}
