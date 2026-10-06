#!/usr/bin/env bash
# The command shown in the optional video chapter. Run from this project root.
set -eu
: "${API_TOKEN:?Set API_TOKEN to your doloc API key}"
curl --fail-with-body --silent --show-error --compressed \
  https://api.doloc.io \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary @src/locale/messages.de.xlf \
  -o messages.de.translated.xlf
# Only continue after success. Review the returned translation file first.
printf '%s\n' 'Review messages.de.translated.xlf, then adopt it and build.'
# cp messages.de.translated.xlf src/locale/messages.de.xlf
# npm run build
