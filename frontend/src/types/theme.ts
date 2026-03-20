export interface Theme {
    id: string;
    name: string;
    font_family: string;
    font_size: number;
    line_height: number;
    message_bg: string;
    message_padding: string;
    message_radius: number;
    message_gap: number;
    username_weight: number;
    show_colon: boolean;
    badge_size: number;
    emote_size: number;
    show_avatars: boolean;
    avatar_size: number;
    text_weight: number;
    text_shadow: string;
    text_color: string;
    top_to_bottom: boolean;
}

export const BUILT_IN_THEMES: Theme[] = [
    {
        id: 'default',
        name: 'Default',
        font_family: 'inherit',
        font_size: 16,
        line_height: 1.6,
        message_bg: 'transparent',
        message_padding: '2px 0',
        message_radius: 0,
        message_gap: 0,
        username_weight: 600,
        show_colon: true,
        badge_size: 18,
        emote_size: 28,
        show_avatars: true,
        avatar_size: 18,
        text_weight: 400,
        text_shadow: 'none',
        text_color: 'inherit',
        top_to_bottom: false,
    },
    {
        id: 'compact',
        name: 'Compact',
        font_family: 'inherit',
        font_size: 12,
        line_height: 1.3,
        message_bg: 'transparent',
        message_padding: '1px 0',
        message_radius: 0,
        message_gap: 0,
        username_weight: 600,
        show_colon: true,
        badge_size: 14,
        emote_size: 20,
        show_avatars: false,
        avatar_size: 0,
        text_weight: 400,
        text_shadow: 'none',
        text_color: 'inherit',
        top_to_bottom: false,
    },
    {
        id: 'bubble',
        name: 'Bubble',
        font_family: 'inherit',
        font_size: 16,
        line_height: 1.5,
        message_bg: 'rgba(0, 0, 0, 0.3)',
        message_padding: '4px 8px',
        message_radius: 6,
        message_gap: 4,
        username_weight: 700,
        show_colon: true,
        badge_size: 18,
        emote_size: 28,
        show_avatars: true,
        avatar_size: 20,
        text_weight: 400,
        text_shadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        text_color: '#ffffff',
        top_to_bottom: false,
    },
];

export function getThemeById(id: string, customThemes: Theme[] = []): Theme {
    return BUILT_IN_THEMES.find((t) => t.id === id) ?? customThemes.find((t) => t.id === id) ?? BUILT_IN_THEMES[0];
}

// Reference font size (14px = Default theme). Slider values for badge/emote/avatar
// are defined relative to this size and scale proportionally when font_size changes.
const REF_FONT_SIZE = 14;

export function themeToCSS(theme: Theme): Record<string, string> {
    return {
        '--theme-font-family': theme.font_family,
        '--theme-font-size': `${theme.font_size || 14}px`,
        '--theme-line-height': String(theme.line_height),
        '--theme-message-bg': theme.message_bg,
        '--theme-message-padding': theme.message_padding,
        '--theme-message-radius': `${theme.message_radius}px`,
        '--theme-message-gap': `${theme.message_gap}px`,
        '--theme-username-weight': String(theme.username_weight),
        '--theme-badge-size': `${(theme.badge_size / REF_FONT_SIZE).toFixed(3)}em`,
        '--theme-emote-size': `${(theme.emote_size / REF_FONT_SIZE).toFixed(3)}em`,
        '--theme-avatar-size': `${(theme.avatar_size / REF_FONT_SIZE).toFixed(3)}em`,
        '--theme-text-weight': String(theme.text_weight),
        '--theme-text-shadow': theme.text_shadow,
        '--theme-text-color': theme.text_color,
    };
}
