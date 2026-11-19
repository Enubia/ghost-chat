import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { Caption } from '../components/Caption';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { Desktop } from '../components/Desktop';
import { SettingsPanel } from '../components/SettingsPanel';
import { byText, Stage, useStageRef, toggleFor, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { sceneFade, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';

const TAB = 14;
const FADE = 50;
const BADGES = 125;
const BLACKLIST = 200;

export function SettingsTwitch({ video, offset }: { video: string | null; offset: number }) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const geo = windowGeometry(1);

    useStage({
        connected: ALL_CONNECTED,
        showTimestamps: true,
        fadeOthers: frame >= FADE + 2,
        twitch: {
            fade: frame >= FADE + 2,
            fade_timeout: 6,
            hide_badges: frame >= BADGES + 2,
        },
    });

    const targets = useTargets(stageRef, {
        tab: byText('nav button', 'Twitch'),
        fade: toggleFor('Fade Messages'),
        fadeRow: (root) => byText('label', 'Fade Messages')(root)?.closest('.field-row'),
        badges: toggleFor('Hide Badges'),
        badgesRow: (root) => byText('label', 'Hide Badges')(root)?.closest('.field-row'),
        blacklist: (root) => byText('label', 'User Blacklist')(root)?.closest('.field'),
    });

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Stage ref={stageRef}>
                <Desktop
                    dim={0.45}
                    game={1}
                    video={video}
                />
                <Caption
                    step="05  FILTERS"
                    title="Per-platform filters"
                    body="Fade out old messages, hide bots, commands, badges or GIFs, and block users. Set separately for Twitch, YouTube and Kick."
                    width={460}
                />
                <AppWindow
                    {...geo}
                    settings={<SettingsPanel tab={frame >= TAB + 2 ? 'twitch' : 'general'} />}
                >
                    <ChatFeed
                        script={scriptLoop(offset)}
                        fadeFrom={FADE + 2}
                    />
                </AppWindow>
                <Callout
                    rect={targets.fadeRow}
                    from={FADE + 4}
                    to={BADGES - 12}
                    label="Old messages fade away"
                    side="right"
                />
                <Callout
                    rect={targets.badgesRow}
                    from={BADGES + 4}
                    to={BLACKLIST - 12}
                    label="Badges hidden"
                    side="right"
                />
                <Callout
                    rect={targets.blacklist}
                    from={BLACKLIST + 4}
                    to={durationInFrames - 15}
                    label="Mute specific users"
                    side="right"
                />
                <Cursor
                    points={[
                        { at: 0, x: 1200, y: 1000 },
                        { at: TAB, x: targets.tab?.cx, y: targets.tab?.cy, click: true },
                        { at: FADE, x: targets.fade?.cx, y: targets.fade?.cy, click: true },
                        { at: BADGES, x: targets.badges?.cx, y: targets.badges?.cy, click: true },
                        { at: BLACKLIST, x: targets.blacklist?.cx, y: targets.blacklist?.cy },
                    ]}
                />
            </Stage>
        </AbsoluteFill>
    );
}
