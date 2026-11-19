import { MemoryRouter } from 'react-router-dom';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { Home } from '@/components/Home/Home';

import { AppWindow } from '../components/AppWindow';
import { Cursor } from '../components/Cursor';
import { useStageRef, useTargets } from '../components/Stage';
import { clamp, windowGeometry } from '../layout';
import { useStage } from '../stores';
import { Explorer, SmartScreen } from './Explorer';
import { Shell } from './Shell';

const DOUBLE_CLICK = 120;
const SMARTSCREEN = 175;
const MORE_INFO = 235;
const RUN = 300;
const APP = 318;

export function Install() {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const stageRef = useStageRef();
    const appear = spring({ frame: frame - APP, fps, config: { damping: 16 } });
    const geo = windowGeometry(0);

    useStage({ twitch: { default_channel: '' }, hotkey: '' });

    const targets = useTargets(stageRef, {
        file: (root) => root.querySelector('[data-file="ghost-chat.exe"]'),
        more: (root) => root.querySelector('[data-target="more-info"]'),
        run: (root) => root.querySelector('[data-target="run-anyway"]'),
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={1}
            steps={[
                { at: 10, text: 'Download ghost-chat.exe from getghostchat.com or the GitHub releases page' },
                { at: DOUBLE_CLICK - 15, text: 'Double-click it to start Ghost Chat' },
                { at: SMARTSCREEN + 10, text: 'Windows SmartScreen warning? Click More info, then Run anyway' },
                { at: APP, text: 'Ghost Chat opens and stays on top of your other windows' },
            ]}
            note="SmartScreen appears because the app isn't signed with a Microsoft certificate. You only need to allow it once."
            noteAt={RUN - 30}
        >
            <Explorer
                selectAt={DOUBLE_CLICK}
                opacity={interpolate(frame, [0, 8, RUN + 6, RUN + 14], [0, 1, 1, 0], clamp)}
            />
            <SmartScreen
                showAt={SMARTSCREEN}
                expandAt={MORE_INFO + 2}
                hideAt={RUN + 4}
            />
            {frame >= APP && (
                <div style={{ opacity: appear, transform: `scale(${0.9 + 0.1 * appear})`, transformOrigin: '75% 50%' }}>
                    <AppWindow {...geo}>
                        <MemoryRouter>
                            <Home />
                        </MemoryRouter>
                    </AppWindow>
                </div>
            )}
            <Cursor
                points={[
                    { at: 0, x: 1300, y: 900 },
                    { at: DOUBLE_CLICK - 6, x: targets.file?.cx, y: targets.file?.cy, click: true },
                    { at: DOUBLE_CLICK, x: targets.file?.cx, y: targets.file?.cy, click: true },
                    { at: MORE_INFO, x: targets.more?.cx, y: targets.more?.cy, click: true },
                    { at: RUN, x: targets.run?.cx, y: targets.run?.cy, click: true },
                    { at: RUN + 40, x: 1100, y: 900 },
                ]}
            />
        </Shell>
    );
}
