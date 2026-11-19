import type { Theme } from '@/types/theme';

import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import previewStyles from '@/components/Settings/ThemePreview.module.css';
import { BUILT_IN_THEMES } from '@/types/theme';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { SettingsPanel } from '../components/SettingsPanel';
import { byText, useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { clamp, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';
import { Shell } from './Shell';

const TAB = 20;
const COMPACT = 70;
const BUBBLE = 115;
const DUPLICATE = 180;
const DRAG_START = 320;
const DRAG_END = 380;
const SCROLL = 450;

export function ThemesChapter() {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();
    const fontSize = Math.round(interpolate(frame, [DRAG_START, DRAG_END], [16, 21], clamp));
    const copy: Theme = { ...BUILT_IN_THEMES[2], id: 'custom-copy', name: 'Bubble (copy)', font_size: fontSize };
    const duplicated = frame >= DUPLICATE + 2;
    const themeId = duplicated
        ? copy.id
        : frame >= BUBBLE + 2
          ? 'bubble'
          : frame >= COMPACT + 2
            ? 'compact'
            : 'default';

    useStage({ connected: ALL_CONNECTED, themeId, customThemes: duplicated ? [copy] : [] });

    const targets = useTargets(stageRef, {
        tab: byText('nav button', 'Themes'),
        select: (root) => root.querySelector('nav')?.parentElement?.querySelector('select'),
        duplicate: byText('button', 'Duplicate'),
        slider: (root) => root.querySelector('nav')?.parentElement?.querySelector('input[type=range]'),
        share: (root) => byText('button', 'Export')(root)?.parentElement,
    });
    const slider = targets.slider;
    const thumb = (size: number) => (slider ? slider.x + (slider.width * (size - 8)) / 16 : undefined);

    return (
        <Shell
            stageRef={stageRef}
            chapter={8}
            game={1}
            dim={0.45}
            steps={[
                { at: 10, text: 'Open the Themes tab and pick Default, Compact or Bubble' },
                { at: DUPLICATE - 20, text: 'Built-in themes are read-only. Click Duplicate to get an editable copy' },
                { at: DRAG_START - 15, text: 'Adjust fonts, sizes, colors and outlines. The preview updates live' },
                { at: SCROLL, text: 'Export a theme to share it, Import to load one' },
            ]}
        >
            <AppWindow
                {...windowGeometry(1)}
                settings={
                    <SettingsPanel
                        tab={frame >= TAB + 2 ? 'themes' : 'twitch'}
                        scrollTop={interpolate(frame, [SCROLL, SCROLL + 20], [0, 3000], clamp)}
                    />
                }
            >
                {frame >= TAB + 2 ? (
                    <div className={previewStyles.container}>
                        <div className={previewStyles.label}>Preview</div>
                        <ChatFeed
                            script={scriptLoop(1300)}
                            header={false}
                        />
                    </div>
                ) : (
                    <ChatFeed script={scriptLoop(1300)} />
                )}
            </AppWindow>
            <Callout
                rect={targets.share}
                from={SCROLL + 24}
                to={durationInFrames - 15}
                label="Share your theme"
                side="right"
            />
            <Cursor
                points={[
                    { at: 0, x: 1100, y: 980 },
                    { at: TAB, x: targets.tab?.cx, y: targets.tab?.cy, click: true },
                    { at: COMPACT, x: targets.select?.cx, y: targets.select?.cy, click: true },
                    { at: BUBBLE, x: targets.select?.cx, y: targets.select?.cy, click: true },
                    { at: DUPLICATE, x: targets.duplicate?.cx, y: targets.duplicate?.cy, click: true },
                    { at: DRAG_START, x: thumb(16), y: slider?.cy, click: true },
                    { at: DRAG_END, x: thumb(21), y: slider?.cy },
                    { at: SCROLL - 4, x: 1150, y: 980 },
                ]}
            />
        </Shell>
    );
}
