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
}
