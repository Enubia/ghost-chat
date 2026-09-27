import type { ChatMessage as ChatMessageType } from '@/types/chat';

import { Platform } from '@bindings/ghost-chat/internal/chat/models.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ChatMessage } from './ChatMessage';

const message: ChatMessageType = {
    id: 'test-id',
    platform: Platform.PlatformTwitch,
    username: 'CoolViewer',
    color: '',
    text: 'look [cool gif]',
    badges: [],
    fragments: [
        { type: 'text', text: 'look ', url: '' },
        { type: 'gif', text: '[cool gif]', url: 'https://example.com/x.gif' },
    ],
    timestamp: '',
    isAction: false,
    tags: {},
    avatar: '',
    superChat: null,
    membershipEvent: false,
};

describe('ChatMessage gifs', () => {
    it('renders gif fragments as images by default', () => {
        const html = renderToStaticMarkup(<ChatMessage message={message} />);

        expect(html).toContain('src="https://example.com/x.gif"');
    });

    it('renders gif fragments as placeholder text when hideGifs is on', () => {
        const html = renderToStaticMarkup(
            <ChatMessage
                message={message}
                hideGifs
            />
        );

        expect(html).not.toContain('src="https://example.com/x.gif"');
        expect(html).toContain('[cool gif]');
    });
});
