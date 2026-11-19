import type React from 'react';

import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill } from 'remotion';

export const WIDTH = 1920;
export const HEIGHT = 1080;

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
}

export type Finder = (root: HTMLElement) => Element | null | undefined;

export const Stage = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
    <AbsoluteFill
        ref={ref}
        style={{ background: '#101018', overflow: 'hidden' }}
    >
        {children}
    </AbsoluteFill>
));

export function useStageRef() {
    return useRef<HTMLDivElement>(null);
}

function measure(root: HTMLElement, el: Element): Rect {
    const rootRect = root.getBoundingClientRect();
    const scale = rootRect.width / WIDTH;
    const r = el.getBoundingClientRect();
    const x = (r.left - rootRect.left) / scale;
    const y = (r.top - rootRect.top) / scale;
    const width = r.width / scale;
    const height = r.height / scale;

    return { x, y, width, height, cx: x + width / 2, cy: y + height / 2 };
}

export function useTargets<K extends string>(
    ref: React.RefObject<HTMLDivElement | null>,
    finders: Record<K, Finder>
): Partial<Record<K, Rect>> {
    const [rects, setRects] = useState<Partial<Record<K, Rect>>>({});

    useLayoutEffect(() => {
        const root = ref.current;

        if (!root) {
            return;
        }

        const next: Partial<Record<K, Rect>> = {};

        for (const key of Object.keys(finders) as K[]) {
            const el = finders[key](root);

            if (el) {
                next[key] = measure(root, el);
            }
        }

        if (JSON.stringify(next) !== JSON.stringify(rects)) {
            setRects(next);
        }
    });

    return rects;
}

export function byText(selector: string, text: string): Finder {
    return (root) =>
        [...root.querySelectorAll(selector)].find((el) => el.textContent?.trim().toLowerCase() === text.toLowerCase());
}

export function toggleFor(label: string): Finder {
    return (root) => byText('.field-row', label)(root)?.querySelector('.toggle-slider') ?? findRowToggle(root, label);
}

function findRowToggle(root: HTMLElement, label: string) {
    const lbl = byText('.field-row label, .field-row span', label)(root);

    return lbl?.closest('.field-row')?.querySelector('.toggle-slider');
}

export function nth(selector: string, index: number): Finder {
    return (root) => root.querySelectorAll(selector)[index];
}
