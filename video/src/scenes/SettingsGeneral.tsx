import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { Caption } from '../components/Caption';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { Desktop } from '../components/Desktop';
import { Keycaps } from '../components/Keycaps';
import { SettingsPanel } from '../components/SettingsPanel';
import { Stage, useStageRef, toggleFor, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { clamp, sceneFade, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';

const GEAR = 20;
const HOTKEY_CLICK = 80;
const HOTKEY_SET = 104;
const TIMESTAMPS = 160;

export function SettingsGeneral({ video, offset }: { video: string | null; offset: number }) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const expand = interpolate(frame, [GEAR + 2, GEAR + 22], [0, 1], {
        ...clamp,
        easing: (t) => 1 - (1 - t) ** 3,
    });
    const geo = windowGeometry(expand);

    useStage({
        connected: ALL_CONNECTED,
        hotkey: frame >= HOTKEY_SET ? 'ctrl+shift+g' : '',
        showTimestamps: frame >= TIMESTAMPS + 2,
    });

    const targets = useTargets(stageRef, {
        gear: (root) => root.querySelector('button[title="Settings"]'),
        hotkey: (root) => root.querySelector('#hotkey-input')?.parentElement,
        timestamps: toggleFor('Show Timestamps'),
    });
    const main = {
        x: geo.x + geo.settingsWidth * geo.scale,
        y: geo.y + 38 * geo.scale,
        width: (geo.width - geo.settingsWidth) * geo.scale,
        height: (geo.height - 38) * geo.scale,
    };

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Stage ref={stageRef}>
                <Desktop
                    dim={0.45}
                    game={1}
                    video={video}
                />
                <Caption
                    step="04  SETTINGS"
                    title="Tweak it live"
                    body="Settings open right next to your chat, so you see every change as you make it."
                    width={460}
                />
                <AppWindow
                    {...geo}
                    settings={<SettingsPanel tab="general" />}
                >
                    <ChatFeed script={scriptLoop(offset)} />
                </AppWindow>
                <Keycaps
                    keys={['Ctrl', 'Shift', 'G']}
                    showAt={HOTKEY_CLICK + 6}
                    pressAt={[HOTKEY_SET - 4]}
                    hideAt={TIMESTAMPS - 20}
                    x={110}
                    y={850}
                />
                <Callout
                    rect={targets.hotkey}
                    from={HOTKEY_CLICK - 10}
                    to={TIMESTAMPS - 15}
                    label="Global vanish hotkey"
                    side="bottom"
                />
                <Callout
                    rect={{ ...main, cx: main.x + main.width / 2, cy: main.y + main.height / 2 }}
                    from={TIMESTAMPS + 6}
                    to={durationInFrames - 15}
                    label="Timestamps show up instantly"
                    side="top"
                    pad={0}
                />
                <Cursor
                    points={[
                        { at: 0, x: 1500, y: 1060 },
                        { at: GEAR, x: targets.gear?.cx, y: targets.gear?.cy, click: true },
                        { at: HOTKEY_CLICK, x: targets.hotkey?.cx, y: targets.hotkey?.cy, click: true },
                        { at: TIMESTAMPS, x: targets.timestamps?.cx, y: targets.timestamps?.cy, click: true },
                    ]}
                />
            </Stage>
        </AbsoluteFill>
    );
}
