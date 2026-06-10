package chat

type Platform string

const (
	PlatformTwitch  Platform = "twitch"
	PlatformYouTube Platform = "youtube"
	PlatformKick    Platform = "kick"
)

type Client interface {
	Connect(input string) error
	Disconnect()
}
