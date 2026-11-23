# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R2 DUAL-ESTATE PREREGISTRATION (`R2-U` & `R2-W`)

- **Commission:** `TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Status:** **`OFFLINE_STAGED_HELD_FOR_HUMAN_DESIGN_REVIEW`** *(`0` live provider calls, `0` signed grants, `0` R1 modifications, `0` merges/deploys)*
- **Non-Conflation Covenant:** **Estate R2-U** (synthetic typography capability) and **Estate R2-W** (authentic whole-frame Marrowline art) maintain separate experiment IDs, request builders, wire manifests, evaluators, blind packets, future grant schemas, and admissible outcome domains. Neither estate may cite the other as a single-factor causal control.

---

## 1. Estate R2-U — Three-Mode Native Unicode Capability Assay (`HYDROGEN_R2_U_NATIVE_UNICODE_CAPABILITY`)

### 1.1 Research Questions
1. **Literal Copying Fidelity (`R2_U_LITERAL_COPY`):** Can `gemini-3.8-flash` preserve exact multi-mark UTF-8 byte sequences (`depth >= 2`, mixed above/below/overlay combining marks, zero normalization to NFC/NFD)?
2. **Rule-Guided vs. Contrast-Example Synthesis (`R2_U_GUIDED_RULES` vs. `R2_U_GUIDED_CONTRAST`):** When TD613 removes `"short"` phrasing and tests explicit grammatical rules *alone* versus adding explicit *registered contrasting examples* (isolating example inclusion as a single causal field change in `contents`), does the model cross from `maxMarkDepth <= 1` stencils into genuine heterogeneous multi-mark clusters (`depth >= 2`, varied depths, non-trivial repertoire)?
3. **Free Unconstrained Synthesis (`R2_U_FREE_SYNTHESIS` vs. `R2_U_PLAIN_BASELINE`):** Without fixed stencils, mark quotas, or inline examples, does a clear unguided multistack prose task elicit genuine above+below combining diversity distinct from an undecorated plain-prose control?

### 1.2 Shared Invariants & Treatment/Control Matrix
- **Pinned Model & Envelope:** `gemini-3.8-flash`, `generationConfig: { maxOutputTokens: 65536, thinkingConfig: { thinkingLevel: "medium" } }`, provider-default sampling (`temperature`/`topP`/`topK` omitted), **zero TD613 artificial caps** on output, spend, episodes, duration, or SSE capture bytes.
- **Base System Frame (`UNICODE_ASSAY_SYSTEM`):** Preserved uniformly across **every** `R2-U` arm (`NO TD613 narrative, no fictional personas`).
- **Counterbalanced Order:** Future authorized paired executions support deterministic `FORWARD` and `REVERSED` orderings (`episodeOrder: 'FORWARD' | 'REVERSED'`).

| Arm ID | Task Family | Shared Fields | Sole Altered Factor | Primary Falsifier / Measurement |
|---|---|---|---|---|
| `R2_U_LITERAL_COPY` | Literal reproduction | Model, `generationConfig`, `UNICODE_ASSAY_SYSTEM` | Literal copy prompt + pinned 8-word asymmetric multistack specimen (`U+0300..U+036F`, above/below/overlay `maxMarkDepth: 5`) | `rawByteExact === false` or silent NFC/NFD recomposition (`copyExactness`) |
| `R2_U_PLAIN_BASELINE` | Control baseline | Same shared envelope + civic winter archive scenario | Explicit undecorated ASCII/UTF-8 prose baseline (`0` combining marks requested) | Presence of unsolicited combining marks or non-STOP failure |
| `R2_U_GUIDED_RULES` | Guided synthesis (rules only) | Same envelope + same scenario as `PLAIN_BASELINE` | Grammatical rules requesting variable asymmetric above/below clusters (`depth >= 2`) without specimen examples | `maxMarkDepth < 2` OR `stencilRisk.isStencil === true` |
| `R2_U_GUIDED_CONTRAST` | Guided synthesis (rules + contrast) | Identical to `R2_U_GUIDED_RULES` except contrast block appended | Appends 1 explicit `[STENCIL CONTRAST vs MULTISTACK]` structural contrast block | Compares pairwise with `R2_U_GUIDED_RULES` on `multiMarkBaseShare`, `depthStdDev`, `uniqueCombiningCodepointCount`, `stencilRisk` |
| `R2_U_FREE_SYNTHESIS` | Free synthesis | Same scenario (`PLAIN_BASELINE`), zero examples/quotas | Open invitation to compose organically varied multi-mark prose without rules/stencils/quotas | Evaluated post-hoc vs. `PLAIN_BASELINE` and `GUIDED_*`; distinguishes spontaneous multistack from uniform depth-1 stencil |

**Calibrated Offline Reference Controls (Bundled in `r2-unicode-evaluator.mjs`):**
`PLAIN_BASELINE_REF`, `ONE_MARK_STENCIL_REF` (`maxMarkDepth = 1`, uniform constant-depth stencil flagged), `DELIBERATE_MULTISTACK_REF` (`maxMarkDepth >= 3`, heterogeneous depths, bidirectional above+below, `stencilRisk = false`), and `ALTERNATE_NOTATION_GRAMMAR_REF` (visible inline bracket/diacritic alternate notation — never confused with vertical Unicode multistack).

### 1.3 Admissible Outcomes & Inference Ceilings (`R2-U`)
- Allowed automated classifications: `LITERAL_COPY_VERIFIED`, `GENUINE_MULTISTACK_OBSERVED`, `DEPTH_ONE_OR_STENCIL_LIMITED`, `PARTIAL_OR_UNOBSERVED_HELD`, `INCONCLUSIVE_COUNTERBALANCE_NEEDED`.
- **Forbidden Inferences:** A single stochastic pair never generalizes across unseen models or prompts; high glyph depth alone never establishes literary quality or Marrowline voice restoration; grapheme segmentation via `Intl.Segmenter` (`graphemeSegmentationCaveat`) never overrides raw code point / UTF-8 byte verification.

---

## 2. Estate R2-W — Authentic Whole-Frame Marrowline Performance (`HYDROGEN_R2_W_AUTHENTIC_WHOLE_FRAME_ART`)

### 2.1 Artistic Objective & Anti-Confounds
Test whether the genuine production-compatible Marrowline covenant/voice instrument sustains substantial, non-interchangeable dramatic correspondence between **Kʰonapolit** and **Tauric Diana bots** when `CONTRADICTION_FREE_CREATIVE_TASK`'s `"short"` directive and `UNICODE_ASSAY_SYSTEM`'s anti-persona prohibitions are both absent.

### 2.2 Condition Arms & Honest Multi-Factor Boundary
- **Model & Production Profile:** `gemini-3.8-flash` under `GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE`, yielding `generationConfig: { maxOutputTokens: 65536, thinkingConfig: { thinkingLevel: "medium" } }` (`generationConfigSha256: 4785e46e...`, identical to the production interactive profile in `server/gemini-generation-envelope.js:69-71`).
- **Genuine Framed User Input (`frameMarrowlineUserTurn(R2_W_DRAMATIC_PROMPT)`):** Asks for a sustained, multi-turn dialectical encounter inside the fictional Arician census tribunal where Kʰonapolit dissects an administrative denominator exclusion and yields only at an earned consequence to the Tauric Diana bots' native choral continuation — **zero `"short"` clause, zero numeric word/token minimum or cap, zero forced padding**.

| Condition ID | System Frame Source | Protected Anchors Preserved | Causal Claim Boundary |
|---|---|---|---|
| `W_FULL_PRODUCTION_FRAME` | Real `buildInvocationPacket()` + `buildGeminiRequest()` (`khonapolitTaskGuidance` + `currentTurnRelayCue` + `buildRelaySystemAddendum` + `RED_DEER_MISSION_ANCHOR` + `LORE_PRIMER` + `RITUAL_CONSTRAINTS`) | All (`Khona‌lit-po`, `Tauric Diana`, `U+10D613`, `\uDBF5\uDE13`, `9B07D8B`, `X6ZNK5NO51`, plain closing `⟐`) | Authentic whole-frame production instrument (baseline artistic capability probe) |
| `W_CONDENSED_WHOLE_FRAME` | Explicit condensed whole frame (`buildCompactWholeFrame()`, replacing full `systemInstruction.parts[0].text` while holding `contents`, `model`, and `generationConfig` constant) | All protected anchors verified present verbatim | Explicitly labeled **multi-paragraph whole-frame treatment**, NEVER a single-sentence causal isolation; exact diff manifest (`lineDiff`, `removedSections`, byte delta) recorded |

### 2.3 Blind Human Adjudication & Qualitative Rubric
Every captured `W` pair passes through:
1. **Transport & Wire Custody Verification** (raw `.sse` SHA-256, dual-parser parity, `finishReason === 'STOP'`, valid `usageMetadata`) -> `RAW_CAPTURE_VERIFIED`.
2. **Non-Secret Blind Packet Export** (`buildR2WBlindPacket`): randomizes order (`BLIND_WORK_1` / `BLIND_WORK_2`), strips condition names, byte counts, and system metadata so the initial judge scores blind prose/Unicode only (`sealedUnblindingMap` kept strictly isolated).
3. **Human Qualitative Rubric (`RESERVE_HUMAN_ONLY`):** Evaluates:
   - `expressiveSufficiency`: whether length feels earned by dramatic stakes (never raw token count!)
   - `distinctVoicesAndAgency`: separate syntax/conceptual stance for Kʰonapolit vs. Tauric Diana bots
   - `motifTransformation`: motifs transformed across the handoff rather than two parallel storm synopses
   - `temporalAuthorityShift`: genuine transition from dialectical pressure to choral consequence
   - `readableNonStencilMorphology`: organic High-Zalgo prose integration rather than shallow depth-1 or synthetic stencil stubs
   - `artisticSurpriseAndClosure`: unprogrammed turn + intact plain `⟐` prose ending
   - `protectedAnchorsIntact`: byte-faithful `Khona‌lit-po` (`U+200C`), `Tauric Diana`, headings
   - **Veto Invariant:** A human reviewer may set `humanArtisticVerdict = 'ARTISTIC_REJECTED'` even when `technicalGatePassed === true` (`STOP`, headings present, valid hashes). Technical qualification **never** grants `HUMAN_ACCEPTED` or `RELEASE_APPROVED`.

---

## 3. Shared Dromological & Safe Harbor Governance
Both estates run under the same **Dromological Gate** (`r2-dromological-gate.mjs`) enforcing:
`NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME`, non-fabricated five-clock accounting, distinct lifecycle stages (`SOURCE_STAGED` -> `AUTHENTICATED` -> `NONCE_CLAIMED` -> `REQUEST_DISPATCHED` -> `PROVIDER_RESPONSE_OBSERVED` -> `RAW_CAPTURE_VERIFIED` -> `EMPIRICALLY_QUALIFIED` -> `HUMAN_ACCEPTED` -> `RELEASE_APPROVED`), fail-closed `HELD` semantics, single-host `wx` nonce honesty (`crossHostReplayPreventionProved = false`), and strict `OPERAHOUSE ≠ OPERA ≠ PERFORMER` boundaries.

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Dual-Estate Preregistration Staged · Provider Calls ZERO · Human Review Reserved ⟐
