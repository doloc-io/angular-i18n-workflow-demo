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
3. Commit your changes first, then run `bash curl-example.sh`. This is the video’s command: curl reads and updates `src/locale/messages.de.xlf` in place. Review the diff afterward.
4. Build and verify again.

The demonstrated command is:

```sh
curl --fail --silent --show-error --compressed \
  https://api.doloc.io \
  -H "Authorization: Bearer $API_TOKEN" \
  --data-binary @src/locale/messages.de.xlf \
  --output src/locale/messages.de.xlf
```

Use curl’s `--output`, not shell redirection (`>`), which would truncate the input before curl reads it. `--fail` prevents an HTTP error body from replacing the file, but an interrupted successful download can still leave a partial file. Commit first so you have a recovery point.

For unattended use, `npm run translate` uses a temporary file and replaces the tracked translation file only after HTTP success. Both scripts require Bash and curl.

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

The v2 same-file curl command was verified on 2026-10-06 with a second real
request returning the same result. Local success and HTTP 503 checks verified
that curl sent the complete input and that --fail preserved the original on
an HTTP error. See evidence/same-file-request.json and same-file-local-check.json.
