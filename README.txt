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
3. bash curl-example.sh
   This is the exact command shown in the video: it writes a separate
   messages.de.translated.xlf. After success and review, copy it to
   src/locale/messages.de.xlf. Requires bash and curl.
   For a repeatable script you can instead use: npm run translate
   This sends the German XLIFF to https://api.doloc.io and uses a temporary file.
   Only replaces the tracked file after a successful HTTP response; failed
   requests cannot replace your translation file with an HTTP error body.
4. Review the diff and run npm run build, then verify the localized app.

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
