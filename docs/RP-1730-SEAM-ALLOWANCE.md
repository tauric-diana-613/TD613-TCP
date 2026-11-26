# PR #1730 Seam Allowance Report (Amari Red Pens 01–06)

**Commission:** `TD613-VIXEN-REDPEN-DOUBLE-COMMISSION-20261123` · **Intermission:** `The Seam Allowance`  
**Reviewed Baseline:** `658835a7691c2abf67c86e27e4c818488eae2e65`  
**Immutable Turn I Predecessor:** `2cd6b3cb31d48090f01450e9a205aa55f6361030`  
**Original Baseline Audit (Unmodified):** [RP-1730-FORENSIC-AUDIT.md](RP-1730-FORENSIC-AUDIT.md)

---

## 1. Six-Red-Pen Adjudication Summary

### Repair I (Amari Red Pens 01 & 06) — Class A / Class B / Class C Separation & Scoped Zero Purple Law
Separated constitutional invariants (**Class A**) and behavioral/functional contracts (**Class B**) from provisional aesthetic scaffolding (**Class C**) across tests and [OPUS-COUTURE-HANDOFF.md](OPUS-COUTURE-HANDOFF.md):

| File | Superseded Class C Assertion | Amari Red Pen | Replacement Class A / Class B Contract |
|---|---|---|---|
| `tests/vixen-palette-contract.test.mjs` | Repo-wide hue `235..327` deg regex across source styles & HTML | Red Pen 01 / RP-17 | Scoped to active Opera CSS/inline styles & live WGSL (`observatory-foundry.frag`); permits microscopic raven (`max<36, spread<=12`) & pale pearlescent (`min>=225, spread<=10`) interference; protects authentic source artwork & fixtures. |
| `tests/vixen-stage35-visual-redpen.test.mjs` | Required inline `<div id="view-podium">` inside `vix-cyb.html` & exact header CTA tags | Red Pen 03 / RP-34 | Updated static HTML inspection for standalone `app/encyclopedia/vix-cyb/podium.html` + `human-podium.html`, empty zero-badge cart, and `#footerVixenWordmark`. |
| `tests/vixen-browser-visual-witness.mjs` | Hardcoded RGI12 `linear-gradient`, `rgb(16, 24, 30)` stage backdrop, neutral dark `.vs-title` ink, and warm-paper `readerChannels >= 235` | Red Pen 01 & 06 | Asserts opaque dark optical backing (`alpha>=0.9, max<65`), WCAG AA contrast `>= 4.5` on hero & manuscript/Salon cards, `columnCount` `auto`/`1`, horizontal overflow `<= 2`, `#FFF2A9` `--arc-flash`, and rendered Zero Purple Law on visitor-facing elements. Fixed multi-layer `linear-gradient` card background sampling in `L1400-1414`. |

### Repair II & IV.B (Amari Red Pen 02, RP-01–RP-10) — Catalogue Sorting & PDF Truthfulness
- Added `date` and `author` sort modes (`asc`/`desc` with deterministic `order_num` tie-breaking) to `#workSortSelect` in `app/encyclopedia/vix-cyb.html`. Sorting by `date` or `author` unhides `#workSortNotice` explicitly stating that source creation dates (`CHRONOLOGY_UNRESOLVED`) and `authorship: UNRESOLVED` remain uncollapsed (zero synthetic dates/authors).
- Added real user-facing search -> open Playwright coverage (`tests/vixen-turn1-instrument-browser.test.mjs`) typing `LLM Architecture Deep Dive` into `#globalSearchInput`, verifying result metadata and clicking `[data-search-pick]` to open `emwork_48f6c55fadb2e4d6b9dc4be8`.
- Enforced honest PDF derivative exports across Works (`app/encyclopedia/vix-cyb.html`) and Salon (`app/encyclopedia/vixen-estate/synthesis-salon.mjs`): `.pdf` manifestations download strictly as `<stem>.extracted.txt` with MIME `text/plain;charset=utf-8` (never `.pdf`), display `[↓ .extracted.txt]`, and state `Binary .pdf unavailable/held — extracted UTF-8 derivative only`. Distinguished all 5 representation classes explicitly.

### Repair III & IV.C (Amari Red Pen 03, RP-32–RP-40, RP-11/35/42/57) — Three Separate Podium Destinations
- Replaced inline `#view-podium-threshold` / `#view-podium` panels in `vix-cyb.html` with three genuinely distinct destinations outside `.vixen-room-rail`:
  1. `app/encyclopedia/vix-cyb/podium.html` — Standalone Dual-Door Entrance (`HUMAN` -> `./human-podium.html`, `AI / LLM` -> `./llms.txt`), not a redirect.
  2. `app/encyclopedia/vix-cyb/human-podium.html` — Standalone Dedicated Human Podium hosting `Maestro`, `Composer` (`#vmaComposerWorkbench`), `Podium Settings & Ledger`, `Human Podium Help`, secondary `LLM Entrance ↗`, and `#vmaRestoreBanner` deliberate restore after refresh.
  3. `app/encyclopedia/vix-cyb/llms.txt` — Plain-text AI research guide updated to reflect standalone paths and static contracts.
- Built `app/encyclopedia/vixen-estate/vixen-shared-session-bridge.mjs` sharing `sessionStorage` state (`vixen.study_tray.v1`, `vixen.salon_manifesto.v1`, `vixen.synthesis_log.v1`, `vixen.podium.excursion.v1`) and hydrating `#vixen-corpus-bundle` from `../vix-cyb.html` via fetch with zero bundle duplication.
- Fixed excursion restore ordering in `human-podium.html` + `vixen-ai-journey.mjs` (`Promise.all` mounting `vixen-comparative-field-trial.mjs` & `vixen-source-challenge.mjs` prior to synchronous restore) so cross-page `"Read the work"` -> `vix-cyb.html#works/<id>` -> `#vmaJourneyDock` -> `human-podium.html?resume=1` preserves active `REVIEW`/`SOURCE` phases in Chromium.

### Repair IV.A (RP-23 & RP-27) — Empty Cart Badge & Visitor Workflow Guide
- Updated `vix-cyb.html`, `vixen-foyer.mjs`, `podium.html`, and `human-podium.html` so `#collectionCount` and `#vixenCarryCount` stay empty (`''`) and `hidden` at `0` items, rendering count text only when `count > 0`.
- Rewrote `renderInspectorBody()` in `vix-cyb.html` (`#inspectorDialog`) into a 4-step visitor workflow guide (`Works Search/Sort`, `Research Cart & 4 Local Exports`, `Salon Crib/Manifesto & Gates`, `Dual-Door Podium & AI Brief`) free of host diagnostic benches.

---

## 2. Repair V (Amari Red Pen 04) — Adjudication of Reported Test Failures

| Failure Group | Investigation Finding | Classification | Disposition & CI Expectation |
|---|---|---|---|
| Four custody-ledger `fsync` failures (`tests/vixen-compose-custody-ledger.test.mjs`) | Windows NTFS throws `EPERM` (and some configurations `EISDIR`/`EBADF`) on read-only directory descriptor `fs.promises.open(dir).sync()` while `await fd.sync()` on the temp file succeeds. Kept file `await fd.sync()` unconditional and guarded directory `folder.sync()` on `process.platform === 'win32' && ['EPERM','EISDIR','EBADF'].includes(err.code)` in `scripts/vixen-compose-custody-ledger.mjs:89`. | `REPAIRED` | `5/5 PASS` locally (`npm run test:vixen:source` `409/410`). Directory `fsync` remains active on Linux CI. |
| `PREVIOUS` manuscript navigation assertion (`tests/vixen-browser-visual-witness.mjs:191`) | Discrete window paging used `window.scrollBy({behavior: 'smooth'})` over Chromium's smooth animation timer inside a `320ms` assertion window, causing incomplete scroll distance under CPU jitter. Switched discrete `#vixFolioPrevious`/`#vixFolioNext` clicks in `vix-cyb.html` to `{behavior: 'instant'}` while leaving optical presentation untouched. | `REPAIRED` | Verified `PASS` at `L204` (`#vixFolioPrevious`) in real Chromium (`task-1594`). |
| Source-dossier return navigation (`tests/encyclopedia-navigation.test.mjs:100`) | Zero changes to `app/encyclopedia/index.html` or `tests/encyclopedia-navigation.test.mjs` vs baseline `658835a7`. Passes `8/8` standalone (`31.8s`, `task-1563`) AND passed inside consolidated `npm run test:vixen:source` (`task-1589`), but flaked intermittently under peak Turn I parallel JSDOM load. | `VERIFIED_BASELINE_FAILURE` | Passed `8/8` in consolidated `npm run test:vixen:source` (`task-1589`); residual timing sensitivity under parallel load unchanged from baseline. |
| Native `ROOT-A` execution failure (`tests/vixen-seven-estate-g3.test.mjs:20`) | With Windows `core.autocrlf=true`, `git worktree add --detach` converts `.txt`/`.md` LF bytes to CRLF on disk; `scripts/universal-atelier-sourcebound-readonly-v1.py:76` hashes raw disk bytes (`f.read_bytes()`) as Git blob SHA-1 and rejects CRLF mismatch vs `git ls-files --stage` LF blobs (`NATIVE_DERIVATIVE_BYTES_DIFFER_FROM_PINNED_GIT`), surfaced as `HELD_NATIVE_ENGINE_EXECUTION_FAILED`. Standalone `vixen-seven-estate-g6.test.mjs` passes `9/9`. | `VERIFIED_PLATFORM_PREREQUISITE` & `HELD_PENDING_CI` | Security byte-parity check intentionally preserved unmodified; requires Linux LF checkout in exact-head GitHub CI. |
| Optical presentation cadence assertion (`tests/vixen-browser-visual-witness.mjs:1514`) & full multi-viewport visual pass | On Windows headless SwiftShader Chromium (`reducedMotion: 'no-preference'` at 1440×900/1024×768), real-time 60Hz RAF and multi-canvas screenshot timing depend on GPU/OS scheduler parity; `task-1594` passed all 7 functional scripts + Class B `vixFolioPrevious`/reader/frontispiece/wardrobe assertions through `#vixenSynthesisSalon` `L1440`, where a multi-stop `linear-gradient` card sampler bug was fixed post-run. | `HELD_PENDING_CI` | Functional/WebGL programs `8/8 PASS` (`task-1528` + `task-1594`); full multi-viewport `vixen-browser-visual-witness.mjs` & `L1514` preserved `HELD_PENDING_CI` for Linux CI and Claude's Turn II visual campaign. |

---

## 3. Repair VI (Amari Red Pen 05) — Path & Digest Custody Reconciliation
- Verified through targeted directory checks that `C:\Users\tawmi\TD613_Empty_Operahouse_Evidence` is the external evidence directory path for session witnesses alongside `C:\Users\tawmi\TD613_Empty_Operahouse_Ref\STAGE_BRIDGE.md` (`af7cfb9909fd5ca3768704866d9454516f7607a1f07a0e09a4dbd3ab96fd3616`).
- Verified all 9 Turn I witness PNGs and `vixen-preview-smoke.zip` (`07bfd7ad24c956971154a8444dbc75763f19801d4b6093e86d5e7752034f8431`) at `C:\Users\tawmi\TD613_Empty_Operahouse_Evidence`.
- Left `CARBON_TERMINAL_RECEIPT.json` untouched; documented its 63-hex typo (`d1a132a8f1f6783ced2030009def4d8ea036c939281a1ec273116e7d6150214`, dropped `8` in `...281a81ec...`) alongside the measured 64-hex SHA-256 of unmodified [RP-1730-FORENSIC-AUDIT.md](RP-1730-FORENSIC-AUDIT.md): `d1a132a8f1f6783ced2030009def4d8ea036c939281a81ec273116e7d6150214`.
- Wired `VIXEN_WITNESS_OUT_DIR` across `vixen-browser-visual-witness.mjs`, `vixen-opera-surface-browser.test.mjs`, `vixen-ai-journey-browser.test.mjs`, `vixen-human-comparative-field-browser.test.mjs`, `vixen-maestro-source-challenge-browser.test.mjs`, `vixen-observatory-open-form-browser.test.mjs`, and `vixen-foundry-webgl-canary.mjs`, plus `RUNNER_TEMP` awareness in `verify-vixen-podium-dollhouse.mjs` documentation so local runs keep the worktree clean.
