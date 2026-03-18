package updater

import (
	"encoding/json"
	"fmt"
	"ghost-chat/internal/config"
	"net/http"
	"time"
)

type UpdateInfo struct {
	Version string `json:"version"`
	URL     string `json:"url"`
}

type githubRelease struct {
	TagName string `json:"tag_name"`
	HTMLURL string `json:"html_url"`
}

func CheckForUpdate(currentVersion string) (*UpdateInfo, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest("GET", "https://api.github.com/repos/Enubia/ghost-chat/releases/latest", nil)

	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)

	if err != nil {
		return nil, fmt.Errorf("failed to fetch latest release: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var release githubRelease

	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	latestVersion := config.NormalizeVersion(release.TagName)
	normalizedCurrent := config.NormalizeVersion(currentVersion)

	cmp, err := config.CompareSemver(latestVersion, normalizedCurrent)

	if err != nil {
		return nil, fmt.Errorf("failed to compare versions: %w", err)
	}

	if cmp <= 0 {
		return nil, nil
	}

	return &UpdateInfo{
		Version: release.TagName,
		URL:     release.HTMLURL,
	}, nil
}
