import { AppWindow } from '../components/AppWindow';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';
import { Shell } from './Shell';
import { TrayMenu } from './TrayMenu';

const OPEN = 60;
const HOVERS = [
    { at: 150, item: 'Show/Hide' },
    { at: 245, item: 'Center on Screen' },
    { at: 370, item: 'Toggle Vanish' },
    { at: 485, item: 'Quit' },
];
const CLOSE = 570;

export function Tray() {
    const stageRef = useStageRef();

    useStage({ connected: ALL_CONNECTED });

    const targets = useTargets(stageRef, {
        tray: (root) => root.querySelector('[data-tray]'),
        ...Object.fromEntries(
            HOVERS.map((h) => [h.item, (root: HTMLElement) => root.querySelector(`[data-tray-item="${h.item}"]`)])
        ),
    });
    const tray = targets.tray;

    return (
        <Shell
            stageRef={stageRef}
            chapter={6}
            game={1}
            dim={0.3}
            steps={[
                { at: 10, text: 'Ghost Chat also lives in the system tray. Click its icon' },
                { at: HOVERS[0].at, text: 'Show/Hide brings the window back' },
                { at: HOVERS[1].at, text: 'Center on Screen rescues a window that ended up off-screen' },
                { at: HOVERS[2].at, text: 'Toggle Vanish works here too, no hotkey needed' },
                { at: HOVERS[3].at, text: 'Quit closes Ghost Chat completely' },
            ]}
            note="Settings, General, Hide from taskbar keeps it in the tray only."
            noteAt={CLOSE}
        >
            <AppWindow {...windowGeometry(0)}>
                <ChatFeed script={scriptLoop(850)} />
            </AppWindow>
            {tray && (
                <TrayMenu
                    openAt={OPEN + 2}
                    closeAt={CLOSE}
                    hover={HOVERS}
                    right={1920 - tray.cx - 40}
                    bottom={1080 - tray.y + 14}
                />
            )}
            <Cursor
                points={[
                    { at: 0, x: 1150, y: 900 },
                    { at: OPEN, x: tray?.cx, y: tray?.cy, click: true },
                    ...HOVERS.map((h) => ({
                        at: h.at,
                        x: targets[h.item as 'tray']?.cx,
                        y: targets[h.item as 'tray']?.cy,
                    })),
                    { at: CLOSE, x: 1450, y: 820 },
                ]}
            />
        </Shell>
    );
}
