import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { Home } from '@/components/Home/Home';
import { useConfigStore } from '@/stores/config';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { Cursor } from '../components/Cursor';
import { byText, nth, useStageRef, useTargets } from '../components/Stage';
import { typed, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';
import { Shell } from './Shell';

const TYPE = 170;
const CLICK = 260;

export function CustomOverlay() {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const url = typed('https://my-chat-widget.example.com', frame, TYPE, 1.5);

    useStage({
        customUrl: url,
        connected: ALL_CONNECTED,
        inputs: { [Platform.PlatformYouTube]: '@NightOwlPlays', [Platform.PlatformKick]: 'nightowl' },
    });

    const storedUrl = useConfigStore((s) => s.config?.custom_source?.url ?? '');

    const targets = useTargets(stageRef, {
        input: nth('input[type=text]', 3),
        open: byText('button.btn', 'Open Overlay'),
        card: (root) => byText('button.btn', 'Open Overlay')(root)?.parentElement,
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={9}
            steps={[
                { at: 10, text: 'Already have a chat widget or overlay you like? Use Custom Overlay' },
                { at: TYPE - 10, text: 'Paste its http(s) URL' },
                { at: CLICK - 20, text: 'Click Open Overlay to show it in the Ghost Chat window' },
            ]}
            note="Some sites block embedding and show up blank. That's the site's choice, not a bug."
            noteAt={CLICK + 70}
        >
            <AppWindow {...windowGeometry(0)}>
                <MemoryRouter>
                    <Home key={storedUrl} />
                </MemoryRouter>
            </AppWindow>
            <Callout
                rect={targets.card}
                from={20}
                to={durationInFrames - 20}
                label="Custom Overlay"
                side="left"
            />
            <Cursor
                points={[
                    { at: 0, x: 1150, y: 900 },
                    { at: TYPE - 8, x: targets.input?.cx, y: targets.input?.cy, click: true },
                    { at: CLICK, x: targets.open?.cx, y: targets.open?.cy, click: true },
                ]}
            />
        </Shell>
    );
}
