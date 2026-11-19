import { Series } from 'remotion';

import { Preload } from './components/Preload';
import { REMOTE_IMAGES } from './data/messages';
import { Connect } from './scenes/Connect';
import { Intro } from './scenes/Intro';
import { Outro } from './scenes/Outro';
import { SettingsGeneral } from './scenes/SettingsGeneral';
import { SettingsTwitch } from './scenes/SettingsTwitch';
import { Themes } from './scenes/Themes';
import { UnifiedChat } from './scenes/UnifiedChat';
import { Vanish } from './scenes/Vanish';

export type PromoProps = {
    video: string | null;
};

export const SCENES = [
    { id: 'intro', frames: 150 },
    { id: 'connect', frames: 280 },
    { id: 'chat', frames: 300 },
    { id: 'vanish', frames: 330 },
    { id: 'general', frames: 240 },
    { id: 'twitch', frames: 270 },
    { id: 'themes', frames: 270 },
    { id: 'outro', frames: 180 },
] as const;

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0);

const frames = (id: (typeof SCENES)[number]['id']) => SCENES.find((s) => s.id === id)!.frames;

export function Promo({ video }: PromoProps) {
    const chat = frames('chat');
    const vanish = chat + frames('vanish');
    const general = vanish + frames('general');
    const twitch = general + frames('twitch');

    return (
        <Preload urls={REMOTE_IMAGES}>
            <Series>
                <Series.Sequence durationInFrames={frames('intro')}>
                    <Intro video={video} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={frames('connect')}>
                    <Connect video={video} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={chat}>
                    <UnifiedChat
                        video={video}
                        offset={0}
                    />
                </Series.Sequence>
                <Series.Sequence durationInFrames={frames('vanish')}>
                    <Vanish
                        video={video}
                        offset={chat}
                    />
                </Series.Sequence>
                <Series.Sequence durationInFrames={frames('general')}>
                    <SettingsGeneral
                        video={video}
                        offset={vanish}
                    />
                </Series.Sequence>
                <Series.Sequence durationInFrames={frames('twitch')}>
                    <SettingsTwitch
                        video={video}
                        offset={general}
                    />
                </Series.Sequence>
                <Series.Sequence durationInFrames={frames('themes')}>
                    <Themes
                        video={video}
                        offset={twitch}
                    />
                </Series.Sequence>
                <Series.Sequence durationInFrames={frames('outro')}>
                    <Outro video={video} />
                </Series.Sequence>
            </Series>
        </Preload>
    );
}
