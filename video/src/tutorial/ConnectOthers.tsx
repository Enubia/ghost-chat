import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentFrame } from 'remotion';

import { Home } from '@/components/Home/Home';

import { AppWindow } from '../components/AppWindow';
import { Cursor } from '../components/Cursor';
import { byText, nth, useStageRef, useTargets } from '../components/Stage';
import { typed, windowGeometry } from '../layout';
import { useStage } from '../stores';
import { Shell } from './Shell';

const YT_TYPE = 30;
const YT_CLICK = 105;
const YT_LIVE = 210;
const KICK_TYPE = 260;
const KICK_CLICK = 300;
const OPEN = 395;

export function ConnectOthers() {
    const frame = useCurrentFrame();
    const stageRef = useStageRef();

    useStage({
        hotkey: '',
        inputs: {
            [Platform.PlatformTwitch]: 'nightowl_plays',
            [Platform.PlatformYouTube]: typed('@NightOwlPlays', frame, YT_TYPE),
            [Platform.PlatformKick]: typed('nightowl', frame, KICK_TYPE),
        },
        waiting: { [Platform.PlatformYouTube]: frame >= YT_CLICK + 4 && frame < YT_LIVE },
        connected: {
            [Platform.PlatformTwitch]: true,
            [Platform.PlatformYouTube]: frame >= YT_LIVE,
            [Platform.PlatformKick]: frame >= KICK_CLICK + 4,
        },
    });

    const targets = useTargets(stageRef, {
        ytInput: nth('input[type=text]', 1),
        ytButton: nth('button.btn', 1),
        kickInput: nth('input[type=text]', 2),
        kickButton: nth('button.btn', 2),
        open: byText('button.btn', 'Open Chat'),
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={3}
            steps={[
                { at: 10, text: 'YouTube takes a channel @handle, a channel ID or a live video URL' },
                { at: YT_CLICK + 6, text: 'Not live yet? Ghost Chat waits and joins as soon as the stream starts' },
                { at: KICK_TYPE - 10, text: 'Kick works like Twitch: channel name, then Connect' },
                { at: OPEN - 24, text: 'Click Open Chat to switch to the chat view' },
            ]}
        >
            <AppWindow {...windowGeometry(0)}>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </AppWindow>
            <Cursor
                points={[
                    { at: 0, x: 1150, y: 760 },
                    { at: YT_TYPE - 6, x: targets.ytInput?.cx, y: targets.ytInput?.cy, click: true },
                    { at: YT_CLICK, x: targets.ytButton?.cx, y: targets.ytButton?.cy, click: true },
                    { at: KICK_TYPE - 6, x: targets.kickInput?.cx, y: targets.kickInput?.cy, click: true },
                    { at: KICK_CLICK, x: targets.kickButton?.cx, y: targets.kickButton?.cy, click: true },
                    { at: OPEN, x: targets.open?.cx, y: targets.open?.cy, click: true },
                ]}
            />
        </Shell>
    );
}
