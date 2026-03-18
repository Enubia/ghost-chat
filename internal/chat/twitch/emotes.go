package twitch

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"ghost-chat/internal/chat"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

type EmoteStore struct {
	mu     sync.RWMutex
	emotes map[string]string
}

func NewEmoteStore() *EmoteStore {
	return &EmoteStore{
		emotes: make(map[string]string),
	}
}

func (e *EmoteStore) FetchBTTVGlobal() error {
	var emotes []bttvEmote
	if err := httpGetJSON("https://api.betterttv.net/3/cached/emotes/global", &emotes); err != nil {
		return err
	}
	e.store(bttvToMap(emotes))
	return nil
}

func (e *EmoteStore) FetchBTTVChannel(roomID string) error {
	var resp bttvChannelResponse
	url := fmt.Sprintf("https://api.betterttv.net/3/cached/users/twitch/%s", roomID)
	if err := httpGetJSON(url, &resp); err != nil {
		return err
	}
	combined := append(resp.ChannelEmotes, resp.SharedEmotes...)
	e.store(bttvToMap(combined))
	return nil
}

func (e *EmoteStore) FetchFFZGlobal() error {
	var resp ffzGlobalResponse
	if err := httpGetJSON("https://api.frankerfacez.com/v1/set/global", &resp); err != nil {
		return err
	}
	e.store(ffzSetsToMap(resp.Sets))
	return nil
}

func (e *EmoteStore) FetchFFZChannel(channelLogin string) error {
	var resp ffzChannelResponse
	url := fmt.Sprintf("https://api.frankerfacez.com/v1/room/%s", channelLogin)
	if err := httpGetJSON(url, &resp); err != nil {
		return err
	}
	e.store(ffzSetsToMap(resp.Sets))
	return nil
}

func (e *EmoteStore) Fetch7TVGlobal() error {
	var resp sevenTVSetResponse
	if err := httpGetJSON("https://7tv.io/v3/emote-sets/global", &resp); err != nil {
		return err
	}
	e.store(sevenTVToMap(resp.Emotes))
	return nil
}

func (e *EmoteStore) Fetch7TVChannel(userID string) error {
	var resp sevenTVUserResponse
	url := fmt.Sprintf("https://7tv.io/v3/users/twitch/%s", userID)
	if err := httpGetJSON(url, &resp); err != nil {
		return err
	}
	if resp.EmoteSet != nil {
		e.store(sevenTVToMap(resp.EmoteSet.Emotes))
	}
	return nil
}

func (e *EmoteStore) ResolveEmotes(text string, existing []chat.Emote) []chat.Emote {
	e.mu.RLock()
	defer e.mu.RUnlock()

	runes := []rune(text)
	result := existing
	pos := 0

	for pos < len(runes) {
		if runes[pos] == ' ' {
			pos++
			continue
		}

		end := pos

		for end < len(runes) && runes[end] != ' ' {
			end++
		}

		word := string(runes[pos:end])

		if url, ok := e.emotes[word]; ok {
			result = append(result, chat.Emote{
				ID:    word,
				Start: pos,
				End:   end - 1,
				URL:   url,
			})
		}

		pos = end
	}

	return result
}

func (e *EmoteStore) store(emotes map[string]string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	for name, url := range emotes {
		e.emotes[name] = url
	}
}

func httpGetJSON(url string, target any) error {
	resp, err := httpClient.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("GET %s returned %s", url, resp.Status)
	}
	return json.NewDecoder(resp.Body).Decode(target)
}

type bttvEmote struct {
	ID   string `json:"id"`
	Code string `json:"code"`
}

type bttvChannelResponse struct {
	ChannelEmotes []bttvEmote `json:"channelEmotes"`
	SharedEmotes  []bttvEmote `json:"sharedEmotes"`
}

func bttvToMap(emotes []bttvEmote) map[string]string {
	m := make(map[string]string, len(emotes))
	for _, e := range emotes {
		m[e.Code] = fmt.Sprintf("https://cdn.betterttv.net/emote/%s/1x", e.ID)
	}
	return m
}

type ffzEmote struct {
	Name string         `json:"name"`
	URLs map[string]string `json:"urls"`
}

type ffzSet struct {
	Emoticons []ffzEmote `json:"emoticons"`
}

type ffzGlobalResponse struct {
	Sets map[string]ffzSet `json:"sets"`
}

type ffzChannelResponse struct {
	Sets map[string]ffzSet `json:"sets"`
}

func ffzSetsToMap(sets map[string]ffzSet) map[string]string {
	m := make(map[string]string)
	for _, set := range sets {
		for _, e := range set.Emoticons {
			if url, ok := e.URLs["1"]; ok {
				if strings.HasPrefix(url, "//") {
					url = "https:" + url
				}
				m[e.Name] = url
			}
		}
	}
	return m
}

type sevenTVEmote struct {
	Name string        `json:"name"`
	Data sevenTVData   `json:"data"`
}

type sevenTVData struct {
	Host sevenTVHost `json:"host"`
}

type sevenTVHost struct {
	URL   string          `json:"url"`
	Files []sevenTVFile   `json:"files"`
}

type sevenTVFile struct {
	Name   string `json:"name"`
	Format string `json:"format"`
}

type sevenTVSetResponse struct {
	Emotes []sevenTVEmote `json:"emotes"`
}

type sevenTVUserResponse struct {
	EmoteSet *sevenTVSetResponse `json:"emote_set"`
}

func sevenTVToMap(emotes []sevenTVEmote) map[string]string {
	m := make(map[string]string, len(emotes))
	for _, e := range emotes {
		if e.Data.Host.URL == "" {
			continue
		}
		fileName := "1x.avif"
		for _, f := range e.Data.Host.Files {
			if f.Name == "1x.webp" {
				fileName = "1x.webp"
				break
			}
		}
		m[e.Name] = "https:" + e.Data.Host.URL + "/" + fileName
	}
	return m
}
