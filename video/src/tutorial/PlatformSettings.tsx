import type { Rect } from '../components/Stage';

import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { SettingsPanel } from '../components/SettingsPanel';
import { byText, toggleFor, useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { clamp, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';
import { Shell } from './Shell';

const TAB = 30;
const LOGIN = 190;
const OPEN_TWITCH = 300;
const AUTHORIZED = 380;
const STARTUP = 440;
const FILTERS = 545;
const SCROLL = 690;
const LOGIN_BUTTON = { x: 1063, y: 284 };
const OPEN_TWITCH_BUTTON = { x: 965, y: 344 };

function union(a?: Rect, b?: Rect): Rect | undefined {
    if (!a || !b) {
        return undefined;
    }

    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const width = Math.max(a.x + a.width, b.x + b.width) - x;
    const height = Math.max(a.y + a.height, b.y + b.height) - y;

    return { x, y, width, height, cx: x + width / 2, cy: y + height / 2 };
}

export function PlatformSettings() {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const auth = frame < LOGIN + 2 ? 'loggedOut' : frame < AUTHORIZED ? 'pending' : 'connected';

    useStage({
        connected: ALL_CONNECTED,
        auth,
        twitch: { connect_on_startup: frame >= STARTUP + 2 },
    });

    const targets = useTargets(stageRef, {
        tab: byText('nav button', 'Twitch'),
        code: (root) => root.querySelector('.auth-code'),
        startup: toggleFor('Connect on startup'),
        channel: (root) => byText('label', 'Default Channel')(root)?.closest('.field'),
        startupRow: (root) => byText('label', 'Connect on startup')(root)?.closest('.field-row'),
        fade: (root) => byText('label', 'Fade Messages')(root)?.closest('.field-row'),
        blacklist: (root) => byText('label', 'User Blacklist')(root)?.closest('.field'),
        events: (root) => byText('label', 'Events')(root)?.closest('.field-section'),
        eventsEnd: (root) => byText('label', 'Other Events')(root)?.closest('.field-row'),
    });

    return (
        <Shell
            stageRef={stageRef}
            chapter={7}
            game={1}
            dim={0.45}
            steps={[
                { at: 10, text: 'Twitch, YouTube and Kick each have their own tab in Settings' },
                { at: LOGIN - 40, text: 'Optional: connect your Twitch account to show channel point redemptions' },
                { at: OPEN_TWITCH - 10, text: 'Click Open Twitch and enter the code to authorize' },
                { at: STARTUP - 30, text: 'Set a Default Channel and turn on Connect on startup' },
                { at: FILTERS, text: 'Fade old messages, hide bots, commands, badges or GIFs, mute users' },
                { at: SCROLL, text: 'Choose which events show up: subs, raids, announcements' },
            ]}
        >
            <AppWindow
                {...windowGeometry(1)}
                settings={
                    <SettingsPanel
                        tab={frame >= TAB + 2 ? 'twitch' : 'general'}
                        scrollTop={interpolate(frame, [SCROLL, SCROLL + 20], [0, 420], clamp)}
                    />
                }
            >
                <ChatFeed script={scriptLoop(1100)} />
            </AppWindow>
            <Callout
                rect={targets.code}
                from={LOGIN + 8}
                to={AUTHORIZED - 6}
                label="Your one-time code"
                side="right"
                pad={4}
            />
            <Callout
                rect={union(targets.channel, targets.startupRow)}
                from={STARTUP - 26}
                to={FILTERS - 8}
                label="Auto-connect on launch"
                side="right"
            />
            <Callout
                rect={union(targets.fade, targets.blacklist)}
                from={FILTERS + 4}
                to={SCROLL - 6}
                label="Filters"
                side="right"
            />
            <Callout
                rect={union(targets.events, targets.eventsEnd)}
                from={SCROLL + 24}
                to={durationInFrames - 15}
                label="Event messages"
                side="right"
            />
            <Cursor
                points={[
                    { at: 0, x: 1150, y: 980 },
                    { at: TAB, x: targets.tab?.cx, y: targets.tab?.cy, click: true },
                    { at: LOGIN, ...LOGIN_BUTTON, click: true },
                    { at: OPEN_TWITCH, ...OPEN_TWITCH_BUTTON, click: true },
                    { at: STARTUP, x: targets.startup?.cx, y: targets.startup?.cy, click: true },
                    { at: SCROLL + 20, x: 1100, y: 980 },
                ]}
            />
        </Shell>
    );
}
