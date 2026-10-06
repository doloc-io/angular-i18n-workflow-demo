#!/usr/bin/env bash
# Run from the demo root after ng extract-i18n.
set -eu
: "${API_TOKEN:?Set API_TOKEN to your doloc API key}"
output=$(mktemp)
trap 'rm -f "$output"' EXIT
curl --fail-with-body --silent --show-error --compressed \
  https://api.doloc.io \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary @src/locale/messages.de.xlf \
  -o "$output"
# Replace the tracked translation file only after a successful HTTP response.
cp "$output" src/locale/messages.de.xlf
printf '%s\n' 'Translations updated. Review the diff, then build and test.'
