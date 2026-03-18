package twitch

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"sync"
)

var validChannelLogin = regexp.MustCompile(`^[a-zA-Z0-9_]{1,25}$`)

const (
	twitchGQLURL      = "https://gql.twitch.tv/gql"
	twitchGQLClientID = "kimne78kx3ncx6brgo4mv6wki5h1ko"
)

type gqlBadge struct {
	ImageURL string `json:"imageURL"`
	SetID    string `json:"setID"`
	Version  string `json:"version"`
}

type gqlGlobalResponse struct {
	Data struct {
		Badges []gqlBadge `json:"badges"`
	} `json:"data"`
}

type gqlChannelResponse struct {
	Data struct {
		User struct {
			BroadcastBadges []gqlBadge `json:"broadcastBadges"`
		} `json:"user"`
	} `json:"data"`
}

type BadgeStore struct {
	mu     sync.RWMutex
	badges map[string]map[string]string
}

func NewBadgeStore() *BadgeStore {
	return &BadgeStore{
		badges: make(map[string]map[string]string),
	}
}

func (b *BadgeStore) GetURL(name, version string) string {
	b.mu.RLock()
	defer b.mu.RUnlock()

	versions, ok := b.badges[name]
	if !ok {
		return ""
	}
	return versions[version]
}

func (b *BadgeStore) FetchGlobal() error {
	query := `{"query":"{ badges { imageURL(size: NORMAL) setID version } }"}`

	resp, err := gqlRequest(query)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var result gqlGlobalResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	b.storeBadges(result.Data.Badges)
	return nil
}

func (b *BadgeStore) FetchChannel(channelLogin string) error {
	if !validChannelLogin.MatchString(channelLogin) {
		return fmt.Errorf("invalid channel login: %s", channelLogin)
	}

	query := fmt.Sprintf(
		`{"query":"query { user(login: \"%s\") { broadcastBadges { imageURL(size: NORMAL) setID version } } }"}`,
		channelLogin,
	)

	resp, err := gqlRequest(query)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var result gqlChannelResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	b.storeBadges(result.Data.User.BroadcastBadges)
	return nil
}

func gqlRequest(body string) (*http.Response, error) {
	req, err := http.NewRequest("POST", twitchGQLURL, bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Client-Id", twitchGQLClientID)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		resp.Body.Close()
		return nil, fmt.Errorf("twitch gql returned %s", resp.Status)
	}

	return resp, nil
}

func (b *BadgeStore) storeBadges(badges []gqlBadge) {
	b.mu.Lock()
	defer b.mu.Unlock()

	for _, badge := range badges {
		if _, exists := b.badges[badge.SetID]; !exists {
			b.badges[badge.SetID] = make(map[string]string)
		}
		b.badges[badge.SetID][badge.Version] = badge.ImageURL
	}
}
