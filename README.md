# Angular i18n: keep translations in sync

A runnable companion to the `ng-extract-i18n-merge` walkthrough. Starts with Angular’s built-in i18n already configured and demonstrates how to maintain translation files when source text is added, changed, or removed.

## Run it

Use **Node.js 24** and npm. No Python or translation service is required.

```sh
git clone https://github.com/doloc-io/angular-i18n-workflow-demo.git
cd angular-i18n-workflow-demo
npm ci
npm run build
npm run preview
```

Open [English](http://localhost:8080/en/) or [German](http://localhost:8080/de/). The preview uses the pinned Node-based `http-server` package to serve both production locale builds. Stop it with Ctrl+C. `npm start` runs Angular’s development server for the source locale; use the production preview to compare both localized builds.

The default checkout is the completed **manual** workflow. The reminder button is a UI fixture: it disables after clicking, but does not schedule notifications.

## Replay the walkthrough

Stage restoration overwrites the demo template, both XLIFF files, and `angular.json`. Use it in this example repository, not your own app.

1. Restore the starting point: `npm run demo:stage -- baseline`.
2. Copy `stages/feature-native/app.html` to `src/app.html`. This adds a reminder button, changes the description from today to tomorrow, and removes an obsolete label.
3. Run `npx ng extract-i18n`. The source catalog changes; the German file stays unchanged.
4. Run `npx ng add ng-extract-i18n-merge@3.4.0`. The package is already installed by `npm ci`; this runs its configuration schematic. Inspect the extraction builder and target paths in `angular.json`.
5. Run `npx ng extract-i18n` again. The new entry appears, the obsolete entry disappears, and the changed message keeps its old target but resets to `state="new"` for attention. A new target initially copies English text; populated does not mean translated.
6. Edit the two targets in `src/locale/messages.de.xlf`, then mark them `state="translated"`:
   - `task.remind`: `Erinnere mich morgen`
   - `task.description`: `Nimm dir morgen Zeit dafür.`
7. Review the diff, run `npm run build`, then `npm run preview` and verify the German app.

Stable custom IDs make the changed-source example easy to follow. Generated IDs and fuzzy matching have different behavior; this example does not claim all ID configurations behave identically.

## Saved stages

```sh
npm run demo:stage -- feature-merged
```

| Stage | What it shows |
|---|---|
| `baseline` | Working bilingual app before the feature change; native extraction |
| `feature-native` | Updated source catalog; German file unchanged |
| `feature-merged` | Synchronized target file; new and changed entries need translation |
| `manual` | Completed manual translations |
| `doloc` | Captured real API result; selecting this stage makes no request |

## Optional: automate translation with doloc

The merger synchronizes files; doloc translates their contents. The manual workflow above is complete without doloc.

1. Restore `feature-merged` to replay the same input.
2. Create a doloc API key and set `API_TOKEN` in your shell. Keep it out of Git and Angular client code.
3. Run `npx ng extract-i18n` and wait for extraction and merging to succeed. Commit the updated files so Git can restore the merged translations if needed.
4. Run `bash curl-example.sh` on that updated German file, then review the diff. Curl reads and updates `src/locale/messages.de.xlf` in place. Every time source text changes, extract and merge before running curl.
5. Build and verify again.

The demonstrated command is:

```sh
curl --fail-with-body --silent --show-error --compressed \
  https://api.doloc.io \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary @src/locale/messages.de.xlf \
  --output src/locale/messages.de.xlf
```

Requires **Bash and curl 7.76.0 or newer**. Use curl’s `--output`, not shell redirection (`>`), which would truncate the input before curl reads it. On HTTP errors, `--fail-with-body` exits with code 22 **and writes the API error response into the output file**. Inspect that response, then restore the committed translations before retrying; otherwise the next request would send the error body as input. An interrupted successful download can also leave a partial file.

```sh
# After inspecting an error response, restore the committed merged translations:
git restore -- src/locale/messages.de.xlf
# Then retry curl; extract and merge again first if the source text changed.
bash curl-example.sh
```

For unattended use, `npm run translate` uses a temporary file and replaces the tracked translation file only after HTTP success. Its failure path leaves the original translation file intact. Both scripts require Bash and curl 7.76.0 or newer.

```sh
npm run extract-i18n && npm run translate
npm run build
npm run preview
```

The saved doloc stage came from a real request on 2026-10-06 using one anonymous evaluation token held in memory. It translated both pending entries and retained the other five translations. No responses were mocked or credentials included. Customer setup uses a regular account API key; wording may vary between requests.

## Versions and authorship

Angular 22.2.1, `ng-extract-i18n-merge` 3.4.0, TypeScript 6.0.2, and XLIFF 1.2. Dependencies are pinned in the lockfile.

Created for the maintainer of `ng-extract-i18n-merge` and creator of doloc (@daniel-sc), with Codex assistance. The optional doloc section is a first-party demonstration. Detailed provenance is in `evidence/`.

## References

- [ng-extract-i18n-merge](https://github.com/daniel-sc/ng-extract-i18n-merge)
- [Angular translation files](https://angular.dev/guide/i18n/translation-files)
- [Angular localized builds](https://angular.dev/guide/i18n/merge)
- [Optional doloc integration](https://doloc.io/getting-started/frameworks/angular/)

### Historical v2 verification — 2026-10-06

The earlier v2 command used `--fail`, not the current `--fail-with-body`. Its different error-body behavior is retained here as historical evidence.

The v2 same-file curl command was verified on 2026-10-06 with a second real
request returning the same result. Local success and HTTP 503 checks verified
that curl sent the complete input and that --fail preserved the original on
an HTTP error. See evidence/same-file-request.json and same-file-local-check.json.

### V3.1 error handling — 2026-10-07

A controlled local HTTP 400 test ran the current `curl-example.sh`: curl uploaded the complete original file, saved the error body in place, and exited with code 22. Restoring from Git recovered the exact committed translations. This was a local mock error response, not a new doloc API request; the saved successful doloc result remains the real 2026-10-06 response. See `evidence/fail-with-body-local-check.json`; reproduce with `node evidence/check-curl-example.mjs`.
