import type { Theme } from '@/types/theme';

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import previewStyles from '@/components/Settings/ThemePreview.module.css';
import { BUILT_IN_THEMES } from '@/types/theme';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { Caption } from '../components/Caption';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { Desktop } from '../components/Desktop';
import { SettingsPanel } from '../components/SettingsPanel';
import { byText, Stage, useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { sceneFade, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';

const NEON: Theme = {
    ...BUILT_IN_THEMES[2],
    id: 'custom-neon',
    name: 'Neon Night',
    font_family: 'IBM Plex Mono',
    font_size: 15,
    message_bg: 'rgba(30, 12, 60, 0.7)',
    message_padding: '6px 10px',
    message_radius: 10,
    message_gap: 6,
    username_weight: 700,
    text_color: '#f2ecff',
    text_shadow: '0 0 10px rgba(180, 140, 255, 0.9)',
};

const TAB = 14;
const SWITCHES = [
    { at: 55, id: 'compact' },
    { at: 105, id: 'bubble' },
    { at: 160, id: NEON.id },
];

export function Themes({ video, offset }: { video: string | null; offset: number }) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const geo = windowGeometry(1);
    const themeId = SWITCHES.filter((s) => frame >= s.at + 2).at(-1)?.id ?? 'default';

    useStage({ connected: ALL_CONNECTED, themeId, customThemes: [NEON] });

    const targets = useTargets(stageRef, {
        tab: byText('nav button', 'Themes'),
        select: (root) => root.querySelector('nav')?.parentElement?.querySelector('select'),
        editor: (root) => root.querySelector('nav')?.nextElementSibling,
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
                    step="06  THEMES"
                    title="Make it match your stream"
                    body="Pick Default, Compact or Bubble, or build your own: fonts, colors, outlines, spacing. Export it and share it."
                    width={460}
                />
                <AppWindow
                    {...geo}
                    settings={<SettingsPanel tab={frame >= TAB + 2 ? 'themes' : 'twitch'} />}
                >
                    {frame >= TAB + 2 ? (
                        <div className={previewStyles.container}>
                            <div className={previewStyles.label}>Preview</div>
                            <ChatFeed
                                script={scriptLoop(offset)}
                                header={false}
                            />
                        </div>
                    ) : (
                        <ChatFeed script={scriptLoop(offset)} />
                    )}
                </AppWindow>
                <Callout
                    rect={targets.select}
                    from={SWITCHES[0].at - 10}
                    to={SWITCHES[2].at - 6}
                    label="Built-in themes"
                    side="bottom"
                />
                <Callout
                    rect={targets.editor}
                    from={SWITCHES[2].at + 6}
                    to={durationInFrames - 15}
                    label="Or build your own"
                    side="top"
                    pad={0}
                />
                <Cursor
                    points={[
                        { at: 0, x: 1200, y: 1000 },
                        { at: TAB, x: targets.tab?.cx, y: targets.tab?.cy, click: true },
                        ...SWITCHES.map((s) => ({
                            at: s.at,
                            x: targets.select?.cx,
                            y: targets.select?.cy,
                            click: true,
                        })),
                        { at: 220, x: 1300, y: 1060 },
                    ]}
                />
            </Stage>
        </AbsoluteFill>
    );
}
