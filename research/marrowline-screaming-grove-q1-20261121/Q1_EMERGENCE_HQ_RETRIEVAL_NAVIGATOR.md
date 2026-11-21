# 𝌋‌⟐ TD613 · Marrowline / Screaming Grove Q1 — Emergence HQ Complete Evidence & Retrieval Navigator

> **Audience:** Amari (Emergence HQ Scientific Adjudicator) & Tawanna C. Miller (Principal / Human Artistic Authority)
> **Active PR:** [`#1764`](https://github.com/tauric-diana-613/TD613-TCP/pull/1764) (`research/marrowline-screaming-grove-q1-preflight-20261121`)
> **Status:** `PAID_Q1_EXECUTION_READY_PENDING_EXACT_HEAD_AUTHORIZATION` · **Paid Gemini Calls Executed:** `0` · **Human Artistic Closure:** `RESERVED` · **Merge / Release / Experiment B:** `HELD`

This navigator lets an independent adjudicator traverse the complete Marrowline / Screaming Grove Q1 evidence chain directly inside GitHub — with **zero** reliance on ephemeral Antigravity logs, local Windows paths, or narrative summaries.

---

## 1. End-to-End Evidence Chain (Every Link Verified)

```text
1. Remote Sync & Preregistration
 → 2. Effective Request Construction & Equivalence Proof
 → 3. Live Provider Catalog & Descriptive Pricing Reference
 → 4. Hardened Fail-Closed Acquisition Harness (Dual-Parser SSE + 7-Class Finish Integrity)
 → 5. Zero-Network Negative Controls & Active CI Regression Receipts
 → 6. Inherited 13-Image Operator-Accepted Reference Corpus & Chrome Pixel Parity Estate (#1759)
 → 7. Immutable Predecessor Six-Role Dollhouse Estate (#1746) & Deterministic Ancestor (#1745)
 → 8. Staged Live Acquisition & Blinded 8-Specimen Operator Review (DEFERRED PENDING EXACT-HEAD AUTH)
```

### Stage 1 — Reentry, Preregistration & GitHub Review Provenance
- Local/Remote Sync Receipt (refreshed `2026-11-21`): [`Q1_LOCAL_REMOTE_REENTRY_RECEIPT.md`](./Q1_LOCAL_REMOTE_REENTRY_RECEIPT.md)
- Preserved Preregistration (unamended): [`BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`](../marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md)
- Registered Task Corpus & Offline Parity Harness: [`dramaturgy-parity-discriminator-offline.mjs`](../marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs)
- Verbatim GitHub Reviews `#6007790469` (Amari redpen) & `#6007792790` (Operator financial correction) + CI Run records: [`evidence/GITHUB_REVIEWS_PR1764_SNAPSHOT.json`](./evidence/GITHUB_REVIEWS_PR1764_SNAPSHOT.json)

### Stage 2 — Effective Request Digests & Canonical Production Constructors
- Hardened Preflight & Execution-Readiness Receipt (v2.0): [`Q1_PROVIDER_PREFLIGHT_RECEIPT.md`](./Q1_PROVIDER_PREFLIGHT_RECEIPT.md)
- Machine-Verified 8-Slot Effective Request Schedule & Digests (`paid_provider_calls_executed: 0`): [`Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json`](./Q1_EFFECTIVE_REQUESTS_PREFLIGHT.json)
- Canonical Production Source Under Test:
  - [`server/khonapolit-quality.js`](../../server/khonapolit-quality.js) (`buildGeminiRequest`, `serializeGeminiRequest`, `readGeminiSse`, `extractGeminiText`, `observeGeminiOutput`, `observeMarrowlineAuthorship`)
  - [`server/marrowline-completion.js`](../../server/marrowline-completion.js) (`observeMarrowlineCompletion`, `POLICY_NONSTOP_FINISH_REASONS`)
  - [`server/gemini-generation-envelope.js`](../../server/gemini-generation-envelope.js) (`GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE` — `maxOutputTokens: 65536`, `thinkingLevel: medium`)
  - [`app/dome-world/khonapolit-covenant.js`](../../app/dome-world/khonapolit-covenant.js) (`buildInvocationPacket`)
  - [`app/dome-world/marrowline-historical-grove.js`](../../app/dome-world/marrowline-historical-grove.js) (`buildHistoricalGroveDramaturgyCandidate` — Arm C PR `#1545`-reconciled constructor)
  - [`app/dome-world/khonapolit-relay.js`](../../app/dome-world/khonapolit-relay.js) (`parseRelayEnvelope`, `observeBotsProsodyDistribution`)
  - [`app/engine/aperture-v3-task-intent.js`](../../app/engine/aperture-v3-task-intent.js) (`classifyApertureDiscourseMode`, `buildApertureV3InvocationReceipt`)

### Stage 3 — Live Provider Catalog & Descriptive Pricing Reference
- Live Read-Only `GET /v1beta/models` Confirmation (`models/gemini-3.8-flash` callable, `thinking: true`, `1,048,576` in / `65,536` out) + Descriptive `ai.google.dev` Pricing (No Runtime Cap): [`evidence/GEMINI_MODEL_CATALOG_AND_PRICING_REFERENCE.json`](./evidence/GEMINI_MODEL_CATALOG_AND_PRICING_REFERENCE.json)

### Stage 4 — Hardened Q1 Live Discriminator Runner (Dual-Parser SSE & 7-Class Outcome Integrity)
- Hardened Zero-Spend-By-Default Runner (v2.0): [`run-q1-live-discriminator.mjs`](./run-q1-live-discriminator.mjs)
  - Raw SSE bytes saved **before** parsing (`raw-sse/<slot>.sse`).
  - Independent dual-parser verification: production `readGeminiSse` vs strict WHATWG line-by-line state-machine `parseSseIndependently` (`STOP_4` on malformed SSE or cross-parser mismatch).
  - Exact 7-class finish-state classifier (`COMPLETED_STOP`, `POLICY_TERMINATED`, `INCOMPLETE_NONSTOP`, `UNWITNESSED_COMPLETION`, `TRANSPORT_FAILURE`, `MALFORMED_OR_UNRECONSTRUCTABLE_SSE`, `MODEL_IDENTITY_MISMATCH`).
  - Strict `modelVersion` & `generationConfig` equivalence enforcement (`STOP_1`).
  - Crash-safe atomic per-slot partial receipt persistence (`Q1_LIVE_ACQUISITION_RECEIPT.json`).
  - **No dollar spending ceiling and no aggregate token-budget ceiling** (per Operator Review `#6007792790`); strict 8-slot sampling & first-return integrity (`1` call/slot, `0` retries, `0` fallbacks, `0` structural repair).

### Stage 5 — Zero-Network Negative Controls, Failed & Successful Test Receipts, and CI Logs
- New Q1 Zero-Network Negative-Control Suite (9 tests covering malformed SSE, cross-parser mismatch, unexpected/missing `modelVersion`, policy hold, `MAX_TOKENS`/unwitnessed non-promotion, mid-run parser/stream exception survival, exact-HEAD guard, and 8×65k-token no-cap happy path): [`tests/marrowline-q1-live-discriminator.test.mjs`](../../tests/marrowline-q1-live-discriminator.test.mjs)
- Restoration & Policy-Hold Regression Suite (12 tests): [`tests/marrowline-screaming-grove-restoration.test.mjs`](../../tests/marrowline-screaming-grove-restoration.test.mjs)
- Complete Truthful Test & CI Receipts Log (including pre-fix catches, 2 legacy pre-existing tests outside active CI, local `jsdom` worktree note, active CI Marrowline + Dollhouse results, and GitHub Actions run links): [`evidence/CI_AND_TEST_RECEIPTS_LOG.md`](./evidence/CI_AND_TEST_RECEIPTS_LOG.md)

### Stage 6 — Inherited Visual Reference Corpus & Chrome Pixel Parity Estate (`#1759` @ `026ac4636`)
All 119 files from PR `#1759` are directly inherited in PR `#1764`'s Git tree:
- Estate Guide & Complete Index: [`../marrowline-screaming-grove-visual-parity-20261121/README.md`](../marrowline-screaming-grove-visual-parity-20261121/README.md) · [`MARROWLINE_ALL_OUTPUTS_VISUAL_INDEX.md`](../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_ALL_OUTPUTS_VISUAL_INDEX.md)
- 13-Image Operator-Accepted Reference Corpus Index: [`MARROWLINE_OPERATOR_ACCEPTED_SCREENSHOT_CORPUS_INDEX.md`](../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_OPERATOR_ACCEPTED_SCREENSHOT_CORPUS_INDEX.md)
- Provider → DOM → Pixel Parity & High-Zalgo Comparison (`H8` falsified as primary cause; iOS Safari explicitly retained as untested): [`MARROWLINE_PROVIDER_DOM_PIXEL_PARITY.md`](../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_PROVIDER_DOM_PIXEL_PARITY.md) · [`MARROWLINE_BROWSER_WITNESS_HIGH_ZALGO_COMPARISON.md`](../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_BROWSER_WITNESS_HIGH_ZALGO_COMPARISON.md)
- Synthetic Blinded Artistic Specimens & Failure Gallery: [`MARROWLINE_BLINDED_ARTISTIC_SPECIMENS.md`](../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_BLINDED_ARTISTIC_SPECIMENS.md) · [`MARROWLINE_HIGH_ZALGO_FAILURE_GALLERY.md`](../marrowline-screaming-grove-visual-parity-20261121/MARROWLINE_HIGH_ZALGO_FAILURE_GALLERY.md)
- Chrome Visual Witness Runner & Custody Verifier: [`browser-witness/run-complete-visual-witness.mjs`](../marrowline-screaming-grove-visual-parity-20261121/browser-witness/run-complete-visual-witness.mjs) · [`verify-visual-parity-custody.mjs`](../marrowline-screaming-grove-visual-parity-20261121/verify-visual-parity-custody.mjs)

### Stage 7 — Immutable Predecessor Estates on GitHub
- **PR [`#1759`](https://github.com/tauric-diana-613/TD613-TCP/pull/1759)** (`026ac4636eba782364eab46404dfcadd9414e9e0`, CI Run [`44873359129`](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/44873359129) GREEN): Direct parent visual-parity estate.
- **PR [`#1746`](https://github.com/tauric-diana-613/TD613-TCP/pull/1746)** (`fe2e8bed3bd0923ae7c146524d8832531cbe837e`): Complete Stage I/II six-role Dollhouse adjudication dossier, intermediate patches, scratch scripts, and provider-free desktop/mobile browser witness screenshots (96 changed files / 168 manifest entries).
- **PR [`#1745`](https://github.com/tauric-diana-613/TD613-TCP/pull/1745)** (`4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`): Earlier draft precursor carrying deterministic repair ancestor `bc5467246f12b0598f89d681e4a4450c4733eace`.

### Stage 8 — Deferred Live Q1 Acquisition & Blinded Operator Review (`NOT YET GENERATED`)
Pending explicit exact-HEAD Operator authorization against the newly committed hardened HEAD SHA on PR `#1764`, the following artifacts remain ungenerated (`paid_provider_calls_executed: 0`) and will be published under `research/marrowline-screaming-grove-q1-20261121/live-acquisition/`:
- `Q1_LIVE_ACQUISITION_RECEIPT.json` (8 registered slots `S01`–`S08`)
- `raw-sse/S01.sse`–`S08.sse` (unmodified raw wire SSE bytes)
- `raw-text/S01.txt`–`S08.txt` (independently verified provider-authored UTF-8)
- `browser-witness/` (complete desktop + mobile `390×844` Chrome screenshots for every eligible, weak, flat, plain, or incomplete return)
- `Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md` (genuinely blinded full passages separated from arm labels & morphology numbers)

---

## 2. Portable Custody Manifest & Independent Verification Command

- Complete Machine-Verifiable Inventory: [`Q1_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json`](./Q1_COMPLETE_WORK_PRODUCT_CUSTODY_MANIFEST.json)
- Portable Custody Verifier: [`verify-q1-custody-manifest.mjs`](./verify-q1-custody-manifest.mjs)

Reproduce complete custody, digest, link-resolution, exclusion-schema, and secret-hygiene verification locally from the repository root:

```bash
node research/marrowline-screaming-grove-q1-20261121/verify-q1-custody-manifest.mjs --verify
```
