import { OffthreadVideo, random, staticFile, useCurrentFrame } from 'remotion';

import { HEIGHT, WIDTH } from './Stage';

function ridge(seed: string, base: number, amp: number, offset: number, step = 40) {
    const points: string[] = [`0,${HEIGHT}`];

    for (let x = -step; x <= WIDTH + step; x += step) {
        const u = (x + offset) / WIDTH;
        const h =
            Math.sin(u * 5.1 + random(seed) * 6) * 0.5 +
            Math.sin(u * 11.3 + random(`${seed}b`) * 6) * 0.3 +
            Math.sin(u * 23.7 + random(`${seed}c`) * 6) * 0.2;

        points.push(`${x},${base - h * amp}`);
    }

    points.push(`${WIDTH},${HEIGHT}`);

    return points.join(' ');
}

function Landscape() {
    const frame = useCurrentFrame();
    const drift = frame * 0.6;
    const stars = Array.from({ length: 140 }, (_, i) => ({
        x: random(`sx${i}`) * WIDTH,
        y: random(`sy${i}`) * HEIGHT * 0.55,
        r: 0.6 + random(`sr${i}`) * 1.6,
        tw: 0.5 + 0.5 * Math.sin(frame / 12 + random(`st${i}`) * 10),
    }));
    const embers = Array.from({ length: 40 }, (_, i) => {
        const speed = 0.6 + random(`ev${i}`) * 1.2;
        const y = HEIGHT - ((frame * speed + random(`ey${i}`) * HEIGHT) % (HEIGHT * 0.8));

        return { x: random(`ex${i}`) * WIDTH + Math.sin(frame / 20 + i) * 20, y, r: 1.5 + random(`er${i}`) * 2.5 };
    });

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0 }}
        >
            <defs>
                <linearGradient
                    id="sky"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0"
                        stopColor="#0b0b25"
                    />
                    <stop
                        offset="0.45"
                        stopColor="#2b1d5c"
                    />
                    <stop
                        offset="0.75"
                        stopColor="#8a3b6b"
                    />
                    <stop
                        offset="1"
                        stopColor="#f08a4b"
                    />
                </linearGradient>
                <radialGradient id="moon">
                    <stop
                        offset="0"
                        stopColor="#fff6e0"
                    />
                    <stop
                        offset="0.35"
                        stopColor="#ffe3b0"
                        stopOpacity="0.9"
                    />
                    <stop
                        offset="1"
                        stopColor="#ffb070"
                        stopOpacity="0"
                    />
                </radialGradient>
                <linearGradient
                    id="fog"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0"
                        stopColor="#f08a4b"
                        stopOpacity="0"
                    />
                    <stop
                        offset="1"
                        stopColor="#f6a56a"
                        stopOpacity="0.35"
                    />
                </linearGradient>
            </defs>
            <rect
                width={WIDTH}
                height={HEIGHT}
                fill="url(#sky)"
            />
            {stars.map((s, i) => (
                <circle
                    key={i}
                    cx={s.x}
                    cy={s.y}
                    r={s.r}
                    fill="#fff"
                    opacity={0.3 + 0.6 * s.tw}
                />
            ))}
            <circle
                cx={760}
                cy={430}
                r={260}
                fill="url(#moon)"
            />
            <circle
                cx={760}
                cy={430}
                r={92}
                fill="#fff1d6"
            />
            <polygon
                points={ridge('far', 640, 120, drift * 0.3)}
                fill="#4a2a63"
            />
            <rect
                y={500}
                width={WIDTH}
                height={300}
                fill="url(#fog)"
            />
            <polygon
                points={ridge('mid', 760, 140, drift * 0.7)}
                fill="#2c1840"
            />
            <polygon
                points={ridge('near', 900, 110, drift * 1.4, 24)}
                fill="#160b24"
            />
            {embers.map((e, i) => (
                <circle
                    key={i}
                    cx={e.x}
                    cy={e.y}
                    r={e.r}
                    fill="#ffb36b"
                    opacity={0.7}
                />
            ))}
        </svg>
    );
}

function Hud() {
    const frame = useCurrentFrame();
    const hp = 0.72 + Math.sin(frame / 40) * 0.05;

    return (
        <div style={{ position: 'absolute', inset: 0, fontFamily: 'var(--font-sans)', color: '#fff' }}>
            <div style={{ position: 'absolute', left: 48, top: 40, width: 360 }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LV 27 NIGHTOWL</div>
                {[
                    ['#e0475a', hp],
                    ['#4a8cff', 0.55],
                ].map(([color, value]) => (
                    <div
                        key={color as string}
                        style={{
                            height: 16,
                            marginBottom: 8,
                            borderRadius: 4,
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                        }}
                    >
                        <div
                            style={{
                                width: `${(value as number) * 100}%`,
                                height: '100%',
                                borderRadius: 3,
                                background: color as string,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 36,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 10,
                }}
            >
                {Array.from({ length: 6 }, (_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 8,
                            background: 'rgba(10, 6, 20, 0.6)',
                            border: `2px solid ${i === 1 ? '#ffd27a' : 'rgba(255, 255, 255, 0.25)'}`,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            padding: 4,
                            fontSize: 14,
                            opacity: 0.9,
                        }}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GameScene({ video }: { video?: string | null }) {
    return video ? (
        <OffthreadVideo
            src={video.startsWith('http') ? video : staticFile(video)}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    ) : (
        <>
            <Landscape />
            <Hud />
        </>
    );
}
