export interface Badge {
    name: string;
    version: string;
    url: string;
}

export interface Emote {
    id: string;
    start: number;
    end: number;
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
    platform: 'twitch' | 'youtube';
    username: string;
    color: string;
    text: string;
    badges: Badge[];
    emotes: Emote[];
    timestamp: string;
    isAction: boolean;
    tags: Record<string, string>;
    // YouTube-specific (absent / zero-value for Twitch)
    avatar: string;
    fragments: MessageFragment[];
    superChat: SuperChatDetails | null;
    membershipEvent: boolean;
}
