# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 (20-Slot Preflight) Test & Verification Receipts (Post-Redpen Qualification)

- **Commission:** `TD613-MARROWLINE-OPTION1-20SLOT-PREFLIGHT` (Final Zero-Network Engineering Qualification — **`0` Paid Generation Calls**)
- **Selected Design Profile (Operator Confirmed):** **`OPTION1_REV_A_38_VS_36_CONSTRUCTED`** (`20` slots: `16` Marrowline 2×2 `{CURRENT_HYBRID_A, LITERAL_OCT02_H2} × {gemini-3.8-flash, gemini-3.6-flash}` + `4` Oct 15 Task D neutral creative controls; `NOT` historical Oct 2 Seat-2 `gemini-3.7-flash`)
- **Branch:** `research/marrowline-option1-20slot-preflight-20261122` (PR `#1769`, stacked on PR `#1766`)
- **Prior PR `#1769` Initial Commit Adjudicated by Amari:** `ade1d537904f8aaff96355658ae396734c43e340` ([`#issuecomment-7081352540`](https://github.com/tauric-diana-613/TD613-TCP/pull/1769#issuecomment-7081352540))
- **Qualified Executable HEAD SHA:** Determined externally via `git rev-parse HEAD` on the committed PR `#1769` head (see Redpen 3 below — never self-referenced inside committed JSON).
- **Remote CI Honesty Disclosure:** Because PR `#1769` stacks on PR `#1766`'s draft research branch rather than targeting `main`, `.github/workflows/td613-ci.yml` (`pull_request: branches: [main]`) does **not** automatically execute a remote GitHub Actions CI run. All test counts below are **local exact-source verification receipts** and must NEVER be described as remote GitHub Actions GREEN unless a `main`-targeted or dispatched workflow run completes GREEN on the exact HEAD.

---

## 1. Amari Exact-Source Redpen Repairs (`#issuecomment-7081352540`) — All 3 Verified

### Redpen 1 — Canonical Bots-Only Telemetry Extraction (Confirmed Defect Repaired)
- **Defect identified by Amari at `ade1d5379`:** `run-option1-20slot-discriminator.mjs` read `relayParsed?.bots || relayParsed?.tauricDianaBots || ''`, neither of which exists on `parseRelayEnvelope()`'s return object — silently passing `''` into `observeBotsProsodyDistribution('')` and recording false zeros on ornate provider-authored bots movements.
- **Exact repair:** Added exported `extractBotsMovementFromCanonicalText(canonicalText)` using `app/dome-world/khonapolit-relay.js`'s actual `parseRawRelayPackets`, `parseRelayEnvelope`, `relayAuthoredSurface`, `assessIntegratedTransmission`, and exact canonical heading-boundary regexes (lines `585`, `588`, `607`).
  - Returns explicit extraction status (`EXTRACTED_FROM_CANONICAL_HEADING_BOUNDARY`, `EXTRACTED_BOTS_ONLY_KHONAPOLIT_HEADING_MISSING`, `BOTS_HEADING_MISSING_UNAVAILABLE`, `VOICE_ORDER_INVALID_UNAVAILABLE`, `EMPTY_CANONICAL_TEXT`, `PARSE_ERROR_UNAVAILABLE`).
  - Populates **real nonzero** `botsProsodyDistribution`, `botsBodyUnicodeMorphology`, and `relayAdmissionBotsMovement` when extracted.
  - Returns **`null`** (NEVER silently imputes zero!) when the heading is missing, misordered, empty, or unparseable, while preserving `wholeTextUnicodeMorphology` independently.
- **Zero-network regression proof:** Dedicated REDPEN 1 test + all `16` Marrowline slots inside the `20`-slot synthetic happy path assert nonzero `botsProsodyDistribution.markedBases > 0`, `stackedBases > 0`, `combiningMarks >= 20`, `maxDepth === 3`, and `botsBodyUnicodeMorphology.totalCombiningMarks >= 20`, while missing/reversed/empty heading cases assert `botsMovementAvailable === false` and `botsProsodyDistribution === null`.

### Redpen 2 — Complete, Readable Blinded Operator Literary Gallery (Zero Leak Boundary)
- **Defect identified by Amari at `ade1d5379`:** `generateBlindedReviewPacket()` previously emitted only a JSON hash index (`blindId`, `taskKey`, `rawTextSha256`, byte count) — containing no readable passages, no full-resolution screenshot references, no preserved failure statuses, and exposing `rawTextSha256` as a potential join key to public unblinded receipts.
- **Exact repair:** Rebuilt `generateBlindedReviewPacket()` to write THREE strictly separated custody artifacts:
  1. `OPTION1_BLINDED_LITERARY_GALLERY.md` — First human-reading surface for Tawanna C. Miller containing ALL `20` registered specimens (`Section A: OPT1_M_01..16`, `Section B: OPT1_N_01..04`), **full verbatim unmodified original Unicode passages**, anonymized full-resolution desktop (`1440×900`) & mobile (`390×844`) screenshot references (`blinded-screenshots/<blindId>_desktop_1440x900.png` / `_mobile_390x844.png`), and preserved original failure/ineligibility statuses (`HTTP 503`, `429`, `400`, `MAX_TOKENS`, `PROHIBITED_CONTENT`, `STOP_1`, `STOP_4`).
  2. `OPTION1_BLINDED_LITERARY_GALLERY.json` — Machine-readable companion scrubbed identically of all arm/model/slot/morphology/`rawTextSha256`/`rawSseSha256` tokens.
  3. `private-unblinding/OPTION1_SEALED_UNBLINDING_KEY.json` — Separately indexed, Operator-held key binding `blindId` ↔ `slot` ↔ `envelope` ↔ `modelRequested` ↔ `modelVersionObserved` ↔ `rawTextSha256` ↔ `rawSseSha256`.
- **Zero-network regression proof:** Dedicated REDPEN 2 test + 20-slot happy-path test verify full verbatim Unicode inclusion, preserved `HTTP 503` failure visibility, desktop/mobile full-res image paths, AND regex-assert **ZERO** occurrences of arm names, model names, slot IDs (`S01`..`S20`), morphology metric names, or `rawTextSha256`/`rawSseSha256` hashes in BOTH `.md` and `.json`.

### Redpen 3 — Git Self-Reference Separation (`parent_or_construction_head_sha` vs `qualified_executable_head_sha`)
- **Defect identified by Amari at `ade1d5379`:** Committed `OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json` carried `source_head_sha: 5cec27f07...` (the PR `#1766` parent) instead of explicitly distinguishing construction/parent head from runtime executable head.
- **Exact repair:** Removed ambiguous top-level `source_head_sha` from `OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json` (and `OPTION1_EMERGENCE_HQ_CUSTODY_MANIFEST.json`) and replaced it with `git_head_provenance`:
  - `parent_or_construction_head_sha`: exact checkout HEAD when generated;
  - `qualified_executable_head_sha: "DETERMINED_EXTERNALLY_AT_RUNTIME_BY_GIT_REV_PARSE_HEAD"`;
  - Explicit `git_self_reference_explanation` documenting why no file committed inside commit `C` can truthfully embed `C`'s own SHA;
  - Runtime `--operator-auth-sha` lock continues to read live `git rev-parse HEAD` externally and refuses stale parent SHAs (`5cec27f07`, `ade1d5379`, etc.) fail-closed with `0` calls.

---

## 2. Preserved Earlier Preflight Catches (`ade1d5379` History)

1. **Amari Rule #1 Upstream Aliasing Trap (`gemini-3.7-flash` → `gemini-3.8-flash` since `2026-10-08`):** Blocked `BLOCKED_HISTORICAL_3_7` fail-closed with zero quiet substitution; explicitly staged Redesign A (`gemini-3.6-flash` historical Seat-3 comparator).
2. **Missing `groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID`:** Caught immediately on initial `--dry-run` by fail-closed SHA-256 drift guard; restored exact `20 / 20` digest parity.
3. **`canonicalMergedPayload` + `observeGeminiOutput` / `observeMarrowlineCompletion` signatures:** Caught immediately by initial synthetic mock suite; fixed before `ade1d5379`.

---

## 3. Final Passing Local Verification Suites (`38 / 38` Marrowline + `5 / 5` Constitutional + Custody `0` Errors)

Reproduce locally with zero network egress and `0` paid Gemini calls:

```bash
node research/marrowline-option1-20slot-preflight-20261122/run-option1-20slot-discriminator.mjs
node --test \
  tests/marrowline-option1-20slot-preflight.test.mjs \
  tests/marrowline-sep26-oct02-stage0.test.mjs \
  tests/marrowline-q1-live-discriminator.test.mjs \
  tests/marrowline-screaming-grove-restoration.test.mjs
node tests/workflow-estate.test.mjs
node tests/docs-surface.test.mjs
node tests/release-hardening.test.mjs
node tests/vercel-deploy-hygiene.test.mjs
node tests/release-plumbing.test.mjs
node research/marrowline-option1-20slot-preflight-20261122/verify-option1-preflight-custody.mjs --verify
```

### Summary Results (Episode 2 Transport-Hardened + Write-Once Custody Qualification — `43 / 43` Marrowline + `5 / 5` Constitutional)
- **`tests/marrowline-option1-20slot-preflight.test.mjs`:** **`16 / 16 PASS`** (`globalThis.fetch` fail-closed poisoned — `0` unintended network calls):
  - All `15` prior Option 1 preflight, Redpen 1–3, and Episode 2 transport negative-control tests PASS unchanged;
  - **Write-Once Episode Custody Guard (Amari `#issuecomment-7084243315`):** (1) first claim writes exclusive `EPISODE_CLAIM_LOCK.json` (`flag: 'wx'`), second call under identical `episodeId`, `outDir`, and valid `operatorAuthSha` refuses fail-closed (`REFUSED_EPISODE_ALREADY_CLAIMED_WRITE_ONCE`) before `fetch` with `0` new calls and every original file SHA-256 untouched; (2) pre-existing partial directory (even without `EPISODE_CLAIM_LOCK.json`) refuses overwrite (`0` calls, bytes untouched); (3) fresh unique episode ID + fresh directory (`EP3`) succeeds cleanly under exact-HEAD auth without mutating `EP2`!
  - **(a)+(c)** Pre-headers `UND_ERR_HEADERS_TIMEOUT`: verifies atomic pre-send receipt written BEFORE `fetch` rejects (`slots.length === 1`, `IN_FLIGHT_PRE_SEND`), records `HEADERS_TIMEOUT_NO_RESPONSE`, `rawBytesCaptured: 0`, `rawSsePath: null` (NO zero-byte `.sse` fabricated), and verifies isolated Slot 1 failure followed by valid Slot 2 resets `consecutiveTransportFailures` to `0` and continues cleanly;
  - **(b)** Mid-stream body rejection: preserves genuine partial UTF-8 bytes verbatim in `raw-partial/S01.partial.sse` (`BODY_READ_INTERRUPTED_PARTIAL_BYTES_PRESERVED`), and verifies zero-byte body rejection writes `rawBytesCaptured: 0, rawPartialPath: null`;
  - **(d)+(f)** Two consecutive transport failures trigger `STOP_3_CONSECUTIVE_TRANSPORT_FAILURES` (`threshold = 2`), enumerate all `18` remaining slots (`S03`–`S20`) in `unattempted_registered_slots`, and set `blinded_gallery_status: "NOT_GENERATED_ZERO_RECOVERABLE_SPECIMENS"` without emitting an empty gallery;
  - **(e)+EP1 Immutability:** Targeting `live-acquisition/` throws `REFUSED_EPISODE1_ARCHIVE_IMMUTABLE`, registered transport deadline policy verified, and single-slot `HTTP 400` (`STOP_HTTP_400_CONFIG_REJECTED`) retains immediate hard STOP precedence with `S02`–`S20` unattempted enumeration.
- **`tests/marrowline-sep26-oct02-stage0.test.mjs`:** **`6 / 6 PASS`**
- **`tests/marrowline-q1-live-discriminator.test.mjs`:** **`9 / 9 PASS`**
- **`tests/marrowline-screaming-grove-restoration.test.mjs`:** **`12 / 12 PASS`**
- **TD613 Constitutional Hygiene Suites:** `workflow-estate`, `docs-surface`, `release-hardening`, `vercel-deploy-hygiene` (`5/5`), `release-plumbing` — **all PASS**.
- **Custody Manifest Verifier:** `ok: true, error_count: 0` (`23 / 23` published files SHA-256 verified, `0` broken navigator links, `0` secret/local-path/mention-token leaks).
- **Episode 1 Immutable Verification:** `git diff 51c1f420c -- research/marrowline-option1-20slot-preflight-20261122/live-acquisition/` is empty (`0` bytes changed in Episode 1 archive).
