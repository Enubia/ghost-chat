import { interpolate } from 'remotion';

export const CHAT = { width: 420, height: 680, scale: 1.4 };
export const SETTINGS = { width: 1020, height: 680, scale: 1.15 };
const RIGHT = 1840;

export function windowGeometry(p: number) {
    const width = interpolate(p, [0, 1], [CHAT.width, SETTINGS.width]);
    const scale = interpolate(p, [0, 1], [CHAT.scale, SETTINGS.scale]);
    const height = CHAT.height;

    return {
        width,
        height,
        scale,
        x: RIGHT - width * scale,
        y: (1080 - height * scale) / 2,
        settingsWidth: 400 * p,
    };
}

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export function typed(text: string, frame: number, start: number, perChar = 2) {
    const n = Math.max(0, Math.floor((frame - start) / perChar));

    return text.slice(0, n);
}

export function sceneFade(frame: number, duration: number, length = 10) {
    return interpolate(frame, [0, length, duration - length, duration], [0, 1, 1, 0], clamp);
}
