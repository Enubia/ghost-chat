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

bump=patch

if echo "$subjects" | grep -qE '^[a-z]+(\(.+\))?!:' || echo "$bodies" | grep -qE 'BREAKING[ -]CHANGE'; then
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
