# Automatic Release Versioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Derive the release version automatically from conventional commits since the last stable tag, with a release-candidate checkbox and a manual override, plus PR-title linting to keep commit subjects conventional.

**Architecture:** A standalone bash script (`.github/scripts/next-version.sh`) owns the version logic and is covered by a scratch-repo test script. The release workflow gains a `determine-version` job whose output feeds the existing build/release jobs. `quick-checks.yml` gains a `pull_request`-triggered job that lints PR titles.

**Tech Stack:** Bash, git, GitHub Actions, `amannn/action-semantic-pull-request`.

**Spec:** `docs/superpowers/specs/2026-06-10-automatic-release-versioning-design.md`

---

## Version rules (from the spec)

- Baseline = highest stable tag matching `vX.Y.Z` (prerelease tags like `v4.2.0-rc.1` are never the baseline).
- Bump is always at least **patch**. Any `feat:`/`feat(scope):` subject since baseline → **minor**. Any `type!:`/`type(scope)!:` subject or `BREAKING CHANGE`/`BREAKING-CHANGE` in a body → **major**.
- `--rc` appends `-rc.N` where N = highest existing `-rc.*` tag for the computed base version + 1 (or 1).
- `--override <version>` prints the override verbatim and skips everything, including `--rc`.

---

### Task 1: Version script with tests

**Files:**
- Create: `.github/scripts/next-version.test.sh`
- Create: `.github/scripts/next-version.sh`

- [ ] **Step 1: Write the failing test script**

Create `.github/scripts/next-version.test.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

script="$(cd "$(dirname "$0")" && pwd)/next-version.sh"
failures=0

assert_version() {
  local expected="$1"
  shift

  local actual
  actual="$(bash "$script" "$@" 2>&1)" || true

  if [ "$actual" = "$expected" ]; then
    echo "ok: [$*] -> $actual"
  else
    echo "FAIL: [$*] -> $actual (expected $expected)"
    failures=$((failures + 1))
  fi
}

repo="$(mktemp -d)"
trap 'rm -rf "$repo"' EXIT

cd "$repo"

git init -q
git config user.email test@test.invalid
git config user.name test
git config commit.gpgsign false

commit() {
  git commit -q --allow-empty "$@"
}

commit -m "chore: init"
git tag v4.2.0

commit -m "docs: readme"
assert_version v4.2.1
assert_version v4.2.1-rc.1 --rc

commit -m "feat(windows): scoped feature"
assert_version v4.3.0
assert_version v4.3.0-rc.1 --rc

git tag v4.3.0-rc.1
assert_version v4.3.0-rc.2 --rc
assert_version v4.3.0

commit -m "feat!: breaking subject"
assert_version v5.0.0
assert_version v5.0.0-rc.1 --rc

git tag v5.0.0
commit -m "fix(youtube): thing" -m "BREAKING CHANGE: api changed"
assert_version v6.0.0

git tag v6.0.0
commit -m "Architecture seams: non-conventional subject"
assert_version v6.0.1

commit -m "chore: casual mention" -m "note: this is not a BREAKING CHANGE, just a refactor"
assert_version v6.0.1

assert_version v9.9.9 --override v9.9.9
assert_version v9.9.9 --rc --override v9.9.9

git tag v7.0.0
assert_version "no commits since v7.0.0"

assert_version "--override requires a value" --override
assert_version "--override requires a value" --override ""

if [ "$failures" -gt 0 ]; then
  echo "$failures assertion(s) failed"
  exit 1
fi

echo "all assertions passed"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bash .github/scripts/next-version.test.sh`
Expected: every assertion prints `FAIL` (the script under test does not exist yet), final line `16 assertion(s) failed`, exit code 1.

- [ ] **Step 3: Write the version script**

Create `.github/scripts/next-version.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

rc=false
override=""

while [ $# -gt 0 ]; do
  case "$1" in
    --rc)
      rc=true
      ;;
    --override)
      if [ -z "${2:-}" ]; then
        echo "--override requires a value" >&2
        exit 1
      fi

      override="$2"
      shift
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 1
      ;;
  esac
  shift
done

if [ -n "$override" ]; then
  echo "$override"
  exit 0
fi

last_stable="$(git tag --list 'v*' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || true)"

if [ -z "$last_stable" ]; then
  echo "no stable tag found" >&2
  exit 1
fi

subjects="$(git log --format=%s "${last_stable}..HEAD")"
bodies="$(git log --format=%b "${last_stable}..HEAD")"

if [ -z "$subjects" ]; then
  echo "no commits since ${last_stable}" >&2
  exit 1
fi

bump=patch

if echo "$subjects" | grep -qE '^[a-z]+(\(.+\))?!:' || echo "$bodies" | grep -qE '^BREAKING[ -]CHANGE: '; then
  bump=major
elif echo "$subjects" | grep -qE '^feat(\(.+\))?:'; then
  bump=minor
fi

IFS=. read -r major minor patch <<<"${last_stable#v}"

case "$bump" in
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
esac

next="v${major}.${minor}.${patch}"

if [ "$rc" = true ]; then
  last_rc="$(git tag --list "${next}-rc.*" | sed "s/.*-rc\.//" | sort -n | tail -n 1)"
  next="${next}-rc.$((${last_rc:-0} + 1))"
fi

echo "$next"
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bash .github/scripts/next-version.test.sh`
Expected: 16 `ok:` lines, final line `all assertions passed`, exit code 0.

- [ ] **Step 5: Sanity-check against the real repo**

Run from the repo root: `bash .github/scripts/next-version.sh` and `bash .github/scripts/next-version.sh --rc`
Expected: last stable tag is `v4.2.0`; commits since include `fix(windows): ...` (#1292) but no `feat:` → output `v4.2.1` and `v4.2.1-rc.1`.

- [ ] **Step 6: Commit**

```bash
git add .github/scripts/next-version.sh .github/scripts/next-version.test.sh
git commit -m "feat(ci): add commit-based version detection script"
```

---

### Task 2: Wire the script into the release workflow

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: Replace the inputs and add the determine-version job**

In `.github/workflows/release.yml`, replace the `on:`/`env:` header (lines 1-14) with:

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Version override (e.g. v4.0.1) — leave empty to auto-detect from commits"
        required: false
      release-candidate:
        description: "Draft a release candidate (vX.Y.Z-rc.N, marked as prerelease)"
        type: boolean
        default: false

permissions:
  contents: write
```

Note the global `env: VERSION_TAG` block is removed — jobs read the version from the new job's output instead.

Then add this as the first job under `jobs:`:

```yaml
  determine-version:
    runs-on: ubuntu-latest

    outputs:
      version: ${{ steps.version.outputs.version }}

    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - id: version
        env:
          RC: ${{ inputs.release-candidate }}
          OVERRIDE: ${{ inputs.version }}
        run: |
          args=()

          if [ "$RC" = "true" ]; then
            args+=(--rc)
          fi

          if [ -n "$OVERRIDE" ]; then
            args+=(--override "$OVERRIDE")
          fi

          version="$(bash .github/scripts/next-version.sh "${args[@]}")"

          echo "version=$version" >> "$GITHUB_OUTPUT"
          echo "Release version: \`$version\`" >> "$GITHUB_STEP_SUMMARY"
```

- [ ] **Step 2: Point the build jobs at the job output**

In `build-macos`, add `needs: determine-version` directly under the job key, and change the package step's env:

```yaml
  build-macos:
    needs: determine-version
    runs-on: macos-latest
```

```yaml
      - run: wails3 task darwin:package:universal
        env:
          VERSION: ${{ needs.determine-version.outputs.version }}
```

Same for `build-windows`:

```yaml
  build-windows:
    needs: determine-version
    runs-on: windows-latest
```

```yaml
      - run: wails3 task build
        env:
          VERSION: ${{ needs.determine-version.outputs.version }}
```

- [ ] **Step 3: Update create-release**

Change the job header so the shell steps keep reading `$VERSION_TAG`, now sourced from the job output:

```yaml
  create-release:
    needs: [determine-version, build-macos, build-windows]
    runs-on: ubuntu-latest

    env:
      VERSION_TAG: ${{ needs.determine-version.outputs.version }}
```

In the `softprops/action-gh-release@v2` step, update `tag_name` and add `prerelease` (the rest of the step is unchanged):

```yaml
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ needs.determine-version.outputs.version }}
          draft: true
          prerelease: ${{ inputs.release-candidate }}
          generate_release_notes: true
```

- [ ] **Step 4: Verify there are no leftover references to the old input**

Run: `grep -n "github.event.inputs" .github/workflows/release.yml`
Expected: no matches (the new syntax uses `inputs.*`; `determine-version` is the only consumer of the raw inputs besides `prerelease`).

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "feat(ci): auto-detect release version with rc support"
```

---

### Task 3: PR title lint in quick checks

**Files:**
- Modify: `.github/workflows/quick-checks.yml`

- [ ] **Step 1: Add the pull_request trigger and the pr-title job**

In `.github/workflows/quick-checks.yml`, extend the `on:` block:

```yaml
on:
  push:
    branches:
      - "**"
      - "!main"
    paths:
      - "**.go"
      - "go.mod"
      - "go.sum"
      - "frontend/**"
  pull_request:
    types: [opened, edited, synchronize]
```

Guard the existing job so it only runs on pushes (add one line under `checks:`):

```yaml
jobs:
  checks:
    if: github.event_name == 'push'
    runs-on: macos-latest
```

Add the new job at the end of the file:

```yaml
  pr-title:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest

    permissions:
      pull-requests: read

    steps:
      - uses: amannn/action-semantic-pull-request@v6
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/quick-checks.yml
git commit -m "feat(ci): lint pr titles for conventional commits"
```

---

## Post-merge verification

Workflow changes can't run locally. After merging:

1. Dispatch **Release** with `release-candidate` checked and `version` empty. Confirm the job summary shows the expected `-rc.N` version, the release is draft + prerelease, and the tag was pushed.
2. Open a test PR with a non-conventional title and confirm `pr-title` fails; rename it to `chore: test` and confirm it passes.
