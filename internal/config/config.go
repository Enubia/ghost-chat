package config

type WindowState struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

type General struct {
	Language       string `json:"language"` // default "en-US"
	ShowTimestamps bool   `json:"show_timestamps"`
}

type VanishKeybind struct {
	Keybind           string `json:"keybind"` // empty by default
	ActivationMessage string `json:"activation_message"`
}

type Keybinds struct {
	Vanish VanishKeybind `json:"vanish"`
}

type TwitchConfig struct {
	DefaultChannel string   `json:"default_channel"`
	Fade           bool     `json:"fade"`
	FadeTimeout    int      `json:"fade_timeout"`
	Bots           bool     `json:"bots"`
	HideCommands   bool     `json:"hide_commands"`
	HideBadges     bool     `json:"hide_badges"`
	UserBlacklist  []string `json:"user_blacklist"`
}

type YouTubeConfig struct {
	ChannelID     string   `json:"channel_id"`
	VideoURL      string   `json:"video_url"`
	Fade          bool     `json:"fade"`
	FadeTimeout   int      `json:"fade_timeout"`
	UserBlacklist []string `json:"user_blacklist"`
}

type KickConfig struct {
	DefaultChannel string   `json:"default_channel"`
	Fade           bool     `json:"fade"`
	FadeTimeout    int      `json:"fade_timeout"`
	UserBlacklist  []string `json:"user_blacklist"`
}

type Theme struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	FontFamily     string  `json:"font_family"`
	FontSize       int     `json:"font_size"`
	LineHeight     float64 `json:"line_height"`
	MessageBg      string  `json:"message_bg"`
	MessagePadding string  `json:"message_padding"`
	MessageRadius  int     `json:"message_radius"`
	MessageGap     int     `json:"message_gap"`
	UsernameWeight int     `json:"username_weight"`
	ShowColon      bool    `json:"show_colon"`
	BadgeSize      int     `json:"badge_size"`
	EmoteSize      int     `json:"emote_size"`
	ShowAvatars    bool    `json:"show_avatars"`
	AvatarSize     int     `json:"avatar_size"`
	TextShadow     string  `json:"text_shadow"`
	TextColor      string  `json:"text_color"`
}

type ThemeConfig struct {
	ActiveThemeID string  `json:"active_theme_id"`
	CustomThemes  []Theme `json:"custom_themes"`
}

type Config struct {
	Version     string        `json:"version"`
	WindowState WindowState   `json:"window_state"`
	General     General       `json:"general"`
	Keybinds    Keybinds      `json:"keybinds"`
	Theme       ThemeConfig   `json:"theme"`
	Twitch      TwitchConfig  `json:"twitch"`
	YouTube     YouTubeConfig `json:"youtube"`
	Kick        KickConfig    `json:"kick"`
}

func DefaultConfig() Config {
	return Config{
		Version: "4.0.0",
		WindowState: WindowState{
			Width:  400,
			Height: 600,
		},
		General: General{
			Language: "en-US",
		},
		Keybinds: Keybinds{
			Vanish: VanishKeybind{
				ActivationMessage: "VanishKeybind triggered",
			},
		},
		Theme: ThemeConfig{
			ActiveThemeID: "default",
		},
		Twitch: TwitchConfig{
			FadeTimeout: 30,
		},
		YouTube: YouTubeConfig{
			FadeTimeout: 30,
		},
		Kick: KickConfig{
			FadeTimeout: 30,
		},
	}
}
