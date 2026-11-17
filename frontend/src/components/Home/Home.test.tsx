import type { InputMap } from '@/stores/connection';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { Config } from '@bindings/ghost-chat/internal/config/models.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Home } from './Home';

const stores = vi.hoisted(() => ({
    config: { config: null as Config | null, update: () => Promise.resolve() },
    connection: { inputs: {} as InputMap },
}));

vi.mock('@/stores/config', () => ({
    useConfigStore: (selector: (s: typeof stores.config) => unknown) => selector(stores.config),
}));

vi.mock('@/stores/connection', () => ({
    useConnectionStore: () => ({
        connected: {},
        waiting: {},
        error: null,
        setInput: () => {},
        setError: () => {},
        ...stores.connection,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@bindings/ghost-chat/app.js', () => ({
    Connect: vi.fn(),
    Disconnect: vi.fn(),
}));

function render() {
    return renderToStaticMarkup(
        <MemoryRouter>
            <Home />
        </MemoryRouter>
    );
}

describe('Home', () => {
    beforeEach(() => {
        stores.config.config = Config.createFrom({
            twitch: { default_channel: 'saved-twitch' },
            youtube: { channel_id: '@saved-youtube' },
            kick: { default_channel: 'saved-kick' },
        });
        stores.connection.inputs = {};
    });

    it('prefills inputs with the saved channels', () => {
        const html = render();

        expect(html).toContain('value="saved-twitch"');
        expect(html).toContain('value="@saved-youtube"');
        expect(html).toContain('value="saved-kick"');
    });

    it('keeps a cleared input empty instead of restoring the saved channel', () => {
        stores.connection.inputs = {
            [Platform.PlatformTwitch]: { text: '', saved: 'saved-twitch' },
            [Platform.PlatformYouTube]: { text: '', saved: '@saved-youtube' },
            [Platform.PlatformKick]: { text: '', saved: 'saved-kick' },
        };

        const html = render();

        expect(html).not.toContain('saved-twitch');
        expect(html).not.toContain('@saved-youtube');
        expect(html).not.toContain('saved-kick');
    });

    it('shows the new saved channel after it changes in settings', () => {
        stores.connection.inputs = {
            [Platform.PlatformTwitch]: { text: '', saved: 'old-twitch' },
            [Platform.PlatformYouTube]: { text: 'typed', saved: '@old-youtube' },
            [Platform.PlatformKick]: { text: '', saved: 'old-kick' },
        };

        const html = render();

        expect(html).toContain('value="saved-twitch"');
        expect(html).toContain('value="@saved-youtube"');
        expect(html).toContain('value="saved-kick"');
        expect(html).not.toContain('typed');
    });
});
