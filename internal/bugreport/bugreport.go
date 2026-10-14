package bugreport

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"runtime"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	StatusSent        = "sent"
	StatusInvalid     = "invalid"
	StatusRateLimited = "rate_limited"
	StatusFallback    = "fallback"

	maxLogBytes      = 64 * 1024
	maxBodyBytes     = 96 * 1024
	maxResponseBytes = 64 * 1024
	defaultTimeout   = 15 * time.Second
	fallbackBaseURL  = "https://github.com/Enubia/ghost-chat/issues/new"
	fallbackMaxText  = 2000
)

type Input struct {
	Title              string `json:"title"`
	Description        string `json:"description"`
	Steps              string `json:"steps"`
	Discord            string `json:"discord"`
	IncludeDiagnostics bool   `json:"includeDiagnostics"`
}

type Diagnostics struct {
	AppVersion string   `json:"appVersion"`
	OS         string   `json:"os"`
	Arch       string   `json:"arch"`
	Platforms  []string `json:"platforms"`
	Logs       string   `json:"logs"`
}

type Result struct {
	Status     string `json:"status"`
	ID         int    `json:"id"`
	Field      string `json:"field"`
	RetryAfter int    `json:"retryAfter"`
}

type payload struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Steps       string       `json:"steps"`
	Discord     *string      `json:"discord"`
	InstallID   string       `json:"installId"`
	Diagnostics *Diagnostics `json:"diagnostics"`
}

type Reporter struct {
	Endpoint  string
	Version   string
	Timeout   time.Duration
	InstallID func() (string, error)
	Platforms func() []string
	Logs      func(maxBytes int) (string, error)
	OpenURL   func(url string) error
}

func (r *Reporter) timeout() time.Duration {
	if r.Timeout > 0 {
		return r.Timeout
	}

	return defaultTimeout
}

func (r *Reporter) PreviewDiagnostics() (Diagnostics, error) {
	return r.diagnostics(maxLogBytes), nil
}

func (r *Reporter) diagnostics(logBytes int) Diagnostics {
	d := Diagnostics{
		AppVersion: r.Version,
		OS:         runtime.GOOS,
		Arch:       runtime.GOARCH,
		Platforms:  []string{},
	}

	if r.Platforms != nil {
		if p := r.Platforms(); p != nil {
			d.Platforms = p
		}
	}

	if r.Logs != nil {
		logs, err := r.Logs(logBytes)

		if err != nil {
			slog.Warn("failed to read log tail for bug report", "error", err)
		}

		d.Logs = strings.ToValidUTF8(logs, "")
	}

	return d
}

func (r *Reporter) Submit(in Input) (Result, error) {
	p, field := buildPayload(in)

	if field != "" {
		return Result{Status: StatusInvalid, Field: field}, nil
	}

	installID, err := r.InstallID()

	if err != nil {
		return Result{}, fmt.Errorf("resolve install id: %w", err)
	}

	p.InstallID = installID

	if in.IncludeDiagnostics {
		d := r.diagnostics(maxLogBytes)
		p.Diagnostics = &d
	}

	body, err := encodeWithinLimit(&p)

	if err != nil {
		return Result{}, fmt.Errorf("encode report: %w", err)
	}

	if r.Endpoint == "" {
		return r.fallback(p), nil
	}

	res, ok := r.post(body)

	if !ok {
		return r.fallback(p), nil
	}

	return res, nil
}

func (r *Reporter) post(body []byte) (Result, bool) {
	req, err := http.NewRequest(http.MethodPost, strings.TrimRight(r.Endpoint, "/")+"/report", bytes.NewReader(body))

	if err != nil {
		slog.Warn("failed to build bug report request", "error", err)

		return Result{}, false
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "ghost-chat/"+r.Version)

	client := &http.Client{Timeout: r.timeout()}

	resp, err := client.Do(req)

	if err != nil {
		slog.Warn("bug report request failed", "error", err)

		return Result{}, false
	}

	defer resp.Body.Close()

	data, _ := io.ReadAll(io.LimitReader(resp.Body, maxResponseBytes))

	switch {
	case resp.StatusCode == http.StatusCreated:
		var out struct {
			ID int `json:"id"`
		}

		if err := json.Unmarshal(data, &out); err != nil {
			slog.Warn("bug report response unreadable", "error", err)
		}

		return Result{Status: StatusSent, ID: out.ID}, true
	case resp.StatusCode == http.StatusBadRequest:
		var out struct {
			Field string `json:"field"`
		}

		_ = json.Unmarshal(data, &out)

		return Result{Status: StatusInvalid, Field: out.Field}, true
	case resp.StatusCode == http.StatusTooManyRequests:
		seconds, _ := strconv.Atoi(strings.TrimSpace(resp.Header.Get("Retry-After")))

		return Result{Status: StatusRateLimited, RetryAfter: seconds}, true
	}

	slog.Warn("bug report endpoint unavailable", "status", resp.StatusCode)

	return Result{}, false
}

func (r *Reporter) fallback(p payload) Result {
	if r.OpenURL == nil {
		return Result{Status: StatusFallback}
	}

	if err := r.OpenURL(fallbackURL(p, r.Version)); err != nil {
		slog.Error("failed to open fallback issue url", "error", err)
	}

	return Result{Status: StatusFallback}
}

func fallbackURL(p payload, version string) string {
	var b strings.Builder

	b.WriteString("## Description\n\n")
	b.WriteString(truncate(p.Description, fallbackMaxText))

	if p.Steps != "" {
		b.WriteString("\n\n## Steps to reproduce\n\n")
		b.WriteString(truncate(p.Steps, fallbackMaxText))
	}

	fmt.Fprintf(&b, "\n\n## Environment\n\n- App version: %s\n- OS: %s/%s\n", version, runtime.GOOS, runtime.GOARCH)

	q := url.Values{}

	q.Set("labels", "bug")
	q.Set("title", p.Title)
	q.Set("body", b.String())

	return fallbackBaseURL + "?" + q.Encode()
}

func truncate(s string, maxRunes int) string {
	if utf8.RuneCountInString(s) <= maxRunes {
		return s
	}

	return string([]rune(s)[:maxRunes]) + "…"
}

func encodeWithinLimit(p *payload) ([]byte, error) {
	for {
		body, err := json.Marshal(p)

		if err != nil {
			return nil, err
		}

		if len(body) <= maxBodyBytes || p.Diagnostics == nil || p.Diagnostics.Logs == "" {
			return body, nil
		}

		logs := p.Diagnostics.Logs
		cut := len(body) - maxBodyBytes

		if cut > len(logs) {
			cut = len(logs)
		}

		if cut < 1024 && len(logs) > 1024 {
			cut = 1024
		}

		p.Diagnostics.Logs = strings.ToValidUTF8(logs[cut:], "")
	}
}

func buildPayload(in Input) (payload, string) {
	var p payload

	p.Title = clean(in.Title, false)
	p.Description = clean(in.Description, true)
	p.Steps = clean(in.Steps, true)

	if n := utf8.RuneCountInString(p.Title); n < 5 || n > 120 {
		return p, "title"
	}

	if n := utf8.RuneCountInString(p.Description); n < 1 || n > 5000 {
		return p, "description"
	}

	if utf8.RuneCountInString(p.Steps) > 5000 {
		return p, "steps"
	}

	discord, ok := normalizeDiscord(in.Discord)

	if !ok {
		return p, "discord"
	}

	if discord != "" {
		p.Discord = &discord
	}

	return p, ""
}

func clean(s string, keepNewlines bool) string {
	s = strings.Map(func(r rune) rune {
		if keepNewlines && (r == '\n' || r == '\t') {
			return r
		}

		if unicode.IsControl(r) {
			return -1
		}

		return r
	}, strings.ToValidUTF8(s, ""))

	return strings.TrimSpace(s)
}

func normalizeDiscord(s string) (string, bool) {
	s = strings.ToLower(strings.TrimPrefix(clean(s, false), "@"))

	if s == "" {
		return "", true
	}

	if n := utf8.RuneCountInString(s); n < 2 || n > 32 {
		return "", false
	}

	if strings.Contains(s, "..") {
		return "", false
	}

	for _, r := range s {
		if !(r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == '_' || r == '.') {
			return "", false
		}
	}

	return s, true
}
