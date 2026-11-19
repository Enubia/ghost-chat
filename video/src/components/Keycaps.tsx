import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
    keys: string[];
    showAt: number;
    pressAt: number[];
    hideAt: number;
    x: number;
    y: number;
}

export function Keycaps({ keys, showAt, pressAt, hideAt, x, y }: Props) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const appear = spring({ frame: frame - showAt, fps, config: { damping: 14 } });
    const hide = interpolate(frame, [hideAt, hideAt + 8], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const pressed = pressAt.some((p) => frame >= p && frame < p + 6);

    if (frame < showAt || hide <= 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                display: 'flex',
                gap: 14,
                opacity: hide,
                transform: `scale(${appear})`,
                transformOrigin: 'left center',
            }}
        >
            {keys.map((k) => (
                <div
                    key={k}
                    style={{
                        minWidth: 84,
                        height: 84,
                        padding: '0 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 38,
                        fontWeight: 600,
                        color: '#fff',
                        background: pressed ? '#5f56b8' : '#2f2f3d',
                        borderRadius: 14,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: pressed ? '0 2px 0 #1b1b24' : '0 7px 0 #1b1b24, 0 12px 30px rgba(0, 0, 0, 0.5)',
                        transform: `translateY(${pressed ? 5 : 0}px)`,
                    }}
                >
                    {k}
                </div>
            ))}
        </div>
    );
}
