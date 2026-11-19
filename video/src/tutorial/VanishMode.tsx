import { interpolate, useCurrentFrame } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { Keycaps } from '../components/Keycaps';
import { SettingsPanel } from '../components/SettingsPanel';
import { useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { clamp, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';
import { Shell } from './Shell';

const OPEN = 40;
const HOTKEY_CLICK = 135;
const HOTKEY_SET = 175;
const CLOSE = 290;
const PRESS_IN = 400;
const CLICK = 470;
const PRESS_OUT = 560;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function VanishMode() {
    const frame = useCurrentFrame();
    const stageRef = useStageRef();
    const expand =
        interpolate(frame, [OPEN + 2, OPEN + 22], [0, 1], { ...clamp, easing: easeOut }) -
        interpolate(frame, [CLOSE + 2, CLOSE + 22], [0, 1], { ...clamp, easing: easeOut });
    const geo = windowGeometry(expand);
    const vanish =
        interpolate(frame, [PRESS_IN, PRESS_IN + 12], [0, 1], clamp) -
        interpolate(frame, [PRESS_OUT, PRESS_OUT + 12], [0, 1], clamp);
    const click = { x: geo.x + 240, y: geo.y + 560 };

    useStage({ connected: ALL_CONNECTED, hotkey: frame >= HOTKEY_SET ? 'ctrl+shift+g' : '' });

    const targets = useTargets(stageRef, {
        gear: (root) => root.querySelector('button[title="Settings"]'),
        hotkey: (root) => root.querySelector('#hotkey-input')?.parentElement,
        warning: (root) => [...root.querySelectorAll('span')].find((s) => s.textContent === 'No vanish hotkey set'),
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={5}
            game={1}
            dim={interpolate(frame, [PRESS_IN, PRESS_IN + 12, PRESS_OUT, PRESS_OUT + 12], [0.3, 0, 0, 0.3], clamp)}
            clickAt={[{ frame: CLICK, ...click }]}
            steps={[
                { at: 10, text: 'Click the gear icon to open Settings' },
                { at: HOTKEY_CLICK - 20, text: 'Click Vanish Hotkey and press your shortcut, e.g. Ctrl + Shift + G' },
                { at: CLOSE - 10, text: 'Close Settings with the gear icon' },
                { at: PRESS_IN - 20, text: 'Press the hotkey: the window turns transparent and click-through' },
                { at: PRESS_OUT - 20, text: 'Press it again to get the window back' },
            ]}
            note="The hotkey works from any app, even while your game has focus."
            noteAt={CLICK}
        >
            <AppWindow
                {...geo}
                vanish={vanish}
                settings={<SettingsPanel tab="general" />}
            >
                <ChatFeed
                    script={scriptLoop(400)}
                    chrome={1 - vanish}
                />
            </AppWindow>
            <Callout
                rect={targets.warning}
                from={OPEN + 26}
                to={HOTKEY_CLICK - 12}
                label="No hotkey set yet"
                side="bottom"
                pad={4}
            />
            <Callout
                rect={targets.hotkey}
                from={HOTKEY_CLICK - 6}
                to={CLOSE - 8}
                label="Press your shortcut here"
                side="bottom"
            />
            <Keycaps
                keys={['Ctrl', 'Shift', 'G']}
                showAt={HOTKEY_CLICK + 6}
                pressAt={[HOTKEY_SET - 4, PRESS_IN, PRESS_OUT]}
                hideAt={PRESS_OUT + 40}
                x={100}
                y={890}
            />
            <Cursor
                points={[
                    { at: 0, x: 1150, y: 900 },
                    { at: OPEN, x: targets.gear?.cx, y: targets.gear?.cy, click: true },
                    { at: HOTKEY_CLICK, x: targets.hotkey?.cx, y: targets.hotkey?.cy, click: true },
                    { at: CLOSE, x: targets.gear?.cx, y: targets.gear?.cy, click: true },
                    { at: CLICK, x: click.x, y: click.y, click: true },
                ]}
            />
        </Shell>
    );
}
