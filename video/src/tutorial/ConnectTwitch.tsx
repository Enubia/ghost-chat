import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { Home } from '@/components/Home/Home';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { Cursor } from '../components/Cursor';
import { nth, useStageRef, useTargets } from '../components/Stage';
import { typed, windowGeometry } from '../layout';
import { useStage } from '../stores';
import { Shell } from './Shell';

const FOCUS = 30;
const TYPE = 40;
const CLICK = 105;

export function ConnectTwitch() {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();

    useStage({
        twitch: { default_channel: '' },
        hotkey: '',
        inputs: { [Platform.PlatformTwitch]: typed('nightowl_plays', frame, TYPE) },
        connected: { [Platform.PlatformTwitch]: frame >= CLICK + 4 },
    });

    const targets = useTargets(stageRef, {
        input: nth('input[type=text]', 0),
        button: nth('button.btn', 0),
        card: (root) => root.querySelector('input[type=text]')?.parentElement,
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={2}
            steps={[
                { at: 10, text: 'Type the Twitch channel you want to read chat from' },
                { at: CLICK - 14, text: 'Click Connect' },
                { at: CLICK + 20, text: 'The dot turns green once chat is connected' },
            ]}
            note="No login needed. Chat connects anonymously."
            noteAt={40}
        >
            <AppWindow {...windowGeometry(0)}>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </AppWindow>
            <Callout
                rect={targets.card}
                from={CLICK + 20}
                to={durationInFrames - 20}
                label="Connected"
                side="left"
            />
            <Cursor
                points={[
                    { at: 0, x: 1100, y: 900 },
                    { at: FOCUS, x: targets.input?.cx, y: targets.input?.cy, click: true },
                    { at: CLICK, x: targets.button?.cx, y: targets.button?.cy, click: true },
                    { at: CLICK + 50, x: 1150, y: 760 },
                ]}
            />
        </Shell>
    );
}
