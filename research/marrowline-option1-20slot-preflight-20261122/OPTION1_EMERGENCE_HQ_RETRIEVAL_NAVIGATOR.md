# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 (20-Slot Preflight) Emergence HQ Retrieval Navigator

- **Commission:** `TD613-MARROWLINE-OPTION1-20SLOT-PREFLIGHT` (Source-Only Preflight + Read-Only Catalog Check — **Zero Paid Generation Calls**)
- **Principal & Final Artistic Authority:** Tawanna C. Miller (`tauric.diana.613`) — **Human Artistic Closure: RESERVED**
- **Scientific Adjudicator:** Amari · Emergence HQ (adjudicating [PR `#1766#issuecomment-7070422438`](https://github.com/tauric-diana-613/TD613-TCP/pull/1766#issuecomment-7070422438))
- **Repository:** `tauric-diana-613/TD613-TCP`
- **Branch:** `research/marrowline-option1-20slot-preflight-20261122` (DRAFT PR stacked on PR `#1766`)
- **Stacked Lineage:**
  - PR `#1766` (Stage 0 Reconstruction): `5cec27f0727c17ce1d2ac825736a1027293b8849`
  - PR `#1765` (Activation & Sedgwickian Design): `01c3b9e48391a79472369695b64481b19614f9fa`
  - PR `#1764` (Immutable Q1 Evidence Archive): `2836e636e4b5eb485b12f73a2596ea3889b173d4` (`94e2e9244` authorized source)
- **Authorized Executable HEAD SHA (Live Episode 1):** `c67e64363a436607722f1a943311c5ed9a73a906`
- **Live Acquisition Episode 1 Outcome (`2026-11-22T18:23:59Z` → `18:29:00Z`):** **`FAILED_WITH_TERMINAL_ERROR` (`UND_ERR_HEADERS_TIMEOUT` after `300,000 ms` on Slot `S01`; `1` attempted, `19` unattempted `S02`–`S20`; `0` recoverable specimens; `0` retries)** — see [`live-acquisition/OPTION1_LIVE_ACQUISITION_SUPPLEMENTAL_RECEIPT.md`](./live-acquisition/OPTION1_LIVE_ACQUISITION_SUPPLEMENTAL_RECEIPT.md) · [`live-acquisition/OPTION1_LIVE_ACQUISITION_RECEIPT.json`](./live-acquisition/OPTION1_LIVE_ACQUISITION_RECEIPT.json) · [`live-acquisition/OPTION1_LIVE_ACQUISITION_SUPPLEMENTAL_RECEIPT.json`](./live-acquisition/OPTION1_LIVE_ACQUISITION_SUPPLEMENTAL_RECEIPT.json)
- **Model-Identity Gate Verdict:** **`MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8`** *(Amari Rule #1 triggered fail-closed before any live generation! Zero quiet substitution for historical `gemini-3.7-flash`.)*
- **Paid Gemini Generation Calls Executed:** **`0`**
- **Q1 Artistic Verdict:** **PRESERVED** (all `6` completed Q1 returns rejected by Operator prior to unblinding; Q1 unblinding key sealed; zero Q1 backfilling)
- **Q2 / Experiment B / Merge / Release:** `Q2_HELD` · `EXPERIMENT_B_CLOSED` · `MERGE_AND_DEPLOY_HELD`

---

## 1. Quick Retrieval Map — Option 1 (20-Slot Preflight) Deliverables

| Artifact | Purpose | Relative Link |
|---|---|---|
| **Episode 2 Preregistration & Transport-Hardening Spec *(Choice B — Read First for EP2 Auth!)*** | Registers distinct `EP2` (`TD613-MARROWLINE-OPTION1-20SLOT-EP2-20261122` → `live-acquisition-ep2/`), preserves Episode 1 (`c67e64363` / `51c1f420c`) immutably, locks atomic pre-send receipts, per-slot fetch + streaming body error handling, explicit `300s`/`420s` deadline policy, and registered `STOP_3_CONSECUTIVE_TRANSPORT_FAILURES` (`threshold = 2`) | [`OPTION1_EPISODE2_PREREGISTRATION_AND_TRANSPORT_HARDENING.md`](./OPTION1_EPISODE2_PREREGISTRATION_AND_TRANSPORT_HARDENING.md) |
| **Episode 2 Read-Only TLS/ALPN & Metadata Transport Diagnostic (`0` paid calls)** | Concrete `2026-11-22T18:58:21.887Z` read-only Node `v26.7.0` TLSv1.3/ALPN `h2` (`390 ms`) and `GET /v1beta/models/` (`3.8`: `453 ms`, `3.6`: `149 ms`) receipt | [`OPTION1_EPISODE2_TRANSPORT_DIAGNOSTIC.json`](./OPTION1_EPISODE2_TRANSPORT_DIAGNOSTIC.json) |
| **Model-Identity Redesign Gate *(Read First — Amari Rule #1 STOP)*** | Explains why Amari's Rule #1 halted `3.8 × 3.7` (`gemini-3.7-flash` deprecated `2026-10-08` and auto-routed to `gemini-3.8-flash`), documents Oct 2 `gemini-generation-envelope.js` `LOW`-vs-`MEDIUM` thinking split, and presents Redesign A (`20`-slot `3.8` vs `3.6`), Redesign B (`10`-slot `3.8`-only), and Redesign C (`20`-slot `3.8` `MEDIUM` vs `LOW`) | [`MODEL_IDENTITY_REDESIGN_GATE.md`](./MODEL_IDENTITY_REDESIGN_GATE.md) |
| **Read-Only Authenticated Model Catalog & Aliasing Receipt (JSON)** | Live `2026-11-22T15:10:09.176Z` HTTP `GET /v1beta/models/...` receipt (`0` paid calls) for all `5` historical Oct 2 seats + all `19` Gemini 3.x text models, bound to official `2026-10-08` auto-routing records | [`OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json`](./OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json) |
| **Causal Limits & Aperture Boundary Specification** | Composite whole-envelope causal limit (`A` vs `H2`), exact `T1` historical `RUNTIME_DIAGNOSIS` vs modern `OPEN_FIELD_CREATIVE_SYNTHESIS` upstream-wire vs downstream-admission separation, finite screen ceiling (`n = 2`), zero Q1 backfill, and zero dollar/aggregate token ceiling | [`OPTION1_CAUSAL_LIMITS_AND_APERTURE_BOUNDARY.md`](./OPTION1_CAUSAL_LIMITS_AND_APERTURE_BOUNDARY.md) |
| **Executable 20-Slot Discriminator Harness (Episode 2 Transport-Hardened v2)** | Full `20`-slot research runner (`--dry-run` default with zero network; atomic pre-send slot receipts; per-slot fetch + incremental body-read error handling preserving genuine partial bytes without fake zero-byte SSE; registered `STOP_3` consecutive-transport guard `threshold = 2`; `REFUSED_EPISODE1_ARCHIVE_IMMUTABLE` lock; refuses `BLOCKED_HISTORICAL_3_7`; exact-HEAD `--operator-auth-sha` lock; canonical bots extractor; complete scrubbed `OPTION1_BLINDED_LITERARY_GALLERY.md`/`.json` released only when `>= 1` recoverable specimen exists; per-slot `STOP_1`, `HTTP 400`, `STOP_2`, `STOP_4`) | [`run-option1-20slot-discriminator.mjs`](./run-option1-20slot-discriminator.mjs) |
| **20-Slot Effective-Request Preflight Matrix (JSON — Episode 2 v1.2)** | Complete `20`-slot palindromically counterbalanced schedule (`S01`–`S20`, `meanSlotIndex = 10.50` across every factor) with exact SHA-256 digests, Episode 1 immutable archive ref, registered transport deadline policy, and explicit `git_head_provenance` | [`OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json`](./OPTION1_20SLOT_EFFECTIVE_REQUESTS_PREFLIGHT.json) |
| **Test & Verification Receipts (Episode 2 Transport-Hardened)** | Preserves all `3` Amari preflight Redpens, Episode 1 immutable archive ref, all `6` Episode 2 transport negative controls (a)–(f), `42 / 42` Marrowline + `5 / 5` constitutional local passes, pre-push verification, and honest stacked-PR CI disclosure | [`OPTION1_TEST_AND_VERIFICATION_RECEIPTS.md`](./OPTION1_TEST_AND_VERIFICATION_RECEIPTS.md) |
| **Automated Negative-Control, Redpen & Transport Suite (`15 / 15 PASS`)** | `15` zero-network Node tests (`globalThis.fetch` poisoned) covering all `3` Redpens + all `6` Episode 2 transport negative controls (pre-headers timeout + atomic pre-send + isolated recovery; mid-stream partial bytes vs zero bytes; `STOP_3` consecutive transport halt + 18 unattempted enumeration + no empty gallery; Episode 1 immutability + deadline policy + hard STOP precedence) | [`../../tests/marrowline-option1-20slot-preflight.test.mjs`](../../tests/marrowline-option1-20slot-preflight.test.mjs) |
| **Portable Custody Manifest & Verifier** | Exact SHA-256 digests, byte lengths, GitHub blob links, relative-link verifier, secret/path hygiene scanner, and safe exclusion records | [`OPTION1_EMERGENCE_HQ_CUSTODY_MANIFEST.json`](./OPTION1_EMERGENCE_HQ_CUSTODY_MANIFEST.json) · [`verify-option1-preflight-custody.mjs`](./verify-option1-preflight-custody.mjs) |

---

## 2. Linked Predecessor Estates & Historical Witnesses in Repository

- Stage 0 Reconstruction Navigator & Matrix (`PR #1766`): [`../marrowline-sep26-oct02-reconstruction-20261121/STAGE0_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md`](../marrowline-sep26-oct02-reconstruction-20261121/STAGE0_EMERGENCE_HQ_RETRIEVAL_NAVIGATOR.md) · [`../marrowline-sep26-oct02-reconstruction-20261121/MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json`](../marrowline-sep26-oct02-reconstruction-20261121/MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json)
- Immutable Q1 Live Acquisition Harness & Receipt (`PR #1764`): [`../marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs`](../marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs) · [`../marrowline-screaming-grove-q1-20261121/live-acquisition/Q1_LIVE_ACQUISITION_RECEIPT.json`](../marrowline-screaming-grove-q1-20261121/live-acquisition/Q1_LIVE_ACQUISITION_RECEIPT.json)
- Oct 15 Upstream Alias Documentation (`3.7→3.8`, `3.5→3.6`): [`../marrowline-multipart-repair-20261015/README.md`](../marrowline-multipart-repair-20261015/README.md)
- Oct 15 Neutral Capability Raw-SSE Digest Record (Task D): [`../marrowline-unicode-capability-20261015/LIVE-RESULT-20261015.md`](../marrowline-unicode-capability-20261015/LIVE-RESULT-20261015.md)
- Oct 14 Multi-Seat Selector Retirement Record (`PR #1498`): [`../marrowline-native-authorship-rest-20261014/README.md`](../marrowline-native-authorship-rest-20261014/README.md)

---

## 3. Staged Redesign A (`OPTION1_REV_A_38_VS_36_CONSTRUCTED`) 20-Slot Palindromic Schedule Summary

All `20` slots share exact `generationConfigSha256 = 4785e46e91df...` (`maxOutputTokens: 65536`, `thinkingLevel: "medium"`). Every factor (`model`, `envelope`, `task`, `slotClass`) has exact `meanSlotIndex = 10.50` (`S01..S10` Block 1; `S11..S20` exact reverse Block 2):

| Cell (`Envelope × Model × Task`) | Slots (Rep 1 / Rep 2) | `systemInstructionSha256` (12) | `contentsSha256` (12) | `bodySha256` (12) | Realization Class |
|---|---|---|---|---|---|
| `CURRENT_HYBRID_A × gemini-3.8-flash × T1` | `S01` / `S20` | `90421826b7c0` | `ba8299461d72` | `a3601b7bf598` | Contemporaneous Current Hybrid A Replicate |
| `LITERAL_OCT02_H2 × gemini-3.6-flash × T1` | `S02` / `S19` | `b3f4192caf74` | `ba8299461d72` | `e24c287cde0d` | Constructed Contemporary Counterfactual (Redesign A) |
| `LITERAL_OCT02_H2 × gemini-3.8-flash × T1` | `S03` / `S18` | `b3f4192caf74` | `ba8299461d72` | `e24c287cde0d` | Constructed Contemporary Counterfactual (Literal Oct 2 Wire) |
| `CURRENT_HYBRID_A × gemini-3.6-flash × T1` | `S04` / `S17` | `90421826b7c0` | `ba8299461d72` | `a3601b7bf598` | Constructed Contemporary Model Counterfactual (Redesign A) |
| `NEUTRAL_CREATIVE_D × gemini-3.8-flash × Task D` | `S05` / `S16` | `f95496026c13` | `8ddc8318f9b2` | `ae5b59b57ae7` | Contemporaneous Oct 15 Neutral Creative Control |
| `CURRENT_HYBRID_A × gemini-3.6-flash × T2` | `S06` / `S15` | `4590ac8c73a6` | `23be3dd96f58` | `8c56a603c582` | Constructed Contemporary Model Counterfactual (Redesign A) |
| `LITERAL_OCT02_H2 × gemini-3.8-flash × T2` | `S07` / `S14` | `4a4e35425f66` | `23be3dd96f58` | `001b072c52ce` | Constructed Contemporary Counterfactual (Literal Oct 2 Wire) |
| `CURRENT_HYBRID_A × gemini-3.8-flash × T2` | `S08` / `S13` | `4590ac8c73a6` | `23be3dd96f58` | `8c56a603c582` | Contemporaneous Current Hybrid A Replicate |
| `LITERAL_OCT02_H2 × gemini-3.6-flash × T2` | `S09` / `S12` | `4a4e35425f66` | `23be3dd96f58` | `001b072c52ce` | Constructed Contemporary Counterfactual (Redesign A) |
| `NEUTRAL_CREATIVE_D × gemini-3.6-flash × Task D` | `S10` / `S11` | `f95496026c13` | `8ddc8318f9b2` | `ae5b59b57ae7` | Contemporaneous Oct 15 Neutral Creative Control (Redesign A) |
