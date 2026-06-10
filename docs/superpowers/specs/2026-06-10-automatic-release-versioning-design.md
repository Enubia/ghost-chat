# Automatic Release Versioning

## Problem

The release workflow (`.github/workflows/release.yml`) requires manually typing a version
string on every dispatch. The version should instead be derived from the commits since the
last release, with an option to cut a release candidate.

## Decisions

- **Bump rule:** a release always bumps at least **patch**. Conventional commit subjects
  escalate the bump: `feat:` → minor, `feat!:` / `BREAKING CHANGE` → major. Non-conventional
  commits count as patch-level. `chore:`/`docs:`/etc. never block a release.
- **Baseline:** the bump is always computed from the last **stable** tag (`vX.Y.Z`, excluding
  `-rc.*`). A final release after RCs recomputes from the last stable tag, so commits landed
  after an RC can still escalate the version (e.g. `v4.3.0-rc.2` + later `feat!:` → `v5.0.0`).
- **Release candidates:** a `release-candidate` checkbox input appends `-rc.N` to the computed
  version. `N` auto-increments past existing RC tags for the same base version
  (`v4.3.0-rc.1` exists → next RC is `v4.3.0-rc.2`). RC releases are marked **prerelease**
  on GitHub in addition to draft.
- **Manual override:** the existing `version` input becomes optional. When set, it is used
  verbatim and all auto-detection is skipped.
- **Conventional commit enforcement:** PR titles are linted in `quick-checks.yml` so
  squash-merge commit subjects stay conventional. This keeps bump detection and generated
  release notes accurate. Local commits inside a PR are not policed.

## Components

### `.github/scripts/next-version.sh`

Bash script, runnable locally. Inputs via arguments or env: RC mode flag, optional override
version. Output: the computed tag (e.g. `v4.3.0` or `v4.3.0-rc.2`) on stdout.

Logic:

1. If an override version is given, print it and exit.
2. Find the last stable tag: highest `v*.*.*` tag excluding prereleases (version sort).
3. Scan commits in `<last-stable>..HEAD` (subjects via `--format=%s`, bodies via `%b` for
   the breaking-change check):
   - any subject matching `^[a-z]+(\(.+\))?!:` or body containing `BREAKING CHANGE` → major
   - else any subject matching `^feat(\(.+\))?:` → minor
   - else → patch (always at least patch; non-conventional subjects land here)
4. Apply the bump to the last stable version.
5. If RC mode: find existing `v<base>-rc.*` tags, append `-rc.<max+1>` (or `-rc.1` if none).

### `.github/workflows/release.yml`

- Inputs: `version` (optional override), `release-candidate` (boolean, default false).
- New first job `determine-version`: checkout with `fetch-depth: 0`, run the script, expose
  the result as a job output, print it in the job summary (`$GITHUB_STEP_SUMMARY`).
- `build-macos`, `build-windows`, `create-release` depend on `determine-version` and use
  `needs.determine-version.outputs.version` everywhere `VERSION_TAG` is used today.
- `create-release` passes `prerelease: ${{ inputs.release-candidate }}` to
  `softprops/action-gh-release` (draft stays on).

### `.github/workflows/quick-checks.yml`

- New job using `amannn/action-semantic-pull-request` to lint PR titles against
  conventional commit types. Runs on `pull_request` title-affecting events
  (`opened`, `edited`, `synchronize`).

## Error handling

- No stable tag found: script exits with an error (this repo always has stable tags).
- Override version given alongside the RC checkbox: the override wins verbatim; the script
  does not append `-rc.N` to an override.
- Tag collision (computed tag already exists): `git push origin <tag>` in `create-release`
  fails the workflow, which is the desired signal that something is off.

## Testing

- Script is plain bash over `git log`/`git tag`, testable locally against the real repo
  history (e.g. verify it computes the expected next version) and in a scratch repo with
  synthetic tags/commits covering: patch-only commits, `feat:`, `feat!:`, RC increment,
  final-after-RC, and override.
- Workflow changes are validated by dispatching an RC release once merged.
