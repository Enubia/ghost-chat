#!/usr/bin/env bash
# Generates .vscode/settings.json from the template with absolute paths

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$PROJECT_ROOT/.vscode/settings.template.json"
OUTPUT="$PROJECT_ROOT/.vscode/settings.json"

if [ ! -f "$TEMPLATE" ]; then
    echo "Error: Template not found at $TEMPLATE"
    exit 1
fi

if [ -f "$OUTPUT" ]; then
    read -rp ".vscode/settings.json already exists. Overwrite? [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

sed "s|<PROJECT_ROOT>|$PROJECT_ROOT|g" "$TEMPLATE" > "$OUTPUT"
echo "Created .vscode/settings.json with PROJECT_ROOT=$PROJECT_ROOT"
