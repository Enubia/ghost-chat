package config

import (
	"fmt"
	"strconv"
	"strings"
)

type Migration struct {
	Version string
	Migrate func(*Config)
}

var migrations = []Migration{
	{
		// Remove stale YouTubeConfig fields (retries, fetch_delay, default_channel_id)
		// that were left over from the old YouTube Data API approach.
		// Add youtube.fade and youtube.fade_timeout with sensible defaults.
		Version: "4.0.0",
		Migrate: func(cfg *Config) {
			if cfg.YouTube.FadeTimeout == 0 {
				cfg.YouTube.FadeTimeout = 30
			}
		},
	},
}

func parseSemver(version string) (major, minor, patch int, err error) {
	parts := strings.Split(version, ".")

	if len(parts) != 3 {
		return 0, 0, 0, fmt.Errorf("invalid semver: %s", version)
	}

	major, err = strconv.Atoi(parts[0])

	if err != nil {
		return 0, 0, 0, fmt.Errorf("failed to parse major version %s: %w", parts[0], err)
	}

	minor, err = strconv.Atoi(parts[1])

	if err != nil {
		return 0, 0, 0, fmt.Errorf("failed to parse minor version %s: %w", parts[1], err)
	}

	patch, err = strconv.Atoi(parts[2])

	if err != nil {
		return 0, 0, 0, fmt.Errorf("failed to parse patch version %s: %w", parts[2], err)
	}

	return major, minor, patch, nil
}

func compareSemver(a, b string) (int, error) {
	majorA, minorA, patchA, err := parseSemver(a)

	if err != nil {
		return 0, err
	}

	majorB, minorB, patchB, err := parseSemver(b)

	if err != nil {
		return 0, err
	}

	if majorA != majorB {
		if majorA > majorB {
			return 1, nil
		}

		return -1, nil
	}

	if minorA != minorB {
		if minorA > minorB {
			return 1, nil
		}

		return -1, nil
	}

	if patchA != patchB {
		if patchA > patchB {
			return 1, nil
		}

		return -1, nil
	}

	return 0, nil
}

// helper function so that we can test the migration logic
func runMigrations(cfg *Config, migrations []Migration, targetVersion string) error {
	for _, migration := range migrations {
		comparison, err := compareSemver(migration.Version, cfg.Version)

		if err != nil {
			return fmt.Errorf("failed to compare versions: %w", err)
		}

		// if migrations version is older or the same, skip it
		if comparison <= 0 {
			continue
		}

		comparison, err = compareSemver(migration.Version, targetVersion)

		if err != nil {
			return fmt.Errorf("failed to compare versions: %w", err)
		}

		// if migrations version is newer than target, skip it
		if comparison > 0 {
			continue
		}

		migration.Migrate(cfg)
		cfg.Version = migration.Version
	}

	return nil
}

func RunMigrations(cfg *Config, targetVersion string) error {
	return runMigrations(cfg, migrations, targetVersion)
}
