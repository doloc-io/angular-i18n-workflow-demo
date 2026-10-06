#!/usr/bin/env bash
# The optional video chapter's command. Run from this project root.
# Commit your changes first; this updates the translation file in place.
set -eu
: "${API_TOKEN:?Set API_TOKEN to your doloc API key}"
curl --fail --silent --show-error --compressed \
  https://api.doloc.io \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary @src/locale/messages.de.xlf \
  --output src/locale/messages.de.xlf
printf '%s\n' 'Translations updated. Review the diff, then build and verify.'
