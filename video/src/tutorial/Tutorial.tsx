import type React from 'react';

import { Series } from 'remotion';

import { Preload } from '../components/Preload';
import { REMOTE_IMAGES } from '../data/messages';
import { EndCard, Tips, TitleCard } from './Cards';
import { ChatWindow } from './ChatWindow';
import { ConnectOthers } from './ConnectOthers';
import { ConnectTwitch } from './ConnectTwitch';
import { CustomOverlay } from './CustomOverlay';
import { Install } from './Install';
import { PlatformSettings } from './PlatformSettings';
import { ThemesChapter } from './ThemesChapter';
import { Tray } from './Tray';
import { VanishMode } from './VanishMode';

const SCENES: [React.FC, number][] = [
    [TitleCard, 120],
    [Install, 480],
    [ConnectTwitch, 275],
    [ConnectOthers, 505],
    [ChatWindow, 510],
    [VanishMode, 670],
    [Tray, 725],
    [PlatformSettings, 820],
    [ThemesChapter, 600],
    [CustomOverlay, 560],
    [Tips, 675],
    [EndCard, 180],
];

export const TUTORIAL_FRAMES = SCENES.reduce((sum, [, frames]) => sum + frames, 0);

export function Tutorial() {
    return (
        <Preload urls={REMOTE_IMAGES}>
            <Series>
                {SCENES.map(([Scene, frames], i) => (
                    <Series.Sequence
                        key={i}
                        durationInFrames={frames}
                    >
                        <Scene />
                    </Series.Sequence>
                ))}
            </Series>
        </Preload>
    );
}
