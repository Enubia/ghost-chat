import { interpolate, useCurrentFrame } from 'remotion';

import { clamp } from '../layout';

export const TRAY_ITEMS = ['Show/Hide', 'Center on Screen', 'Toggle Vanish', 'Open Config Folder', 'Quit'];

interface Props {
    openAt: number;
    closeAt: number;
    hover: { at: number; item: string }[];
    right: number;
    bottom: number;
}

export function TrayMenu({ openAt, closeAt, hover, right, bottom }: Props) {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [openAt, openAt + 5, closeAt, closeAt + 5], [0, 1, 1, 0], clamp);
    const hovered = hover.findLast((h) => frame >= h.at)?.item;

    if (opacity <= 0) {
        return null;
    }

    const row = (label: string, disabled = false) => (
        <div
            key={label}
            data-tray-item={label}
            style={{
                padding: '9px 18px',
                borderRadius: 5,
                color: disabled ? '#8a8a98' : '#ececf2',
                background: hovered === label ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            }}
        >
            {label}
        </div>
    );

    return (
        <div
            style={{
                position: 'absolute',
                right,
                bottom,
                width: 260,
                opacity,
                transform: `translateY(${(1 - opacity) * 10}px)`,
                padding: 6,
                borderRadius: 8,
                background: '#2a2a33',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
                fontFamily: "'Segoe UI', var(--font-sans)",
                fontSize: 17,
            }}
        >
            {row('Ghost Chat v4.9.0', true)}
            <div style={{ height: 1, margin: '4px 8px', background: 'rgba(255, 255, 255, 0.1)' }} />
            {TRAY_ITEMS.slice(0, 4).map((item) => row(item))}
            <div style={{ height: 1, margin: '4px 8px', background: 'rgba(255, 255, 255, 0.1)' }} />
            {row('Quit')}
        </div>
    );
}
