package main

import (
	"ghost-chat/internal/config"

	"github.com/wailsapp/wails/v3/pkg/application"
)

const (
	minWindowDim = 100
	maxWindowDim = 4000
	minVisible   = 64
)

func sanitizeWindowSize(w, h int) (int, int) {
	def := config.DefaultConfig().WindowState

	if w < minWindowDim || w > maxWindowDim {
		w = def.Width
	}

	if h < minWindowDim || h > maxWindowDim {
		h = def.Height
	}

	return w, h
}

func screenWorkAreas(screens []*application.Screen) []application.Rect {
	areas := make([]application.Rect, 0, len(screens))

	for _, s := range screens {
		if s == nil {
			continue
		}

		areas = append(areas, s.WorkArea)
	}

	return areas
}

func positionVisible(workAreas []application.Rect, x, y, w, h int) bool {
	needX := min(minVisible, w)
	needY := min(minVisible, h)

	for _, area := range workAreas {
		if area.Width <= 0 || area.Height <= 0 {
			continue
		}

		overlapX := min(x+w, area.X+area.Width) - max(x, area.X)
		overlapY := min(y+h, area.Y+area.Height) - max(y, area.Y)

		if overlapX >= needX && overlapY >= needY {
			return true
		}
	}

	return false
}

func centerInWorkArea(area application.Rect, w, h int) (int, int) {
	x := area.X + (area.Width-w)/2
	y := area.Y + (area.Height-h)/2

	return x, y
}
