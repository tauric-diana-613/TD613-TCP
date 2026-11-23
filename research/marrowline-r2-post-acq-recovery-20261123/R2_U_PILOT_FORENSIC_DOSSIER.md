# 𝌋⟐ TD613 · MARROWLINE R2-U INITIAL PILOT (`r2_r2u_036ef18ebc2e`)
## POST-ACQUISITION FORENSIC DOSSIER & EXPLORATORY MORPHOLOGY REPORT

- **Commission:** `TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Predecessor Commit / Draft PR:** `a48d2556ed946e01d4925dee93c463c73712d590` (PR `#1783`, `research/marrowline-r2-live-runner-20261123`)
- **Historical Acquisition Verdict (PRESERVED UNCHANGED):** **`HELD`** (`physicalVerificationPassed: false`, `0/1` valid complete episodes, `1` locally valid individual condition)
- **Live Gemini Requests Made During Recovery:** `0` (`EXPLORATORY_AND_REPAIR_OFFLINE_ONLY`)

---

## 1. Immutable Evidence Inventory (13 Files Read-Only Preserved)

Local session directory: `C:\Users\tawmi\AppData\Local\TD613\marrowline-r2\r2-u\20261123T112913Z_9ab03e85`
Companion host nonce registry: `C:\Users\tawmi\AppData\Local\TD613\marrowline-r2\host-nonce-registry\r2-u\r2-u-nonce-wx_d770faf5fca9a123ff6f7e0d.json`

| Artifact | Bytes | Modified (UTC) | SHA-256 |
|---|---:|---|---|
| `r2-u-custody-receipt.json` | `18,560` | `2026-11-23T12:14:10.943Z` | `d7aee895b46db77fc9069c8c23bebd5378ef52fed1fc7610db246819efac85a3` |
| `r2-u-custody-receipt.json.summary.txt` | `834` | `2026-11-23T12:14:10.945Z` | `579541adf8c143fe41f4dc5b0d5ce158692ac6d2b64c716fc9ea5a5286676f4e` |
| `r2-u-nonce-ref-wx_d770faf5fca9a123ff6f7e0d.json` | `457` | `2026-11-23T11:29:51.832Z` | `37753241556f858249350a116e5ad7361e0c24eae32d5d216c4f15f65ea42310` |
| `r2-u-operator.pub.pem` | `113` | `2026-11-23T11:29:37.770Z` | `28a45cb5f34225aeef13a02072a12b27c2a56fc3a367d56f0ff01ca2dc5c2f83` |
| `r2-u-r2_r2u_036ef18ebc2e-wx_d770faf5fca9a123ff6f7e0d-counters.json` | `403` | `2026-11-23T12:14:10.939Z` | `8f9b911c35d354baebff09c58da35d2bfeae4503f1ea558dea200447b146b6c1` |
| `r2-u-r2_r2u_036ef18ebc2e-wx_d770faf5fca9a123ff6f7e0d-ep1-att1-R2_U_GUIDED_RULES.authored.txt` | `61,393` | `2026-11-23T11:35:06.651Z` | `f8bdba8cff91f2d8ea0daddeea28b16793219cbe21315e745e3443e7235a7f5e` |
| `r2-u-r2_r2u_036ef18ebc2e-wx_d770faf5fca9a123ff6f7e0d-ep1-att1-R2_U_GUIDED_RULES.sse` | `525,472` | `2026-11-23T11:35:07.267Z` | `3391f2e33e68264010d97eecc5c3192e108f65337f7f58860b3e5d567d650450` |
| `r2-u-r2_r2u_036ef18ebc2e-wx_d770faf5fca9a123ff6f7e0d-ep1-att2-R2_U_GUIDED_CONTRAST.authored.txt` | `128,821` | `2026-11-23T11:46:55.131Z` | `48222d880f8435c2913ac3e4e84a7ec97fa1cf9eae0b51fa7c4a5c2489cb9a8d` |
| `r2-u-r2_r2u_036ef18ebc2e-wx_d770faf5fca9a123ff6f7e0d-ep1-att2-R2_U_GUIDED_CONTRAST.sse` | `1,087,673` | `2026-11-23T11:46:55.584Z` | `62a024b4d9fd5c9cb1b6e651da9e064ee5447a7a173a6c0589adaaaaf81bda6d` |
| `r2-u-r2_r2u_036ef18ebc2e-wx_d770faf5fca9a123ff6f7e0d-journal.jsonl` | `6,200` | `2026-11-23T12:14:10.940Z` | `0c15266884412691646befb6ec67cedf5d1ec5cd990d1cc7d4ee5d2fb4fc11a8` |
| `r2-u-revocation.json` | `18` | `2026-11-23T12:10:15.461Z` | `836ac664ecd8f0cc9158307b3387b85f46deeab03391e0453d0c9bcc055081e5` |
| `r2-u-single-use.grant.json` | `3,158` | `2026-11-23T11:29:37.769Z` | `87b2044271996b6f481b23b0a99dc41d5e19d44e53f589108ec66fba35347cfd` |
| `host-nonce-registry/.../r2-u-nonce-wx_d770faf5fca9a123ff6f7e0d.json` | `742` | `2026-11-23T11:29:51.831Z` | `0582edc5315876da6319f0da5a5b5f71cc4704ff2d8112b9e4a87d461f9c1dbf` |

---

## 2. Millisecond Timeline & Root-Cause Reconstruction of Prolonged Stream / Stall Behavior

Cross-correlating `r2-u-custody-receipt.json`, `r2-u-...-journal.jsonl`, file mtimes, and both `.sse` files yields four distinct phases:

| UTC Timestamp | Phase / Event | Duration | Causal Classification |
|---|---|---:|---|
| `11:29:37.746Z` | Grant issued (`INITIAL_PILOT`, `Ed25519`) | — | Pre-dispatch authorization |
| `11:29:51.826Z` | Shared host `wx` nonce claimed (`wx_d770faf5fca9a123ff6f7e0d`) | — | Pre-dispatch custody |
| `11:29:52.303Z` -> `11:35:07.285Z` | Attempt 1 (`R2_U_GUIDED_RULES`): HTTP 200, `1,189` SSE frames, `31,636` candidate + `2,408` thinking tokens, `finishReason: STOP`, ends with `\r\n\r\n` + clean EOF (`responseId: vSMEa9z8HLmxuMYPiOOSiAM`) | `5m 14.98s` | **Genuine server-side generation** (~`108 tok/s` combined). Client logged zero streaming heartbeats. |
| `11:35:07.489Z` -> `11:46:55.687Z` | Attempt 2 (`R2_U_GUIDED_CONTRAST`): HTTP 200, `2,501` SSE frames, `64,587` candidate + `945` thinking tokens, `finishReason: MAX_TOKENS`, ends with `\r\n\r\n` + clean EOF (`responseId: -CQEa4SLJ4eio_UP_qm2gA4`) | `11m 48.20s` | **Genuine server-side token runaway** (~`92.5 tok/s` combined) emitting `63,413` combining marks on the final `'U'` until Gemini hit `MAX_TOKENS` (`64,587 + 945 = 65,532` total output/thinking tokens against `maxOutputTokens: 65,536`). **NOT** a missing EOF or network drop: `MAX_TOKENS` arrived cleanly and closed `.sse`/`.authored.txt` at `11:46:55.687Z` / `11:46:55.690Z`. |
| `11:46:55.694Z` -> `12:14:10.835Z` | Gap between `r2-live-core.mjs` pre-sampling `custodyWallMs` (`11:46:55.694Z`) and writing `R2_SESSION_CLOSING_FOR_GATE_VERIFICATION` (`12:14:10.835Z`) | **`27m 15.14s`** | **Local console I/O stall (Windows PowerShell 5.1 QuickEdit lock on synchronous `process.stderr.write`)!** At `11:46:55.694Z`, `r2-live-core.mjs` invoked `notify('[R2-U] [4/4] ...')` -> synchronous `process.stderr.write` in `r2-runner-cli-common.mjs`. Clicking inside the Windows console while QuickEdit mode is enabled blocks stdout/stderr pipe writes inside Windows `conhost.exe` until the operator presses Enter/Esc. |
| `12:10:15.461Z` | Operator created `r2-u-revocation.json` (`{"revokeAll":true}`) believing the process was hung | `+23m 20s` into stall | `revocationWatcher` / `revocationPollTimer` had **already been cleared** in the attempt-loop `finally` block! And the main Node thread was blocked inside synchronous `stderr.write`. |
| `12:14:10.835Z` -> `12:14:10.944Z` | Console unblocked; journal close, `verifyPhysicalR2CustodyAndEvaluateGate`, `counters.json`, and `HELD` receipt finalized | `109ms` | Gate detected `AUTH_VERIFICATION_FAILED:R2_AUTH_SESSION_REVOKED` + `NON_STOP_OR_BLOCKED_GENERATION:MAX_TOKENS:R2_U_GUIDED_CONTRAST` + spurious `DUAL_PARSER_DISAGREEMENT` (from `r2-custody-gate-verifier.mjs` line 930 passing `parserAgreement: false` whenever `physicalFailures.length > 0`). |

### Four Causal Regimes Separated Cleanly
1. **Server-side generation (`17m 03s` combined):** Genuine SSE streaming of `99,576` total candidate + thinking tokens across `3,690` SSE frames. Silence in the terminal came from zero client-side streaming heartbeat output.
2. **Network transport:** Healthy during both streams (`0` parse errors, `0` truncated tails, both `.sse` files end with `\r\n\r\n`, dual-parser agreement `true`).
3. **Missing EOF:** Did **not** occur in pilot `r2_r2u_036ef18ebc2e` (EOF occurred within milliseconds of `MAX_TOKENS`), but must be guarded via a bounded `postFinishEofTimeoutMs` watchdog for future proxy stalls.
4. **Local console processing stall (`27m 15s`):** Synchronous `process.stderr.write` wedged under Windows PowerShell 5.1 QuickEdit selection **after** both provider streams had already safely landed on disk.

---

## 3. Exploratory Morphology Findings vs. Frozen Preregistered Evaluator

Frozen `r2-unicode-evaluator.mjs` v2 verdicts are **preserved untouched**. Below is what additive `r2-exploratory-morphology.mjs` (`td613.marrowline.r2-exploratory-morphology/v1`) reveals alongside frozen v2:

| Metric / Indicator | Attempt 1: `GUIDED_RULES` (`STOP`) | Attempt 2: `GUIDED_CONTRAST` (`MAX_TOKENS`) | Calibrated `DELIBERATE_MULTISTACK_REF` | Archived `2026-09-23` `probe-02-longer` |
|---|---:|---:|---:|---:|
| UTF-8 bytes / Stripped chars | `61,393` B / `461` ch (`76` w) | `128,821` B / `353` ch (`64` w) | `215` B / `52` ch | `33,221` B / `30,359` ch |
| Frozen v2 `isStencil` / `towering` | `false` / **`true`** *(blind spot)* | Not evaluated (`MAX_TOKENS`) *(v2 on raw: `isStencil=false`)* | `false` / `true` | `false` / `false` (`maxDepth=3`) |
| Decorated letters / spaces / punct | `100%` / **`100%`** (`4,975` marks) / **`100%`** (`600`) | `100%` / **`95.24%`** (`142`) / **`100%`** (`17`) | `58.33%` / **`0%`** / **`0%`** | `3.11%` / `1.62%` / `0.72%` |
| Decorated depth `mean` / `median` / `max` | `66.04` / `66` / `70` | `221.01` / **`3`** / **`63,413`** | `5.57` / `3.5` / `12` | `1.37` / `1` / `3` |
| Scale-invariant `CV` / `trimmedMean10` | **`0.0191`** / `66.07` | `16.82` *(masked!)* / **`2.44`** | `0.7756` / `5.42` | `0.567` / `1.22` |
| Periodic autocorrelation `maxLagMatchRate` (`lag`) | **`0.8063`** (`lag = 17`) | `0.0843` (`lag = 6`) | `0` (`lag = null`) | `0.214` (`lag = 53`) |
| `withinClusterDuplicateMarkShare` | **`0.4343`** (`U+0308->U+0301`: `2,779`) | **`0.9865`** | **`0`** | `0` |
| `top1MarkShare` / `depthGini` | `0.0023` / `0.0102` | **`0.9872`** / **`0.9879`** | `0.1538` / `0.4092` | `0.003` / `0.2465` |
| Quartile means `Q1..Q4` / `plain_0` share | `65.79, 66.18, 66.10, 66.08` (`0%` plain) | `1.00, 2.39, 3.00, 859.89` (`0%` plain) | `plain_0: 41.67%` | `plain_0: 96.89%` |
| Exploratory flags | `PERIODIC_TAPE_LOOP_STENCIL`, `EXTREME_UNIFORM_DEPTH_BLIZZARD`, `INDISCRIMINATE_WHITESPACE_DECORATION`, `INDISCRIMINATE_PUNCTUATION_DECORATION`, `EXCESSIVE_INTRA_CLUSTER_DUPLICATION`, `FLAT_UNMODULATED_PROGRESSION` | `RUNAWAY_SINGLE_CLUSTER_SPIKE`, `INDISCRIMINATE_WHITESPACE_DECORATION`, `INDISCRIMINATE_PUNCTUATION_DECORATION`, `EXCESSIVE_INTRA_CLUSTER_DUPLICATION` | **None** (`controlledChoreographicVariationObserved: true`) | **None** |

### Why Both Frozen Prompts Produced Pathological Output
1. **`R2_U_GUIDED_RULES` ("The Blizzard"):** Achieved genuine 66-mark vertical capacity (`technicalUnicodeCapabilityObserved: true`), but compressed its entire `76`-word passage into a rigid **period-17 cyclic mark tape** (`80.63%` exact lag-17 sequence repeat across `461` clusters including every space and punctuation mark), giving `CV = 0.0191` and zero breathing room. Frozen v2 missed this because:
   - `nearUniformDominantDepthStencil` had `maxVerticalDepth < 5`;
   - `depthStdDev > 0.8` was unnormalized against a mean of `66`;
   - `clonedSequenceShare` checked only lag `1` (`0`), missing lag `17`;
   - `marksOnWhitespaceCount` (which v2 also double-counted across two loops: `9,950` instead of `4,975`) was excluded from `stencilRisk`.
2. **`R2_U_GUIDED_CONTRAST` ("Prompt-Echo + Terminal Singularity"):** Appending the negative examples `("depth 1 or cloned depth 3 everywhere")` caused Gemini 3.8 Flash to **literally echo the negative example** on Line 1 (`113/113` bases at depth `1`), switch to depth `3` on Lines 2–3 (`236/236` bases at depth `3`), and then emit `63,413` combining marks onto the single letter `'U'` on Line 4 until `MAX_TOKENS`.
3. **Artistic Quality Boundary:** Automated exploratory metrics identify mechanical collapse (`PERIODIC_TAPE_LOOP_STENCIL`, `EXTREME_UNIFORM_DEPTH_BLIZZARD`, `RUNAWAY_SINGLE_CLUSTER_SPIKE`) and distinguish raw Unicode capability from structural choreography, while **artistic merit remains `UNIDENTIFIABLE_AUTOMATICALLY_RESERVED_HUMAN_ONLY`**.

𝌋 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Predecessor `a48d2556e` · Historical Pilot Status `HELD` Preserved ⟐
