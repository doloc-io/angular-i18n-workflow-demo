ANGULAR I18N — KEEP TRANSLATIONS IN SYNC
A real, runnable fixture for the doloc / ng-extract-i18n-merge walkthrough.

Versions used: Angular / CLI / build 22.2.1; ng-extract-i18n-merge 3.4.0;
TypeScript 6.0.2; Node 24.21.0. Dependencies and lockfile are pinned.

The project already uses Angular's built-in i18n (not Transloco), with English
source and a German XLIFF 1.2 translation file. Installation of i18n itself is
outside this tutorial's scope. No service is required for the manual workflow.

QUICK START
1. Install Node 24 and run: npm ci
2. Run: npm run build
3. Serve both localized builds with Node: npm run preview
4. Open http://localhost:8080/en/ or http://localhost:8080/de/

The default checked-in project is the completed manual workflow. The reminder
button demonstrates client-side interaction (it disables after clicking); it
is not a real notification scheduler or backend service.

REPLAY THE STORY
Stage restoration overwrites only the demo template, both XLIFF files, and
angular.json. Use this in the downloaded example, not your own app.

1. npm run demo:stage -- baseline
   A working bilingual app before the feature change. Native extractor configured.
2. Copy stages/feature-native/app.html to src/app.html.
   Added: task.remind, "Remind me tomorrow".
   Changed: task.description, "Get it done today." → "Make time for it tomorrow."
   Removed: task.legacy, "No reminders yet".
3. npx ng extract-i18n
   The source catalog changes. The German file remains unchanged.
4. npx ng add ng-extract-i18n-merge@3.4.0 --skip-confirmation
   The package is already installed by npm ci; this runs its configuration
   schematic. It replaces the extract-i18n builder in angular.json and infers
   the German target file from the locale configuration.
5. npx ng extract-i18n
   The merger adds the new target, removes the obsolete message, and updates
   the changed source while retaining the old German target for review.
   Both new and changed targets are state="new". New target text defaults to
   copied source text; populated text does not imply a finished translation.
6. Edit the two targets in src/locale/messages.de.xlf:
   task.remind: Erinnere mich morgen
   task.description: Nimm dir morgen Zeit dafür.
   Mark both target elements state="translated" after reviewing them.
7. npm run build
   Review the translation diff and verify the actual localized app.

Stable custom IDs intentionally make the changed message easy to follow.
Generated IDs may change with source wording; fuzzy matching and ID behavior
are distinct details. This demo makes no universal guarantee about all ID setups.

SAVED STAGES
npm run demo:stage -- baseline       before the feature
npm run demo:stage -- feature-native after native extraction; German unchanged
npm run demo:stage -- feature-merged synchronized but untranslated/review pending
npm run demo:stage -- manual         completed by manual editing
npm run demo:stage -- doloc          captured real API response (not a new request)

OPTIONAL AUTOMATIC TRANSLATION
The merger synchronizes files; doloc translates their content.
1. Restore feature-merged to replay the exact same input.
2. Create your own API key at https://doloc.io and set API_TOKEN in your shell.
   Do not commit it. Do not put it in client-side Angular code.
3. Run npx ng extract-i18n and wait for extraction and merging to succeed.
   Commit the updated files so Git can restore the merged translations.
4. Run: bash curl-example.sh
   This is the video's command: curl reads and updates
   src/locale/messages.de.xlf in place. Requires Bash and curl >= 7.76.0.
   Every time source text changes, extract and merge before running curl.
   Use --output, not shell redirection (>), which truncates the input first.
   --fail-with-body exits with code 22 on HTTP errors AND writes the API's
   error response into the output file. Inspect it, then restore before retry:
     git restore -- src/locale/messages.de.xlf
   Only then retry bash curl-example.sh. If source text changed, extract and
   merge again first. Otherwise you would send the error body as input.
   An interrupted successful download can also leave a partial file.
   For unattended automation you can instead use: npm run translate
   This uses a temporary file and only replaces the tracked translation file
   after HTTP success. Failed requests leave the original translations intact.
5. Review the diff and run npm run build, then verify the localized app.

For a combined repeatable workflow: npm run extract-i18n && npm run translate
Review is still a separate human step. Automatic wording can vary.

The doloc snapshot was produced by a real request on 2026-10-06, using one
anonymous evaluation token held in memory, not a paid account credential.
Default API options translated both state="new" entries and retained the
five existing translations. No responses were mocked. For customer setup,
the video demonstrates a regular account API key. No quota is promised.

AUTHORSHIP
ng-extract-i18n-merge and doloc are maintained/created by the same developer (@daniel-sc).
This example and the accompanying video were produced with Codex assistance.
The optional doloc chapter is a first-party product demonstration.

REFERENCES
https://github.com/daniel-sc/ng-extract-i18n-merge
https://angular.dev/guide/i18n/translation-files
https://angular.dev/guide/i18n/merge
https://doloc.io/getting-started/frameworks/angular/

HISTORICAL V2 VERIFICATION — 2026-10-06
The earlier command used --fail, not the current --fail-with-body. Its
different error-body behavior is historical evidence, not current behavior.

The v2 same-file curl command was verified on 2026-10-06 with a second real
request returning the same result. Local success and HTTP 503 checks verified
that curl sent the complete input and that --fail preserved the original on
an HTTP error. See evidence/same-file-request.json and same-file-local-check.json.

V3.1 ERROR HANDLING — 2026-10-07
A controlled local HTTP 400 test ran the current curl-example.sh. It uploaded
the complete original file, saved the error body, and exited with code 22.
Git restore recovered the exact committed translations. This was a local mock,
not a new doloc API request; the successful saved result remains the real
2026-10-06 response. See evidence/fail-with-body-local-check.json.
Reproduce: node evidence/check-curl-example.mjs
