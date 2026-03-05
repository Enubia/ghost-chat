package config

type WindowState struct {
	X              int  `json:"x"`
	Y              int  `json:"y"`
	Width          int  `json:"width"`
	Height         int  `json:"height"`
	IsClickThrough bool `json:"is_click_through"`
	IsTransparent  bool `json:"is_transparent"`
}

type MacOptions struct {
	QuitOnClose  bool `json:"quit_on_close"`
	HideDockIcon bool `json:"hide_dock_icon"`
}

type General struct {
	Language   string     `json:"language"` // default "en-US"
	MacOptions MacOptions `json:"mac_options"`
}

type VanishKeybind struct {
	Keybind           string `json:"keybind"` // empty by default
	ActivationMessage string `json:"activation_message"`
}

type Keybinds struct {
	Vanish VanishKeybind `json:"vanish"`
}

type TwitchConfig struct {
	Channel        string   `json:"channel"`
	DefaultChannel string   `json:"default_channel"`
	Fade           bool     `json:"fade"`
	FadeTimeout    int      `json:"fade_timeout"`
	Bots           bool     `json:"bots"`
	HideCommands   bool     `json:"hide_commands"`
	HideBadges     bool     `json:"hide_badges"`
	UserBlacklist  []string `json:"user_blacklist"`
}

type YouTubeConfig struct {
	ChannelID        string   `json:"channel_id"`
	DefaultChannelID string   `json:"default_channel_id"`
	VideoURL         string   `json:"video_url"`
	Retries          int      `json:"retries"`
	FetchDelay       int      `json:"fetch_delay"`
	UserBlacklist    []string `json:"user_blacklist"`
}

type ExternalConfig struct {
	DefaultURL string   `json:"default_url"`
	Sources    []string `json:"sources"`
}

type Config struct {
	Version     string         `json:"version"`
	WindowState WindowState    `json:"window_state"`
	General     General        `json:"general"`
	Keybinds    Keybinds       `json:"keybinds"`
	Twitch      TwitchConfig   `json:"twitch"`
	YouTube     YouTubeConfig  `json:"youtube"`
	External    ExternalConfig `json:"external"`
}

func DefaultConfig() Config {
	return Config{
		Version: "1.0.0",
		WindowState: WindowState{
			Width:  400,
			Height: 600,
		},
		General: General{
			Language:   "en-US",
			MacOptions: MacOptions{},
		},
		Keybinds: Keybinds{
			Vanish: VanishKeybind{
				ActivationMessage: "VanishKeybind triggered",
			},
		},
		Twitch: TwitchConfig{
			FadeTimeout: 30,
		},
		YouTube: YouTubeConfig{
			Retries:    50,
			FetchDelay: 5,
		},
		External: ExternalConfig{},
	}
}
