import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { useCurrentFrame } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { byText, useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';
import { Shell } from './Shell';

const HIDE = 230;
const SHOW = 290;
const PAUSE = 345;
const RESUME = 470;

export function ChatWindow() {
    const frame = useCurrentFrame();
    const stageRef = useStageRef();
    const geo = windowGeometry(0);

    useStage({ connected: ALL_CONNECTED, hotkey: '' });

    const targets = useTargets(stageRef, {
        yt: byText('button', 'YT'),
        filters: (root) => byText('button', 'T')(root)?.parentElement,
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={4}
            steps={[
                { at: 10, text: 'Every platform lands in one feed. The small icon shows where a message came from' },
                { at: HIDE - 30, text: 'Click T, YT or K to hide or show a platform' },
                { at: PAUSE - 6, text: 'Scroll up to pause the chat. Scroll to bottom jumps back to live' },
            ]}
        >
            <AppWindow {...geo}>
                <ChatFeed
                    script={scriptLoop(60)}
                    hidden={{ [Platform.PlatformYouTube]: frame >= HIDE && frame < SHOW }}
                    pause={{ from: PAUSE, to: RESUME, scroll: 160 }}
                />
            </AppWindow>
            <Callout
                rect={targets.filters}
                from={HIDE - 20}
                to={SHOW + 20}
                label="Platform filters"
                side="left"
            />
            <Cursor
                points={[
                    { at: 60, x: 1150, y: 900 },
                    { at: HIDE, x: targets.yt?.cx, y: targets.yt?.cy, click: true },
                    { at: SHOW, x: targets.yt?.cx, y: targets.yt?.cy, click: true },
                    { at: PAUSE, x: geo.x + 300, y: geo.y + 500 },
                    { at: RESUME, x: geo.x + 210 * geo.scale, y: geo.y + 662 * geo.scale, click: true },
                ]}
            />
        </Shell>
    );
}
