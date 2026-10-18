#!/usr/bin/env bash
set -euo pipefail

REPO="avajit/akmart-ecommerce"
ENV_FILE="prod.env"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://cli.github.com/"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Create $ENV_FILE from prod.env.example and fill values before running this script."
  exit 1
fi

while IFS='=' read -r key val; do
  # Skip empty lines and comments
  if [[ -z "$key" ]] || [[ "$key" =~ ^# ]]; then
    continue
  fi
  # Trim whitespace
  key=$(echo "$key" | xargs)
  val=$(echo "$val" | sed -e 's/^\s*//' -e 's/\s*$//')

  if [ -z "$val" ]; then
    echo "Skipping $key: empty value in $ENV_FILE"
    continue
  fi

  echo "Setting secret $key in $REPO..."
  gh secret set "$key" -R "$REPO" --body "$val"
done < "$ENV_FILE"

echo "Done."
