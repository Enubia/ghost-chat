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
