# Architecture and maintenance

## Runtime modules

The page uses classic deferred scripts, so the same source works in extension pages, local HTML files and HTTP hosting without a module server or framework.

| File | Responsibility |
| --- | --- |
| `boot.js` | Early theme/first-visit state and storage adapter; exposes persistent/temporary status |
| `data.js` | Shared URL, settings and import validation; limits; IDs; three-way merging |
| `settings-store.js` | Per-tab draft/baseline, batched saves and conflict handling |
| `weather-client.js` | Transport timeouts, cancellation, response validation, cache identity and host authentication |
| `ui-core.js` | Translations, search presets, icon rendering and theme presentation |
| `welcome.js` | First-visit transitions and Skip |
| `script.js` | Page state, settings editors, modal interaction, search and integration |

Dependencies are explicit in `index.html`. `tools/build.mjs` reads that list, embeds scripts in the same order at the end of the body, and embeds local fonts, icons and Sortable. New runtime script files therefore do not require a second hand-maintained build list. `build.sh` is a compatibility wrapper.

## Data consistency

Groups and links receive stable IDs during the first load of legacy data. Editing, local loading and importing share the same validators. Malformed persisted lists are retained under `siteData.recovery` or `enginesData.recovery`; the settings status shows that a recovery copy exists.

Text editing batches storage writes for 180ms; structural operations save immediately. Leaving the page flushes pending writes. Unchanged lists are not rewritten. Each list store keeps the original baseline and merges local changes against the most recently stored value. Independent field edits merge; edits to the same field, or incompatible deletion/reordering, require an explicit choice. Storage events refresh other tabs. This is a local browser coordination mechanism, not a distributed transactional database; it does not add cloud sync or cross-device concurrency guarantees.

Local-storage failures switch to session memory. The settings page exposes this state. Import applies settings in place instead of reloading, so it works in temporary mode; closing the page still discards temporary settings.

## Input and backups

New backups use schema version 2 with nested arrays and objects. Version 1 JSON-string fields remain importable. Only allowlisted settings are accepted. Maximum file size is 2MB, with at most 100 groups, 2,000 links and 100 search engines. Text fields have length limits; search templates require `{query}` and HTTP(S), and links reject active protocols and credentials in URLs.

API Key export is opt-in. API Host is an ordinary backed-up setting. Missing keys in a backup preserve existing settings; explicitly included keys replace them. A missing/invalid selected engine falls back to the first engine.

## Weather

Each load supersedes the preceding generation and cancels its network requests. Late results do not update the UI, saved location or cache. Cache identity includes the location, a SHA-256 Key fingerprint, language and host. TTL is 10 minutes. Requests time out after 8 seconds; API payloads and numeric temperature fields are checked before rendering. Returning to the page checks the cache after a one-minute activity threshold instead of polling continuously.

Dedicated API Hosts must be HTTPS `*.qweatherapi.com` domains and use the `X-QW-Api-Key` header. Empty Host keeps the legacy public-host path for existing configurations. Browser permissions include only HTTPS weather endpoints plus geolocation; no content scripts or browsing-history permissions are introduced.

Official documentation checked during this change:

- https://dev.qweather.com/en/docs/configuration/api-host/
- https://dev.qweather.com/en/docs/configuration/authentication/
- https://dev.qweather.com/en/docs/api/weather/weather-now-webapi-v7/

The provider now recommends dedicated hosts and announces future v7 deprecation. The existing city lookup / v7 adapter remains for compatibility; migrating to coordinate-based v1 responses requires a separately verified provider adapter. No real account, API Key, billing entitlement or location permission was used in automated tests. Tests validate mocked payloads and request structure, not service availability or account authorization.

## UI and accessibility

All modal sizes are bounded by viewport height and scroll within the modal. Only the active modal remains interactive. Sort handles support Alt + Up / Down as an alternative to dragging, including when Sortable fails to load. Invalid link edits retain the typed text and preserve the last valid saved URL. New engine editors remain drafts until saved. The welcome flow remains English by design; settings and feedback support Chinese and English.

## Build, package and tests

Use Node.js 22+:

```sh
npm ci --include=dev
npx playwright install chromium
npm test
npm run package
```

`npm test` runs Node tests, builds `StartPage.html`, and runs Playwright regression tests. Tests cover cross-tab updates/conflicts, actual drag then edit, draft cancellation, weather races and cache isolation, stale city suggestions, temporary-mode import, validation, viewport layout, sorting fallback, backup round-trips and offline local-file startup. Build tests parse all inline scripts and check package contents. On Windows, the test configuration uses an installed Chrome when available; CI installs Playwright Chromium.

`npm run package` produces `dist/extension` using a runtime file allowlist. Development dependencies, tests and docs do not enter the release ZIP. The release workflow tests before packaging and checks that `manifest.json` and `package.json` versions agree. Changes are prepared as 1.7.1; no release or remote push is performed by local build/test commands.

Still requires manual verification before release: real QWeather account/API Host requests, real geolocation authorization, Chrome/Edge extension installation and upgrade, and Firefox compatibility. Automated Chromium page tests are not equivalent to an installed extension smoke test.
