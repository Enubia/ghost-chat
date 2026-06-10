import type { Platform } from '@bindings/ghost-chat/internal/chat/models.js';

export type { Platform };

export interface Badge {
    name: string;
    version: string;
    url: string;
}

export interface MessageFragment {
    type: 'text' | 'emote';
    text: string;
    url: string;
}

export interface SuperChatDetails {
    amount: string;
    headerColor: string;
    bodyColor: string;
}

export interface ChatMessage {
    id: string;
    platform: Platform;
    username: string;
    color: string;
    text: string;
    badges: Badge[];
    // Go's Fragmentize returns a nil slice for empty text, which serializes as null
    fragments: MessageFragment[] | null;
    timestamp: string;
    isAction: boolean;
    tags: Record<string, string>;
    eventType?: string;
    systemMessage?: string;
    eventData?: Record<string, string>;
    avatar: string;
    superChat: SuperChatDetails | null;
    membershipEvent: boolean;
}
