import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Caption } from '../components/Caption';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { Desktop } from '../components/Desktop';
import { Keycaps } from '../components/Keycaps';
import { Stage } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { clamp, sceneFade, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';

const PRESS_IN = 60;
const PRESS_OUT = 262;
const CLICK = 150;

export function Vanish({ video, offset }: { video: string | null; offset: number }) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const geo = windowGeometry(0);
    const vanish =
        interpolate(frame, [PRESS_IN, PRESS_IN + 12], [0, 1], clamp) -
        interpolate(frame, [PRESS_OUT, PRESS_OUT + 12], [0, 1], clamp);
    const dim = interpolate(frame, [PRESS_IN, PRESS_IN + 12, PRESS_OUT, PRESS_OUT + 12], [0.3, 0, 0, 0.45], clamp);
    const game = interpolate(frame, [4, 20], [0, 1], clamp);
    const click = { x: geo.x + 260, y: geo.y + 520 };
    const labelOpacity = interpolate(frame, [CLICK, CLICK + 8, CLICK + 70, CLICK + 80], [0, 1, 1, 0], clamp);

    useStage({ connected: ALL_CONNECTED });

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Stage>
                <Desktop
                    dim={dim}
                    game={game}
                    video={video}
                    clickAt={[{ frame: CLICK, ...click }]}
                />
                <Caption
                    step="03  VANISH MODE"
                    title="Chat floats over your game"
                    body="Press your hotkey and the window turns transparent and click-through. Your clicks go straight to the game underneath."
                    note="Press it again to bring the window back."
                    noteAt={PRESS_OUT - 20}
                />
                <Keycaps
                    keys={['Ctrl', 'Shift', 'G']}
                    showAt={30}
                    pressAt={[PRESS_IN, PRESS_OUT]}
                    hideAt={durationInFrames - 30}
                    x={110}
                    y={850}
                />
                <AppWindow
                    {...geo}
                    vanish={vanish}
                >
                    <ChatFeed
                        script={scriptLoop(offset)}
                        chrome={1 - vanish}
                    />
                </AppWindow>
                <div
                    style={{
                        position: 'absolute',
                        right: 1920 - geo.x + 30,
                        top: click.y - 24,
                        opacity: labelOpacity,
                        fontFamily: 'var(--font-sans)',
                        fontSize: 26,
                        fontWeight: 600,
                        color: '#fff',
                        background: 'var(--color-accent)',
                        padding: '8px 18px',
                        borderRadius: 8,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    Clicks pass right through
                </div>
                <Cursor
                    points={[
                        { at: 100, x: 1000, y: 1000 },
                        { at: CLICK, x: click.x, y: click.y, click: true },
                        { at: 230, x: 1000, y: 1060 },
                    ]}
                />
            </Stage>
        </AbsoluteFill>
    );
}
