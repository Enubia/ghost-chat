import type React from 'react';

import type { Step } from '../components/StepList';

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { Desktop } from '../components/Desktop';
import { Stage } from '../components/Stage';
import { StepList } from '../components/StepList';
import { sceneFade } from '../layout';

export const CHAPTERS = [
    'Install',
    'Connect Twitch',
    'YouTube and Kick',
    'The chat window',
    'Vanish mode',
    'System tray',
    'Platform settings',
    'Themes',
    'Custom overlay',
];

interface Props {
    stageRef: React.RefObject<HTMLDivElement | null>;
    chapter: number;
    steps: Step[];
    note?: string;
    noteAt?: number;
    game?: number;
    dim?: number;
    clickAt?: { frame: number; x: number; y: number }[];
    children: React.ReactNode;
}

export function Shell({ stageRef, chapter, steps, note, noteAt, game = 0, dim = 0.15, clickAt, children }: Props) {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    return (
        <AbsoluteFill style={{ opacity: sceneFade(frame, durationInFrames) }}>
            <Stage ref={stageRef}>
                <Desktop
                    dim={dim}
                    game={game}
                    clickAt={clickAt}
                />
                <StepList
                    chapter={`STEP ${chapter} OF ${CHAPTERS.length}`}
                    title={CHAPTERS[chapter - 1]}
                    steps={steps}
                    note={note}
                    noteAt={noteAt}
                />
                {children}
            </Stage>
        </AbsoluteFill>
    );
}
