package bugreport

import (
	"slices"
	"sync"
)

type PlatformTracker struct {
	mu        sync.Mutex
	connected map[string]bool
}

func (t *PlatformTracker) Observe(event string, data any) {
	if event != "chat:connected" && event != "chat:disconnected" {
		return
	}

	m, ok := data.(map[string]string)

	if !ok {
		return
	}

	t.mu.Lock()
	defer t.mu.Unlock()

	if t.connected == nil {
		t.connected = map[string]bool{}
	}

	t.connected[m["platform"]] = event == "chat:connected"
}

func (t *PlatformTracker) Connected() []string {
	t.mu.Lock()
	defer t.mu.Unlock()

	out := []string{}

	for name, ok := range t.connected {
		if ok {
			out = append(out, name)
		}
	}

	slices.Sort(out)

	return out
}
