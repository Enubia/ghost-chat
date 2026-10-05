import type { MessageFragment } from '@/types/chat';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { renderFragments } from './renderFragments';

const gif: MessageFragment = { type: 'gif', text: '[cool gif]', url: 'https://example.com/x.gif' };
const emote: MessageFragment = { type: 'emote', text: 'Kappa', url: 'https://example.com/kappa.png' };
const text: MessageFragment = { type: 'text', text: 'hello', url: '' };

describe('renderFragments', () => {
    it('renders a gif fragment as an image by default', () => {
        const html = renderToStaticMarkup(renderFragments([gif]));

        expect(html).toContain('src="https://example.com/x.gif"');
        expect(html).toContain('alt="[cool gif]"');
    });

    it('styles gifs and emotes with their own classes', () => {
        const gifHtml = renderToStaticMarkup(renderFragments([gif]));
        const emoteHtml = renderToStaticMarkup(renderFragments([emote]));

        expect(gifHtml).toMatch(/class="[^"]*gif[^"]*"/);
        expect(gifHtml).not.toMatch(/class="[^"]*emote[^"]*"/);
        expect(emoteHtml).toMatch(/class="[^"]*emote[^"]*"/);
        expect(emoteHtml).not.toMatch(/class="[^"]*gif[^"]*"/);
    });

    it('hides only gifs in a mixed message', () => {
        const html = renderToStaticMarkup(renderFragments([text, emote, gif], { hideGifs: true }));

        expect(html).toContain('hello');
        expect(html).toContain('src="https://example.com/kappa.png"');
        expect(html).not.toContain('src="https://example.com/x.gif"');
        expect(html).toContain('[cool gif]');
    });

    it('renders a gif fragment as placeholder text when hidden', () => {
        const html = renderToStaticMarkup(renderFragments([gif], { hideGifs: true }));

        expect(html).not.toContain('<img');
        expect(html).toContain('[cool gif]');
    });

    it('always renders emotes as images regardless of hideGifs', () => {
        const html = renderToStaticMarkup(renderFragments([emote], { hideGifs: true }));

        expect(html).toContain('src="https://example.com/kappa.png"');
    });

    it('renders text fragments verbatim', () => {
        const html = renderToStaticMarkup(renderFragments([text]));

        expect(html).toContain('hello');
    });
});
