package chat

import "sort"

func Fragmentize(text string, emotes []Emote) []MessageFragment {
	if text == "" {
		return nil
	}

	runes := []rune(text)
	total := len(runes)

	valid := make([]Emote, 0, len(emotes))

	for _, e := range emotes {
		if e.Start < 0 || e.End < e.Start || e.End >= total {
			continue
		}

		valid = append(valid, e)
	}

	sort.Slice(valid, func(i, j int) bool {
		return valid[i].Start < valid[j].Start
	})

	deduped := make([]Emote, 0, len(valid))
	cursor := 0

	for _, e := range valid {
		if e.Start < cursor {
			continue
		}

		deduped = append(deduped, e)
		cursor = e.End + 1
	}

	if len(deduped) == 0 {
		return []MessageFragment{{Type: "text", Text: text}}
	}

	frags := make([]MessageFragment, 0, len(deduped)*2+1)
	pos := 0

	for _, e := range deduped {
		if e.Start > pos {
			frags = append(frags, MessageFragment{
				Type: "text",
				Text: string(runes[pos:e.Start]),
			})
		}

		frags = append(frags, MessageFragment{
			Type: "emote",
			Text: string(runes[e.Start : e.End+1]),
			URL:  e.URL,
		})

		pos = e.End + 1
	}

	if pos < total {
		frags = append(frags, MessageFragment{
			Type: "text",
			Text: string(runes[pos:]),
		})
	}

	return frags
}
