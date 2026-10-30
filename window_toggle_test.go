package main

import (
	"slices"
	"testing"
)

type fakeToggleWindow struct {
	visible   bool
	minimised bool
	calls     []string
}

func (f *fakeToggleWindow) IsVisible() bool   { return f.visible }
func (f *fakeToggleWindow) IsMinimised() bool { return f.minimised }
func (f *fakeToggleWindow) Hide()             { f.calls = append(f.calls, "hide") }
func (f *fakeToggleWindow) Show()             { f.calls = append(f.calls, "show") }
func (f *fakeToggleWindow) UnMinimise()       { f.calls = append(f.calls, "unminimise") }
func (f *fakeToggleWindow) Focus()            { f.calls = append(f.calls, "focus") }

func TestToggleWindow(t *testing.T) {
	cases := []struct {
		name      string
		visible   bool
		minimised bool
		want      []string
	}{
		{"visible hides", true, false, []string{"hide"}},
		{"hidden shows", false, false, []string{"show", "focus"}},
		{"minimised but visible restores", true, true, []string{"show", "unminimise", "focus"}},
		{"hidden and minimised restores", false, true, []string{"show", "unminimise", "focus"}},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			f := &fakeToggleWindow{visible: tc.visible, minimised: tc.minimised}

			toggleWindow(f)

			if !slices.Equal(f.calls, tc.want) {
				t.Fatalf("calls = %v, want %v", f.calls, tc.want)
			}
		})
	}
}
