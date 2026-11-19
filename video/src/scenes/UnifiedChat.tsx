import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { AppWindow } from '../components/AppWindow';
import { Callout } from '../components/Callout';
import { Caption } from '../components/Caption';
import { ChatFeed } from '../components/ChatFeed';
import { Cursor } from '../components/Cursor';
import { Desktop } from '../components/Desktop';
import { byText, Stage, useStageRef, useTargets } from '../components/Stage';
import { scriptLoop } from '../data/messages';
import { sceneFade, windowGeometry } from '../layout';
import { ALL_CONNECTED, useStage } from '../stores';

const HIDE_YT = 200;
const SHOW_YT = 250;

export function UnifiedChat({ video, offset }: { video: string | null; offset: number }) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const stageRef = useStageRef();

    useStage({ connected: ALL_CONNECTED });

    const targets = useTargets(stageRef, {
        yt: byText('button', 'YT'),
        filters: (root) => byText('button', 'T')(root)?.parentElement,
    });
    const youtubeHidden = frame >= HIDE_YT && frame < SHOW_YT;

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Stage ref={stageRef}>
                <Desktop
                    dim={0.15}
                    video={video}
                />
                <Caption
                    step="02  ONE FEED"
                    title="Every platform, one chat"
                    body="Messages from all platforms land in a single feed, with emotes, badges, subs, Super Chats and channel point redemptions."
                />
                <AppWindow {...windowGeometry(0)}>
                    <ChatFeed
                        script={scriptLoop(offset)}
                        hidden={{ [Platform.PlatformYouTube]: youtubeHidden }}
                    />
                </AppWindow>
                <Callout
                    rect={targets.filters}
                    from={175}
                    to={285}
                    label="Show or hide a platform"
                    side="left"
                />
                <Cursor
                    points={[
                        { at: 150, x: 1500, y: 1000 },
                        { at: HIDE_YT, x: targets.yt?.cx, y: targets.yt?.cy, click: true },
                        { at: SHOW_YT, x: targets.yt?.cx, y: targets.yt?.cy, click: true },
                    ]}
                />
            </Stage>
        </AbsoluteFill>
    );
}
