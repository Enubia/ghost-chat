import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { MemoryRouter } from 'react-router-dom';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { Home } from '@/components/Home/Home';

import { AppWindow } from '../components/AppWindow';
import { Caption } from '../components/Caption';
import { Cursor } from '../components/Cursor';
import { Desktop } from '../components/Desktop';
import { nth, byText, Stage, useStageRef, useTargets } from '../components/Stage';
import { sceneFade, typed, windowGeometry } from '../layout';
import { useStage } from '../stores';

const STEPS = [
    { platform: Platform.PlatformTwitch, text: 'nightowl_plays', focus: 20, type: 28, click: 66 },
    { platform: Platform.PlatformYouTube, text: '@NightOwlPlays', focus: 92, type: 100, click: 136 },
    { platform: Platform.PlatformKick, text: 'nightowl', focus: 162, type: 170, click: 196 },
];

const OPEN_CHAT = 236;

export function Connect({ video }: { video: string | null }) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const geo = windowGeometry(0);

    useStage({
        twitch: { default_channel: '' },
        inputs: Object.fromEntries(STEPS.map((s) => [s.platform, typed(s.text, frame, s.type)])),
        connected: Object.fromEntries(STEPS.map((s) => [s.platform, frame >= s.click + 4])),
    });

    const targets = useTargets(stageRef, {
        input0: nth('input[type=text]', 0),
        input1: nth('input[type=text]', 1),
        input2: nth('input[type=text]', 2),
        btn0: nth('button.btn', 0),
        btn1: nth('button.btn', 1),
        btn2: nth('button.btn', 2),
        open: byText('button.btn', 'Open Chat'),
    });

    const points = [
        { at: 0, x: 900, y: 700 },
        ...STEPS.flatMap((s, i) => {
            const input = targets[`input${i}` as 'input0'];
            const btn = targets[`btn${i}` as 'btn0'];

            return [
                { at: s.focus, x: input?.cx, y: input?.cy, click: true },
                { at: s.click, x: btn?.cx, y: btn?.cy, click: true },
            ];
        }),
        { at: OPEN_CHAT, x: targets.open?.cx, y: targets.open?.cy, click: true },
    ];

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Stage ref={stageRef}>
                <Desktop
                    dim={0.15}
                    video={video}
                />
                <Caption
                    step="01  CONNECT"
                    title="Connect your chats"
                    body="Type a channel name for Twitch, YouTube or Kick and hit Connect. Use one platform or all three at once."
                    note="No browser source, no extra windows."
                    noteAt={210}
                />
                <AppWindow {...geo}>
                    <MemoryRouter>
                        <Home />
                    </MemoryRouter>
                </AppWindow>
                <Cursor points={points} />
            </Stage>
        </AbsoluteFill>
    );
}
