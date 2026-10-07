#!/usr/bin/env bash
# The optional video chapter's command. Run from this project root.
# Run ng extract-i18n successfully, then commit the merged file before overwrite.
# Requires curl >= 7.76.0. HTTP errors overwrite the output with the error body.
# Inspect that response, then git restore -- src/locale/messages.de.xlf before retry.
set -eu
: "${API_TOKEN:?Set API_TOKEN to your doloc API key}"
curl --fail-with-body --silent --show-error --compressed \
  https://api.doloc.io \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary @src/locale/messages.de.xlf \
  --output src/locale/messages.de.xlf
printf '%s\n' 'Translations updated. Review the diff, then build and verify.'
