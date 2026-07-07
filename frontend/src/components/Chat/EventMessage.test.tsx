import type { ChatMessage } from '@/types/chat';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { createInstance } from 'i18next';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it } from 'vitest';

import { EventMessage } from './EventMessage';

const i18n = createInstance();

beforeAll(async () => {
    await i18n.use(initReactI18next).init({
        lng: 'en-US',
        fallbackLng: 'en-US',
        interpolation: { escapeValue: false },
        resources: {
            'en-US': {
                translation: { chat: { redemption: '{{user}} redeemed {{reward}} ({{cost}} points)' } },
            },
            'de-DE': {
                translation: { chat: { redemption: '{{user}} hat {{reward}} eingelöst ({{cost}} Punkte)' } },
            },
        },
    });
});

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
    return {
        id: 'test-id',
        platform: Platform.PlatformTwitch,
        username: 'CoolViewer',
        color: '',
        text: '',
        badges: [],
        fragments: [],
        timestamp: '',
        isAction: false,
        tags: {},
        avatar: '',
        superChat: null,
        membershipEvent: false,
        ...overrides,
    };
}

function render(msg: ChatMessage) {
    return renderToStaticMarkup(
        <I18nextProvider i18n={i18n}>
            <EventMessage message={msg} />
        </I18nextProvider>
    );
}

describe('EventMessage redemption', () => {
    const redemption = makeMsg({
        eventType: 'channel_points_redemption',
        systemMessage: 'GO_FALLBACK_LINE',
        text: 'pineapple please',
        eventData: { reward: 'Hydrate!', cost: '500' },
    });

    it('composes the headline from the translation key, not the Go fallback', () => {
        const html = render(redemption);

        expect(html).toContain('CoolViewer redeemed Hydrate! (500 points)');
        expect(html).not.toContain('GO_FALLBACK_LINE');
    });

    it('renders the viewer input below the headline', () => {
        const html = render(redemption);

        expect(html).toContain('pineapple please');
    });

    it('applies the distinct redemption accent class', () => {
        const html = render(redemption);

        expect(html).toContain('redemption');
    });

    it('localizes the headline in de-DE', async () => {
        await i18n.changeLanguage('de-DE');

        const html = render(redemption);

        await i18n.changeLanguage('en-US');

        expect(html).toContain('CoolViewer hat Hydrate! eingelöst (500 Punkte)');
    });

    it('renders non-redemption events from systemMessage unchanged', () => {
        const sub = makeMsg({ eventType: 'sub', systemMessage: 'CoolViewer subscribed at Tier 1' });

        const html = render(sub);

        expect(html).toContain('CoolViewer subscribed at Tier 1');
    });
});
