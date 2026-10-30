package main

import (
	"sync"

	"ghost-chat/internal/chat"
)

type AutoConnectResult struct {
	Platform chat.Platform `json:"platform"`
	Error    string        `json:"error"`
}

func (a *App) AutoConnect() []AutoConnectResult {
	var first bool

	a.autoConnectOnce.Do(func() { first = true })

	if !first {
		return nil
	}

	a.configMu.Lock()

	targets := map[chat.Platform]string{}

	if a.config.Twitch.ConnectOnStartup && a.config.Twitch.DefaultChannel != "" {
		targets[chat.PlatformTwitch] = a.config.Twitch.DefaultChannel
	}

	if a.config.YouTube.ConnectOnStartup && a.config.YouTube.ChannelID != "" {
		targets[chat.PlatformYouTube] = a.config.YouTube.ChannelID
	}

	if a.config.Kick.ConnectOnStartup && a.config.Kick.DefaultChannel != "" {
		targets[chat.PlatformKick] = a.config.Kick.DefaultChannel
	}

	a.configMu.Unlock()

	var wg sync.WaitGroup

	results := make([]AutoConnectResult, 0, len(targets))
	var mu sync.Mutex

	for platform, input := range targets {
		wg.Add(1)

		go func() {
			defer wg.Done()

			result := AutoConnectResult{Platform: platform}

			if err := a.Connect(platform, input); err != nil {
				result.Error = err.Error()
			}

			mu.Lock()
			results = append(results, result)
			mu.Unlock()
		}()
	}

	wg.Wait()

	return results
}
