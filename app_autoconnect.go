package main

import (
	"strings"
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

	if a.config.Twitch.ConnectOnStartup {
		if v := strings.TrimSpace(a.config.Twitch.DefaultChannel); v != "" {
			targets[chat.PlatformTwitch] = v
		}
	}

	if a.config.YouTube.ConnectOnStartup {
		if v := strings.TrimSpace(a.config.YouTube.ChannelID); v != "" {
			targets[chat.PlatformYouTube] = v
		}
	}

	if a.config.Kick.ConnectOnStartup {
		if v := strings.TrimSpace(a.config.Kick.DefaultChannel); v != "" {
			targets[chat.PlatformKick] = v
		}
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
