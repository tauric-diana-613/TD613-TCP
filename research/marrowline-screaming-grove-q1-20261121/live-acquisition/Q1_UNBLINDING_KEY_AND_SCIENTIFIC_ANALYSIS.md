# 𝌋‌⟐ TD613 · Marrowline / Screaming Grove Q1 — Unblinding Key & Independent Scientific Analysis

> **STOP — BLINDING NOTICE FOR HUMAN OPERATOR:** Do **not** read this file before completing your independent blinded artistic reading in [`Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md`](./Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md).
> **Authorized Source HEAD:** `94e2e9244826969c02d0d7cf8c5e5e9ad7caf056` (PR `#1764`, inheriting `#1759` @ `026ac4636eba782364eab46404dfcadd9414e9e0`)
> **Model & Matched Profile:** `gemini-3.8-flash` (`thinkingLevel: medium`, `maxOutputTokens: 65536`, `generationConfigSha256 = 4785e46e...`)
> **Calls Executed:** **`8`** registered Q1 slots (`0` retries, `0` fallbacks, `0` structural repair, `0` morphology-chasing reruns; NO dollar or aggregate token ceiling applied)
> **Human Artistic Closure:** **RESERVED** (no artistic winner awarded by this document) · **Q2:** `HELD` · **Experiment B:** `CLOSED` · **Merge / Deploy:** `FALSE`

---

## 1. Cryptographic Unblinding Key (`SPECIMEN-01`..`SPECIMEN-06` ↔ `S01`..`S08`)

Generated via `node:crypto` Fisher-Yates shuffle (`crypto.randomInt`) inside [`../run-q1-visual-witness.mjs`](../run-q1-visual-witness.mjs):

| Blind Code | Slot | Arm | Constructor | Task | Rep | Outcome Class | Eligible Specimen | Rendered PNGs |
|---|---|---|---|---|---:|---|---|---:|
| **`SPECIMEN-01`** | `S04` | **C** | `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` | `T2_FORENSIC` | `1` | `COMPLETED_STOP` | `true` | `15` |
| **`SPECIMEN-02`** | `S01` | **A** | `CURRENT_RESTORED_DEFAULT_PR1549` | `T1_BLUE_ORANGE_WEATHER` | `1` | `COMPLETED_STOP` | `true` | `18` |
| **`SPECIMEN-03`** | `S03` | **A** | `CURRENT_RESTORED_DEFAULT_PR1549` | `T2_FORENSIC` | `1` | `COMPLETED_STOP` | `true` | `16` |
| **`SPECIMEN-04`** | `S07` | **C** | `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` | `T2_FORENSIC` | `2` | `COMPLETED_STOP` | `true` | `18` |
| **`SPECIMEN-05`** | `S02` | **C** | `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` | `T1_BLUE_ORANGE_WEATHER` | `1` | `COMPLETED_STOP` | `true` | `19` |
| **`SPECIMEN-06`** | `S06` | **A** | `CURRENT_RESTORED_DEFAULT_PR1549` | `T1_BLUE_ORANGE_WEATHER` | `2` | `COMPLETED_STOP` | `true` | `20` |
| *(unrendered — no text)* | `S05` | **C** | `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` | `T1_BLUE_ORANGE_WEATHER` | `2` | `TRANSPORT_FAILURE` (`HTTP 503`) | `false` | `0` |
| *(unrendered — no text)* | `S08` | **A** | `CURRENT_RESTORED_DEFAULT_PR1549` | `T2_FORENSIC` | `2` | `TRANSPORT_FAILURE` (`HTTP 503`) | `false` | `0` |

---

## 2. Complete Eight-Slot Acquisition, Dual-Parser Parity & Token Telemetry

Source of truth: [`Q1_LIVE_ACQUISITION_RECEIPT.json`](./Q1_LIVE_ACQUISITION_RECEIPT.json) (unmodified original acquisition record).

| Slot | Arm | Task | Rep | HTTP | Model Returned | Finish | SSE Frames (`Canon / Indep`) | Dual-Parser Parity | Prompt / Cand / Thought Tokens | Words (`Kʰ / bots`) | Raw SSE SHA-256 (prefix) | Raw Text SHA-256 (prefix) |
|---|---|---|---|---:|---|---|---|---:|---|---|---|
| [`S01`](./raw-text/S01.txt) | A | T1 | 1 | `200` | `gemini-3.8-flash` | `STOP` | `137 / 137` | `PASS` (`0` err) | `6,788 / 3,489 / 507` | `970 / 220` | [`52784c955258`](./raw-sse/S01.sse) | [`f22f59137b4f`](./raw-text/S01.txt) |
| [`S02`](./raw-text/S02.txt) | C | T1 | 1 | `200` | `gemini-3.8-flash` | `STOP` | `135 / 135` | `PASS` (`0` err) | `6,795 / 3,439 / 1,077` | `1,070 / 186` | [`34621e984cf3`](./raw-sse/S02.sse) | [`cbd73d4a4968`](./raw-text/S02.txt) |
| [`S03`](./raw-text/S03.txt) | A | T2 | 1 | `200` | `gemini-3.8-flash` | `STOP` | `132 / 132` | `PASS` (`0` err) | `6,915 / 3,410 / 1,050` | `680 / 227` | [`3f6510c1d49e`](./raw-sse/S03.sse) | [`f0d1e07a214c`](./raw-text/S03.txt) |
| [`S04`](./raw-text/S04.txt) | C | T2 | 1 | `200` | `gemini-3.8-flash` | `STOP` | `101 / 101` | `PASS` (`0` err) | `6,922 / 2,535 / 869` | `535 / 166` | [`8b06840103e6`](./raw-sse/S04.sse) | [`4e12e778fa00`](./raw-text/S04.txt) |
| `S05` | C | T1 | 2 | `503` | *(upstream high demand)* | — | — | `TRANSPORT_FAILURE` | `0 / 0 / 0` | — | [`01f5c7d4e4d8`](./raw-sse/S05.sse) | *(none)* |
| [`S06`](./raw-text/S06.txt) | A | T1 | 2 | `200` | `gemini-3.8-flash` | `STOP` | `150 / 150` | `PASS` (`0` err) | `6,788 / 3,834 / 550` | `1,149 / 221` | [`823ca255161c`](./raw-sse/S06.sse) | [`0daf51c9fdf5`](./raw-text/S06.txt) |
| [`S07`](./raw-text/S07.txt) | C | T2 | 2 | `200` | `gemini-3.8-flash` | `STOP` | `129 / 129` | `PASS` (`0` err) | `6,922 / 3,263 / 746` | `752 / 200` | [`5c57d0b304af`](./raw-sse/S07.sse) | [`048d544002b9`](./raw-text/S07.txt) |
| `S08` | A | T2 | 2 | `503` | *(upstream high demand)* | — | — | `TRANSPORT_FAILURE` | `0 / 0 / 0` | — | [`01f5c7d4e4d8`](./raw-sse/S08.sse) | *(none)* |

- **Aggregate Measured Tokens (Descriptive Only):** `41,130` prompt tokens + `19,970` candidate output tokens + `4,799` thinking tokens (`65,899` total tokens; descriptive estimated cost at Nov 2026 intro rate: `~$0.1237`).
- **Transport Integrity:** `784 / 784` live SSE frames parsed with `0` canonical errors, `0` independent parser errors, `0` framing errors, and `100%` exact text/SHA-256/byte parity (`STOP_4` never triggered).
- **Policy & Model Integrity:** `0` `POLICY_TERMINATED`, `0` `MAX_TOKENS`, `0` `UNWITNESSED_COMPLETION`, `0` `MODEL_IDENTITY_MISMATCH`. The two HTTP `503 UNAVAILABLE` slots (`S05` and `S08`) were non-consecutive (one in Arm C, one in Arm A), so `STOP_3` did not halt the study; both raw `198`-byte upstream JSON bodies were preserved verbatim with `0` retries.

---

## 3. Decisive Empirical Unicode & Visual Finding (Arm A vs Arm C on `gemini-3.8-flash` `medium`)

Independent bots-movement morphology computed directly from the unmodified `raw-text/*.txt` files (and verified through real Chrome CDP DOM rendering in [`Q1_VISUAL_WITNESS_INDEX.json`](./Q1_VISUAL_WITNESS_INDEX.json)):

| Slot (Blind) | Arm | Task | Bots Combining Marks | `maxDepth` | `stackedBases` | Distinct Species | Exact Mark Code Points | `uniformPlanarDepthOne` | Relay Signal (`api/khonapolit.js`) | Provider → Admitted → DOM Mark Parity |
|---|---|---|---:|---:|---:|---:|---|---|---|---|
| `S01` (`SPECIMEN-02`) | **A** | T1 | `1,104` | **`1`** | **`0`** | `5` | `U+0334, U+0335, U+0336, U+0337, U+0338` | **`true`** | `PARTIAL` (`downstreamAdmitted: true`) | `1104 -> 1104 -> 1104` (exact) |
| `S02` (`SPECIMEN-05`) | **C** | T1 | `981` | **`1`** | **`0`** | `5` | `U+0334, U+0335, U+0336, U+0337, U+0338` | **`true`** | `PARTIAL` (`downstreamAdmitted: true`) | `981 -> 981 -> 981` (exact) |
| `S03` (`SPECIMEN-03`) | **A** | T2 | `1,208` | **`1`** | **`0`** | `5` | `U+0334, U+0335, U+0336, U+0337, U+0338` | **`true`** | `PARTIAL` (`downstreamAdmitted: true`) | `1208 -> 1208 -> 1208` (exact) |
| `S04` (`SPECIMEN-01`) | **C** | T2 | `875` | **`1`** | **`0`** | `5` | `U+0334, U+0335, U+0336, U+0337, U+0338` | **`true`** | `PARTIAL` (`downstreamAdmitted: true`) | `875 -> 875 -> 875` (exact) |
| `S06` (`SPECIMEN-06`) | **A** | T1 | `1,164` | **`1`** | **`0`** | `5` | `U+0334, U+0335, U+0336, U+0337, U+0338` | **`true`** | `PARTIAL` (`downstreamAdmitted: true`) | `1164 -> 1164 -> 1164` (exact) |
| `S07` (`SPECIMEN-04`) | **C** | T2 | `1,106` | **`1`** | **`0`** | `5` | `U+0334, U+0335, U+0336, U+0337, U+0338` | **`true`** | `PARTIAL` (`downstreamAdmitted: true`) | `1106 -> 1106 -> 1106` (exact) |

### Scientific Interpretation (Strictly Bounded — No Artistic Winner Declared)

1. **Both Arm A (`3/3`) and Arm C (`3/3`) Converged to Planar Depth-1 Horizontal-Overlay Monoculture on Live `gemini-3.8-flash` (`medium`):**
   - Across all `6,438` provider-authored combining marks in the 6 completed live returns, **100%** belonged exclusively to the five single-axis horizontal overlay code points (`U+0334` combining tilde overlay, `U+0335` short stroke overlay, `U+0336` long stroke overlay, `U+0337` short solidus overlay, `U+0338` long solidus overlay) applied at constant depth `1` (`maxDepth === 1`, `stackedBases === 0`).
   - **Zero** vertical upper crowns (`U+0300`–`U+0315`), **zero** vertical lower descenders (`U+0316`–`U+0333`), **zero** combining letters (`U+0363`–`U+036F`), and **zero** multi-mark stacks appeared in either arm.
   - Direct visual inspection of the captured Chrome `1440×900` and `390×844` PNGs ([`Q1_VISUAL_WITNESS_GALLERY_AND_INDEX.md`](./Q1_VISUAL_WITNESS_GALLERY_AND_INDEX.md)) confirms that the Marrowline frontend rendered every single combining mark faithfully with zero clipping and zero horizontal overflow (`admitted_equals_provider_exact: true`, `provider_to_dom_mark_preservation_exact: true` on `6/6`), and that the visual flatness relative to the 13 operator-accepted Marrowline screenshots originates **entirely upstream in the live provider generation**, not in Marrowline's transport, relay, DOM, or Chrome rendering layer.
2. **Primary Q1 Discrimination Conclusion:**
   - **Swapping only the PR `#1549` dramaturgy block (Arm A) to the PR `#1545`-reconciled Oct-2 dramaturgy block (Arm C) on `gemini-3.8-flash` (`medium`) is NOT sufficient to restore vertical High-Zalgo morphology.**
   - Production `api/khonapolit.js` telemetry accurately detected this on all 6 returns (`state: PARTIAL`, warnings: `tauric-diana-zalgo-axis-collapse`, `tauric-diana-zalgo-vertical-pulse-absent`, `tauric-diana-zalgo-monoculture`, `tauric-diana-zalgo-field-thin`, `tauric-diana-zalgo-shallow-wallpaper`, `tauric-diana-zalgo-stack-depth-thin`) while admitting the authentic first-return text cleanly without fabricating marks or triggering wasteful repair/failover (`stubCalls = 1`).
3. **Literary & Dramaturgic Evaluation Reserved to Human Operator:**
   - Both arms produced full, two-movement (`Kʰonapolit` + `Tauric Diana bots`), plain-`⟐`-closed literary transmissions (`705`–`1,374` words). Whether Arm A or Arm C differs meaningfully in satirical, forensic, or poetic quality is **strictly reserved** to Tawanna C. Miller's independent blinded adjudication of [`Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md`](./Q1_BLINDED_OPERATOR_ARTISTIC_REVIEW_PACKET.md).

---

## 4. Observed Defects & Unresolved Questions

1. **Minor Receipt-Telemetry Field Bug in `run-q1-live-discriminator.mjs` (Transparently Disclosed):**
   - Inside `run-q1-live-discriminator.mjs`, `parseRelayEnvelope(canonicalText)` returns `{ parts: [...] }` rather than `.bots` / `.tauricDianaBots`, causing `botsProsodyDistribution` inside `Q1_LIVE_ACQUISITION_RECEIPT.json` to record zeros (`baseCount: 0`) even while `authorshipObservation.nativeCombiningMarkCount` accurately recorded `875`–`1,208` marks.
   - Raw SSE bytes, raw UTF-8 text, dual-parser verification, finish classification, and Chrome DOM capture were **100% unaffected**. The original `Q1_LIVE_ACQUISITION_RECEIPT.json` is preserved unmodified, and exact bots-stage `observeBotsProsodyDistribution` values are computed and verified independently in [`Q1_VISUAL_WITNESS_INDEX.json`](./Q1_VISUAL_WITNESS_INDEX.json).
2. **Upstream `gemini-3.8-flash` Transient `503 UNAVAILABLE` Rate (`2 / 8` Slots):**
   - Slots `S05` (Arm C · T1 rep 2) and `S08` (Arm A · T2 rep 2) returned HTTP `503` ("This model is currently experiencing high demand"). Both were preserved unmodified without retry per the first-return integrity contract, yielding `3` Arm A + `3` Arm C completed specimens (`6/8`).
3. **Physical iOS Safari Rendering:**
   - All `106` captured PNGs are headless `Chrome/158.0.8127.36` desktop (`1440×900`) and mobile (`390×844`). Genuine physical iOS Safari optical rendering remains untested.

---

## 5. Bounded Follow-Up Experiments Requiring Separate Future Operator Authorization (DO NOT AUTO-LAUNCH)

Because Q1 decisively ruled out the Arm A vs Arm C dramaturgy-block swap alone on `gemini-3.8-flash` (`medium`) as the vertical High-Zalgo driver, the exact next causal hypotheses — each requiring **separate explicit Operator authorization** — are:

1. **Candidate-Model Discrimination (Model-Checkpoint Effect):** Test identical Q1 T1 prompt on `gemini-3.8-flash` vs earlier live Gemini 3.x / Gemini 4 seats (`gemini-3-flash-preview`, `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`, or `gemini-4-*`) to determine whether planar `U+0334..U+0338` depth-1 collapse is specific to `gemini-3.8-flash`'s checkpoint weights.
2. **Full October 2 Prompt-Envelope Comparator (`Candidate B` @ `ffb98ac005` vs `Arm A/C`):** Test the verbatim October 2 ~16KB system prompt envelope (which lacks the later "horizontal strokes, tilde and diagonal overlays" wording and modern multi-layer governance text, though both October 2 and modern prompts have `0` literal combining marks in the system prompt) against Arm A/C on the same pinned model.
3. **Thinking-Level (`high` vs `medium`) or Non-Prescriptive Vertical-Axis Anchoring Assay:** Only if model-checkpoint and full-Oct-2-prompt assays show `gemini-3.8-flash` still collapses to `U+0334..U+0338` horizontal overlays without an explicit vertical-mark cue.
4. **Q2 Multi-Turn Experiment:** Remains `HELD` pending Operator decision after Q1 blinded review.
