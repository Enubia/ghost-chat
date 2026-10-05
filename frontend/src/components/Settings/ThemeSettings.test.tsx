import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BUILT_IN_THEMES } from '@/types/theme';

import { ThemeSettings } from './ThemeSettings';

const store = vi.hoisted(() => ({ config: null as unknown, update: () => Promise.resolve() }));

vi.mock('@bindings/ghost-chat/app.js', () => ({
    ExportTheme: vi.fn(),
}));

vi.mock('@/stores/config', () => ({
    useConfigStore: <T,>(selector: (s: typeof store) => T) => selector(store),
}));

const GIF_SLIDER = /<input type="range" min="48" max="240"[^>]*value="(\d+)"/;

function renderWithCustomTheme(gifSize: number | undefined) {
    const custom = { ...BUILT_IN_THEMES[0], id: 'custom-1', name: 'Mine', gif_size: gifSize };

    store.config = { theme: { active_theme_id: 'custom-1', custom_themes: [custom] } };

    return renderToStaticMarkup(<ThemeSettings />);
}

describe('ThemeSettings gif size', () => {
    beforeEach(() => {
        store.config = null;
    });

    it('shows the gif size slider with the theme value', () => {
        const html = renderWithCustomTheme(160);

        expect(html).toContain('settings.themes.gif_size');
        expect(html.match(GIF_SLIDER)?.[1]).toBe('160');
    });

    it('shows the default for custom themes saved before gif_size existed', () => {
        const html = renderWithCustomTheme(undefined);

        expect(html.match(GIF_SLIDER)?.[1]).toBe('112');
        expect(html).toContain('value="Mine"');
    });

    it('shows the built-in default theme value', () => {
        const html = renderToStaticMarkup(<ThemeSettings />);

        expect(html.match(GIF_SLIDER)?.[1]).toBe(String(BUILT_IN_THEMES[0].gif_size));
    });
});
