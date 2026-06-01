package main

import (
	"ghost-chat/internal/config"
	"testing"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func TestSanitizeWindowSize(t *testing.T) {
	def := config.DefaultConfig().WindowState

	tests := []struct {
		name  string
		w, h  int
		wantW int
		wantH int
	}{
		{"valid", 400, 600, 400, 600},
		{"zero", 0, 0, def.Width, def.Height},
		{"negative", -10, -10, def.Width, def.Height},
		{"too small", 50, 50, def.Width, def.Height},
		{"too large", 9000, 9000, def.Width, def.Height},
		{"width only invalid", 0, 600, def.Width, 600},
		{"height only invalid", 400, 0, 400, def.Height},
		{"at min boundary", minWindowDim, minWindowDim, minWindowDim, minWindowDim},
		{"at max boundary", maxWindowDim, maxWindowDim, maxWindowDim, maxWindowDim},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotW, gotH := sanitizeWindowSize(tt.w, tt.h)

			if gotW != tt.wantW || gotH != tt.wantH {
				t.Errorf("sanitizeWindowSize(%d, %d) = (%d, %d), want (%d, %d)", tt.w, tt.h, gotW, gotH, tt.wantW, tt.wantH)
			}
		})
	}
}

func TestPositionVisible(t *testing.T) {
	primary := application.Rect{X: 0, Y: 0, Width: 1920, Height: 1080}
	secondary := application.Rect{X: 1920, Y: 0, Width: 1920, Height: 1080}

	tests := []struct {
		name      string
		workAreas []application.Rect
		x, y      int
		w, h      int
		want      bool
	}{
		{"centered on primary", []application.Rect{primary}, 760, 240, 400, 600, true},
		{"top-left corner", []application.Rect{primary}, 0, 0, 400, 600, true},
		{"on secondary monitor", []application.Rect{primary, secondary}, 2500, 200, 400, 600, true},
		{"secondary unplugged", []application.Rect{primary}, 2500, 200, 400, 600, false},
		{"far off-screen right", []application.Rect{primary}, 5000, 5000, 400, 600, false},
		{"negative off-screen", []application.Rect{primary}, -500, -800, 400, 600, false},
		{"barely visible edge sliver", []application.Rect{primary}, -390, 200, 400, 600, false},
		{"enough visible at left edge", []application.Rect{primary}, -300, 200, 400, 600, true},
		{"no screens", nil, 100, 100, 400, 600, false},
		{"empty work area ignored", []application.Rect{{X: 0, Y: 0, Width: 0, Height: 0}}, 0, 0, 400, 600, false},
		{"partially below bottom but reachable", []application.Rect{primary}, 760, 1000, 400, 600, true},
		{"too far below bottom", []application.Rect{primary}, 760, 1040, 400, 600, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := positionVisible(tt.workAreas, tt.x, tt.y, tt.w, tt.h)

			if got != tt.want {
				t.Errorf("positionVisible(%v, %d, %d, %d, %d) = %v, want %v", tt.workAreas, tt.x, tt.y, tt.w, tt.h, got, tt.want)
			}
		})
	}
}

func TestCenterInWorkArea(t *testing.T) {
	tests := []struct {
		name  string
		area  application.Rect
		w, h  int
		wantX int
		wantY int
	}{
		{"primary origin", application.Rect{X: 0, Y: 0, Width: 1920, Height: 1080}, 400, 600, 760, 240},
		{"offset secondary", application.Rect{X: 1920, Y: 0, Width: 1920, Height: 1080}, 400, 600, 2680, 240},
		{"work area with taskbar offset", application.Rect{X: 0, Y: 40, Width: 1920, Height: 1040}, 400, 600, 760, 260},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotX, gotY := centerInWorkArea(tt.area, tt.w, tt.h)

			if gotX != tt.wantX || gotY != tt.wantY {
				t.Errorf("centerInWorkArea(%v, %d, %d) = (%d, %d), want (%d, %d)", tt.area, tt.w, tt.h, gotX, gotY, tt.wantX, tt.wantY)
			}
		})
	}
}

func TestScreenWorkAreas(t *testing.T) {
	a := application.Rect{X: 0, Y: 0, Width: 1920, Height: 1080}
	b := application.Rect{X: 1920, Y: 0, Width: 2560, Height: 1440}

	screens := []*application.Screen{
		{WorkArea: a},
		nil,
		{WorkArea: b},
	}

	areas := screenWorkAreas(screens)

	if len(areas) != 2 {
		t.Fatalf("expected 2 work areas (nil skipped), got %d", len(areas))
	}

	if areas[0] != a || areas[1] != b {
		t.Errorf("unexpected work areas: %v", areas)
	}
}
