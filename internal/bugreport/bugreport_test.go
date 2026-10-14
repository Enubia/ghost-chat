package bugreport

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"
)

type fixture struct {
	reporter *Reporter
	opened   []string
	hits     int
	body     []byte
	header   http.Header
	path     string
}

func newFixture(t *testing.T, handler func(w http.ResponseWriter, r *http.Request)) *fixture {
	t.Helper()

	f := &fixture{}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		f.hits++
		f.body, _ = io.ReadAll(r.Body)
		f.header = r.Header.Clone()
		f.path = r.Method + " " + r.URL.Path

		handler(w, r)
	}))

	t.Cleanup(server.Close)

	f.reporter = &Reporter{
		Endpoint:  server.URL,
		Version:   "1.2.3",
		InstallID: func() (string, error) { return "11111111-1111-4111-8111-111111111111", nil },
		Platforms: func() []string { return []string{"twitch", "kick"} },
		Logs:      func(int) (string, error) { return "SECRET-LOG-LINE", nil },
		OpenURL: func(u string) error {
			f.opened = append(f.opened, u)

			return nil
		},
	}

	return f
}

func validInput() Input {
	return Input{
		Title:              "Chat freezes",
		Description:        "It freezes after a while",
		Steps:              "1. connect",
		Discord:            "@Some.User",
		IncludeDiagnostics: true,
	}
}

func status(code int, body string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(code)

		if body != "" {
			_, _ = w.Write([]byte(body))
		}
	}
}

func TestSubmitSent(t *testing.T) {
	f := newFixture(t, status(201, `{"id": 42}`))

	res, err := f.reporter.Submit(validInput())

	if err != nil {
		t.Fatal(err)
	}

	if res.Status != "sent" || res.ID != 42 {
		t.Fatalf("got %+v", res)
	}

	if f.path != "POST /report" {
		t.Fatalf("path %s", f.path)
	}

	if f.header.Get("Content-Type") != "application/json" || f.header.Get("User-Agent") != "ghost-chat/1.2.3" {
		t.Fatalf("headers %v", f.header)
	}

	if len(f.opened) != 0 {
		t.Fatal("browser opened")
	}
}

func TestRequestBodyMatchesContract(t *testing.T) {
	f := newFixture(t, status(201, `{"id": 1}`))

	if _, err := f.reporter.Submit(validInput()); err != nil {
		t.Fatal(err)
	}

	var got map[string]any

	if err := json.Unmarshal(f.body, &got); err != nil {
		t.Fatal(err)
	}

	for _, key := range []string{"title", "description", "steps", "discord", "installId", "diagnostics"} {
		if _, ok := got[key]; !ok {
			t.Fatalf("missing %s in %s", key, f.body)
		}
	}

	if len(got) != 6 {
		t.Fatalf("unexpected fields %s", f.body)
	}

	if got["discord"] != "some.user" || got["installId"] != "11111111-1111-4111-8111-111111111111" {
		t.Fatalf("body %s", f.body)
	}

	diag := got["diagnostics"].(map[string]any)

	for _, key := range []string{"appVersion", "os", "arch", "platforms", "logs"} {
		if _, ok := diag[key]; !ok {
			t.Fatalf("missing diagnostics.%s", key)
		}
	}

	if len(diag) != 5 || diag["appVersion"] != "1.2.3" || diag["logs"] != "SECRET-LOG-LINE" {
		t.Fatalf("diagnostics %v", diag)
	}

	platforms := diag["platforms"].([]any)

	if len(platforms) != 2 || platforms[0] != "twitch" {
		t.Fatalf("platforms %v", platforms)
	}
}

func TestRequestBodyWithoutDiagnostics(t *testing.T) {
	f := newFixture(t, status(201, `{"id": 1}`))

	in := validInput()
	in.IncludeDiagnostics = false
	in.Discord = ""

	if _, err := f.reporter.Submit(in); err != nil {
		t.Fatal(err)
	}

	var got map[string]any

	_ = json.Unmarshal(f.body, &got)

	if v, ok := got["diagnostics"]; !ok || v != nil {
		t.Fatalf("diagnostics should be null: %s", f.body)
	}

	if v, ok := got["discord"]; !ok || v != nil {
		t.Fatalf("discord should be null: %s", f.body)
	}
}

func TestPlatformsEmptyIsArray(t *testing.T) {
	f := newFixture(t, status(201, `{"id": 1}`))
	f.reporter.Platforms = func() []string { return nil }

	if _, err := f.reporter.Submit(validInput()); err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(string(f.body), `"platforms":[]`) {
		t.Fatalf("body %s", f.body)
	}
}

func TestSubmitInvalidFromServer(t *testing.T) {
	f := newFixture(t, status(400, `{"error":"invalid","field":"title"}`))

	res, err := f.reporter.Submit(validInput())

	if err != nil {
		t.Fatal(err)
	}

	if res.Status != "invalid" || res.Field != "title" {
		t.Fatalf("got %+v", res)
	}
}

func TestSubmitRateLimited(t *testing.T) {
	f := newFixture(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Retry-After", "120")
		w.WriteHeader(429)
	})

	res, err := f.reporter.Submit(validInput())

	if err != nil {
		t.Fatal(err)
	}

	if res.Status != "rate_limited" || res.RetryAfter != 120 {
		t.Fatalf("got %+v", res)
	}

	if len(f.opened) != 0 {
		t.Fatal("browser opened")
	}
}

func TestSubmitFallbackStatuses(t *testing.T) {
	for _, code := range []int{503, 500, 502, 413} {
		f := newFixture(t, status(code, ""))

		res, err := f.reporter.Submit(validInput())

		if err != nil {
			t.Fatal(err)
		}

		if res.Status != "fallback" || len(f.opened) != 1 {
			t.Fatalf("code %d: got %+v opened %v", code, res, f.opened)
		}
	}
}

func TestSubmitFallbackOnNetworkError(t *testing.T) {
	f := newFixture(t, status(201, `{"id":1}`))
	f.reporter.Endpoint = "http://127.0.0.1:1"

	res, err := f.reporter.Submit(validInput())

	if err != nil {
		t.Fatal(err)
	}

	if res.Status != "fallback" || len(f.opened) != 1 {
		t.Fatalf("got %+v", res)
	}
}

func TestSubmitFallbackOnTimeout(t *testing.T) {
	release := make(chan struct{})

	f := newFixture(t, func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-release:
		case <-r.Context().Done():
		}
	})

	t.Cleanup(func() { close(release) })

	f.reporter.Timeout = 50 * time.Millisecond

	start := time.Now()
	res, err := f.reporter.Submit(validInput())

	if err != nil {
		t.Fatal(err)
	}

	if res.Status != "fallback" || len(f.opened) != 1 {
		t.Fatalf("got %+v", res)
	}

	if time.Since(start) > 2*time.Second {
		t.Fatal("timeout not honored")
	}
}

func TestDefaultTimeout(t *testing.T) {
	if (&Reporter{}).timeout() != 15*time.Second {
		t.Fatal("default timeout should be 15s")
	}
}

func TestSubmitEmptyEndpointFallsBack(t *testing.T) {
	f := newFixture(t, status(201, `{"id":1}`))
	f.reporter.Endpoint = ""

	res, err := f.reporter.Submit(validInput())

	if err != nil {
		t.Fatal(err)
	}

	if res.Status != "fallback" || len(f.opened) != 1 || f.hits != 0 {
		t.Fatalf("got %+v hits %d", res, f.hits)
	}
}

func TestFallbackURLIsPublicSafe(t *testing.T) {
	f := newFixture(t, status(503, ""))

	if _, err := f.reporter.Submit(validInput()); err != nil {
		t.Fatal(err)
	}

	raw := f.opened[0]

	if !strings.HasPrefix(raw, "https://github.com/Enubia/ghost-chat/issues/new?") {
		t.Fatalf("url %s", raw)
	}

	if strings.Contains(raw, "SECRET-LOG-LINE") || strings.Contains(strings.ToLower(raw), "some.user") || strings.Contains(raw, "Some.User") {
		t.Fatalf("leak in %s", raw)
	}

	u, _ := url.Parse(raw)
	q := u.Query()

	if q.Get("labels") != "bug" || q.Get("title") != "Chat freezes" {
		t.Fatalf("query %v", q)
	}

	body := q.Get("body")

	for _, want := range []string{"It freezes after a while", "1. connect", "1.2.3"} {
		if !strings.Contains(body, want) {
			t.Fatalf("body missing %q: %s", want, body)
		}
	}
}

func TestFallbackURLWithoutDiagnosticsOmitsEnvironment(t *testing.T) {
	f := newFixture(t, status(503, ""))

	in := validInput()
	in.IncludeDiagnostics = false

	if _, err := f.reporter.Submit(in); err != nil {
		t.Fatal(err)
	}

	u, _ := url.Parse(f.opened[0])

	if strings.Contains(u.Query().Get("body"), "1.2.3") {
		t.Fatal("version included without diagnostics")
	}
}

func TestClientSideValidation(t *testing.T) {
	long := func(n int) string { return strings.Repeat("a", n) }

	cases := []struct {
		name   string
		mutate func(*Input)
		field  string
	}{
		{"short title", func(i *Input) { i.Title = "abcd" }, "title"},
		{"blank title", func(i *Input) { i.Title = "      " }, "title"},
		{"long title", func(i *Input) { i.Title = long(121) }, "title"},
		{"empty description", func(i *Input) { i.Description = "  " }, "description"},
		{"long description", func(i *Input) { i.Description = long(5001) }, "description"},
		{"long steps", func(i *Input) { i.Steps = long(5001) }, "steps"},
		{"discord short", func(i *Input) { i.Discord = "a" }, "discord"},
		{"discord long", func(i *Input) { i.Discord = long(33) }, "discord"},
		{"discord chars", func(i *Input) { i.Discord = "bad name" }, "discord"},
		{"discord dots", func(i *Input) { i.Discord = "a..b" }, "discord"},
		{"discord email", func(i *Input) { i.Discord = "a@b.com" }, "discord"},
		{"discord double at", func(i *Input) { i.Discord = "@@abc" }, "discord"},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			f := newFixture(t, status(201, `{"id":1}`))
			in := validInput()
			c.mutate(&in)

			res, err := f.reporter.Submit(in)

			if err != nil {
				t.Fatal(err)
			}

			if res.Status != "invalid" || res.Field != c.field {
				t.Fatalf("got %+v", res)
			}

			if f.hits != 0 || len(f.opened) != 0 {
				t.Fatal("request or browser on invalid input")
			}
		})
	}
}

func TestLengthsCountCodePoints(t *testing.T) {
	f := newFixture(t, status(201, `{"id":1}`))

	in := validInput()
	in.Title = strings.Repeat("é", 120)
	in.Description = strings.Repeat("😀", 5000)

	res, err := f.reporter.Submit(in)

	if err != nil || res.Status != "sent" {
		t.Fatalf("got %+v %v", res, err)
	}

	in.Title = strings.Repeat("😀", 121)

	res, _ = f.reporter.Submit(in)

	if res.Status != "invalid" || res.Field != "title" {
		t.Fatalf("got %+v", res)
	}
}

func TestTrimAndControlStripping(t *testing.T) {
	f := newFixture(t, status(201, `{"id":1}`))

	in := validInput()
	in.Title = "  Ti\x00tle\x07 here  "
	in.Description = "line1\nline2\x1b"

	if _, err := f.reporter.Submit(in); err != nil {
		t.Fatal(err)
	}

	var got map[string]any

	_ = json.Unmarshal(f.body, &got)

	if got["title"] != "Title here" || got["description"] != "line1\nline2" {
		t.Fatalf("body %s", f.body)
	}
}

func TestNormalizeDiscord(t *testing.T) {
	cases := map[string]string{
		"":             "",
		"   ":          "",
		"@":            "",
		" @Foo_Bar.1 ": "foo_bar.1",
	}

	for in, want := range cases {
		got, ok := normalizeDiscord(in)

		if !ok || got != want {
			t.Fatalf("%q: got %q ok=%v", in, got, ok)
		}
	}
}

func TestPreviewDiagnostics(t *testing.T) {
	f := newFixture(t, status(201, ""))

	d, err := f.reporter.PreviewDiagnostics()

	if err != nil {
		t.Fatal(err)
	}

	if d.AppVersion != "1.2.3" || d.OS == "" || d.Arch == "" || d.Logs != "SECRET-LOG-LINE" || len(d.Platforms) != 2 {
		t.Fatalf("got %+v", d)
	}
}

func TestLogsRequestedAtMost64KiB(t *testing.T) {
	f := newFixture(t, status(201, `{"id":1}`))

	var asked int

	f.reporter.Logs = func(n int) (string, error) {
		asked = n

		return strings.Repeat("\"", n), nil
	}

	if _, err := f.reporter.Submit(validInput()); err != nil {
		t.Fatal(err)
	}

	if asked != 64*1024 {
		t.Fatalf("asked %d", asked)
	}

	if len(f.body) > 96*1024 {
		t.Fatalf("body %d bytes exceeds 96 KiB", len(f.body))
	}
}

func TestLogsErrorStillSends(t *testing.T) {
	f := newFixture(t, status(201, `{"id":1}`))
	f.reporter.Logs = func(int) (string, error) { return "", io.ErrUnexpectedEOF }

	res, err := f.reporter.Submit(validInput())

	if err != nil || res.Status != "sent" {
		t.Fatalf("got %+v %v", res, err)
	}
}
