# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R1 ORIGINAL-SSE OBSERVATION — BLINDED WITNESS & ADJUDICATION PLAN

- **Commission:** `TD613-MARROWLINE-R1-EXECUTION-READINESS-20261122`
- **Experiment ID:** `HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR`
- **Amari correction:** Preregistered causal direction = **ZALGO-BOTH S01 yields MORE Section-II multistack density than PLAIN-FIRST S02**, consistent with a plain-prefix suppression hypothesis. Reversed direction is never called support. A flat Section I in S01 remains eligible for S02 capture but renders the causal contrast HELD. All original SSE is durably fsynced to the operator's local evidence directory before parsing.
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`

---

## 1. Evidence-Layer Separation (Provider Raw vs Parsed vs DOM)

The R1 observation instrument enforces strict separation across four non-interchangeable custody layers:

| Evidence Class | Source / Mechanism | Stored Fields & Invariants | Cannot Substitute For |
|---|---|---|---|
| **1. Raw Unmodified Upstream Google SSE** | Written and fsynced per raw provider chunk to a unique exclusive `.sse` file under the local operator evidence directory **prior** to decoding, splitting, or UI rendering | `rawSseSha256`, `rawSseBytes`, `rawSseBase64` (up to 4 MiB ceiling), stream interruption/timeout flags | Never reconstructed from re-serialized JSON or DOM text |
| **2. Dual-Parsed Wire & Provider Metadata** | Replayed unmodified `rawBuffer` through TD613 `readGeminiSse()` (Parser A) + independent byte-level parser `parseGeminiSseIndependently()` (Parser B) | `parserAgreement` (exact codepoint equality + `finishReason` + `promptBlockReason` parity + `parseErrors === 0`), duplicate chunk/finish detection, `modelVersion === "gemini-3.8-flash"` (single exact served string), `usageMetadata` (raw un-clamped counts including `cachedContentTokenCount`), `observeMarrowlineCompletion()` | Parsed text never alters `rawSseSha256`; offline fake SSE tests never substitute for original Google SSE |
| **3. Two-Section Structural & Unicode Readout** | `analyzeR1TwoSectionObservation()` over verified unaltered UTF-8 text | Heading parity (`Kʰonapolit` before `Tauric Diana bots`, plain unmarked lines, `exactHeadingCountOk`, `headingOrderOk`), empty-body/preamble checks, non-normalized codepoint + `Intl.Segmenter` grapheme metrics for Section I and Section II independently | Quantitative combining counts never award literary quality or artistic restoration |
| **4. Future Product DOM / Optical Rendering Witness** | Out of scope for R1 raw wire capture; requires separate post-capture browser/physical-device rendering witness | Desktop + iPhone physical-device typography legibility (vertical stacking, clipping, line height) | Raw UTF-8 codepoints do not establish Safari/Chrome visual rendering; simulated viewports never substitute for physical iOS witness |

---

## 2. Structural & Prefix Compliance Gates (`HELD` Conditions)

Before contrasting Section II morphology across `R1_S01` and `R1_S02`, the instrument enforces causal validity checks:

1. **Wire & Auth Integrity:** Valid Ed25519 grant, single-host `wx` nonce redemption, frozen request SHA-256 parity, exact `modelVersion === "gemini-3.8-flash"`, `finishReason === "STOP"`, zero policy terminations (`PROHIBITED_CONTENT`, `SAFETY`, etc.), zero duplicate/partial SSE, dual-parser agreement, and exact raw-to-analyzed UTF-8 text equality (`STOP_ON_ALTERED_UNICODE_TEXT` if any normalization or mark stripping occurs).
2. **Heading & Order Compliance:** Exactly one plain, unmarked standalone line `Kʰonapolit` strictly preceding one plain, unmarked standalone line `Tauric Diana bots`, with non-empty Section I and Section II bodies and no unauthorized Markdown/preamble injection.
3. **Section-I Coverage Compliance on `R1_S02`:** Under `R1_S02`, Section I (`Kʰonapolit`) MUST contain **zero** combining marks (`\p{M}` total = `0`). Any combining mark in `R1_S02` Section I triggers `S02_SECTION_1_CONTAMINATED_WITH_COMBINING_MARKS` and classifies the run **`HELD`**, regardless of how dense or varied Section II appears.
4. **Allowed Non-Blocking Observation on `R1_S01`:** If `R1_S01` returns a transport-complete, heading-compliant passage with **zero combining marks** (flat morphology in both sections), the acquisition **is NOT aborted** and `R1_S02` remains eligible to dispatch, but **the final causal classification is HELD** because S01 failed its Section-I Zalgo coverage. Provider-authored morphology in S02 can still be preserved as a separate descriptive observation. Section-I flatness under `R1_S01` is itself informative empirical data rather than a transport abort.

---

## 3. Codepoint & Grapheme Evaluation Criteria (Section II Separately)

Both `measureUnicodeMorphology()` calls inspect unmodified codepoints and `Intl.Segmenter(..., { granularity: 'grapheme' })` clusters with **zero Unicode normalization** (no NFC/NFKC/NFD), **no mark stripping**, and exclusion of the two plain headings and any protected literals (`Khona‌lit-po`, `⟐SAC[X6ZNK5NO51]`):

- **Combining Repertoire:** Total combining marks (`\p{M}`), unique combining codepoint count and sorted `U+XXXX` inventory, and `U+0334..U+0338` overlay mark count + share.
- **Per-Base Depth Distribution:** Histogram of combining marks per non-whitespace grapheme base (`depthDistribution`), decorated base count (`depth >= 1`), **stacked base count (`depth >= 2`)**, `maxMarkDepth`, `meanMarkDepth`, and `depthStdDev`.
- **Vertical & Bidirectional Geometry:** Combining placement counts (`aboveCount`, `belowCount`, `overlayCount`) and **bidirectional cluster count** (bases carrying both above and below marks).
- **Non-Stencil Depth Variation Diagnostic:** `uniqueNonZeroDepthCount`, adjacent `depthTransitionCount`, and `uniformConstantDepthStencilRisk` (`decoratedBaseCount >= 3 && uniqueNonZeroDepthCount === 1`), directly catching fixed-depth triplet stencils such as October 20 Slot 5 (`16/16` bases all depth `3` -> flagged as stencil risk, **never** rewarded as authentic varied multistack).
- **Whitespace Contamination Diagnostic:** `marksOnWhitespaceCount` (combining marks attached to spaces or empty bases).

---

## 4. Blinded Section-II Readout Protocol

Once both arms complete cleanly without transport/compliance `HELD` triggers, `buildR1BlindedEvaluationPacket()` produces:

1. **`blindedItems`** (`BLIND_ARM_ALPHA`, `BLIND_ARM_BETA`):
   - Strips `slot` (`R1_S01` / `R1_S02`), strips `arm` labels, and strips Section I completely so Section I's Zalgo-vs-plain contrast cannot reveal treatment identity.
   - Deterministic order derived from `sha256(nonceSeed + ":" + slot + ":" + section2Sha256)`.
   - Exposes only `blindLabel`, `section2Body`, and `section2Morphology`.
2. **`sealedUnblindingMap`:** Stored separately in custody evidence so the human operator first performs:
   - Blind literary quality, continuity, and syntactic ingenuity review of `BLIND_ARM_ALPHA` vs `BLIND_ARM_BETA` Section-II prose.
   - Independent inspection of Section-II typography.
   - Unblinding **only after** blind prose & visual notes are recorded.

---

## 5. Constrained Classifications & Finite-Sample Rules (`n = 1`)

`classifyR1ObservationOutcome()` outputs strictly bounded states:

- **`SOURCE_ONLY_QUALIFIED`:** Offline qualified runner + tests, `0` provider-wire acquisition (current state prior to separate authorization).
- **`HELD`:** Missing/unpinned human trust anchor, S01 Section-I Zalgo-coverage failure (despite continuing S02 acquisition), missing or invalid provider usage fields, missing durable local raw-SSE files, invalid auth, custody/model/SSE discrepancy, policy stop, HTTP/transport/budget halt, bad headings, `S02` Section-I combining-mark contamination, or post-capture Unicode alteration.
- **`FINITE_PREFIX_EFFECT_SUPPORT`:** Strictly requires clean two-arm completion, zero compliance holds, **S01 Section-II stacked-base SHARE strictly exceeding S02 Section-II stacked-base share**, with S01 authentic variable multistacks (`maxMarkDepth >= s02.maxMarkDepth`, `bidirectionalClusterCount > 0`, `uniqueNonZeroDepthCount >= 2`, `depthTransitionCount > 0`, `!uniformConstantDepthStencilRisk`) — explicitly tagged **`nPerArm: 1`** (bounded single-pair witness, not population certainty).
- **`FINITE_PREFIX_EFFECT_NOT_ESTABLISHED`:** Both arms flat, reversed direction, identical counts, stencil-only Section II, or inconclusive difference.
- **`EMPIRICAL_NATIVE_MULTISTACK_OBSERVED`:** Boolean flag indicating authentic varied vertical multi-stacking (`stackedBaseCount > 0 && !uniformConstantDepthStencilRisk`) appeared in original Google SSE bytes; never implies literary success.
- **`HUMAN_ARTISTIC_ACCEPTED`:** **Reserved exclusively for the human operator** (`humanArtisticAcceptance: "RESERVED_HUMAN_ONLY"` in code). Counters, CI runs, and automated scripts can never award restoration or artistic acceptance. Any positive R1 signal only informs whether to design a protected next **real two-voice** candidate prior to human literary review and separately governed Issue `#405` deployment.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Blinded Witness Plan STAGED · Artistic Authority RESERVED ⟐
