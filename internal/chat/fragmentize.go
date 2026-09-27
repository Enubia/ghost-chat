package chat

import "sort"

func Fragmentize(text string, entities []Entity) []MessageFragment {
	if text == "" {
		return nil
	}

	runes := []rune(text)
	total := len(runes)

	valid := make([]Entity, 0, len(entities))

	for _, e := range entities {
		if e.Start < 0 || e.End < e.Start || e.End >= total {
			continue
		}

		valid = append(valid, e)
	}

	sort.SliceStable(valid, func(i, j int) bool {
		return valid[i].Start < valid[j].Start
	})

	nonOverlapping := make([]Entity, 0, len(valid))
	cursor := 0

	for _, e := range valid {
		if e.Start < cursor {
			continue
		}

		nonOverlapping = append(nonOverlapping, e)
		cursor = e.End + 1
	}

	if len(nonOverlapping) == 0 {
		return []MessageFragment{{Type: FragmentText, Text: text}}
	}

	frags := make([]MessageFragment, 0, len(nonOverlapping)*2+1)
	pos := 0

	for _, e := range nonOverlapping {
		if e.Start > pos {
			frags = append(frags, MessageFragment{
				Type: FragmentText,
				Text: string(runes[pos:e.Start]),
			})
		}

		frags = append(frags, MessageFragment{
			Type: e.Kind,
			Text: string(runes[e.Start : e.End+1]),
			URL:  e.URL,
		})

		pos = e.End + 1
	}

	if pos < total {
		frags = append(frags, MessageFragment{
			Type: FragmentText,
			Text: string(runes[pos:]),
		})
	}

	return frags
}
