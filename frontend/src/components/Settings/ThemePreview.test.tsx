import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BUILT_IN_THEMES } from '@/types/theme';

import { ThemePreview } from './ThemePreview';

const store = vi.hoisted(() => ({ config: null as unknown }));

vi.mock('@/stores/config', () => ({
    useConfigStore: <T,>(selector: (s: typeof store) => T) => selector(store),
}));

describe('ThemePreview gif', () => {
    beforeEach(() => {
        store.config = null;
    });

    it('shows a sample gif', () => {
        const html = renderToStaticMarkup(<ThemePreview />);

        expect(html).toMatch(/<img[^>]*class="[^"]*gif[^"]*"[^>]*src="https:\/\/media\.giphy\.com\/[^"]+"/);
    });

    it('applies the active theme gif size to the preview', () => {
        const custom = { ...BUILT_IN_THEMES[0], id: 'custom-1', name: 'Mine', gif_size: 140 };

        store.config = { theme: { active_theme_id: 'custom-1', custom_themes: [custom] } };

        const html = renderToStaticMarkup(<ThemePreview />);

        expect(html).toContain('--theme-gif-size:10.000em');
    });
});
