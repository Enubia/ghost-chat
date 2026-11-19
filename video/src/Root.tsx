import { Composition } from 'remotion';

import { Promo, TOTAL_FRAMES } from './Promo';
import { Tutorial, TUTORIAL_FRAMES } from './tutorial/Tutorial';

import './setup';

export function Root() {
    return (
        <>
            <Composition
                id="GhostChatPromo"
                component={Promo}
                durationInFrames={TOTAL_FRAMES}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{ video: null }}
            />
            <Composition
                id="GhostChatTutorial"
                component={Tutorial}
                durationInFrames={TUTORIAL_FRAMES}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
}
