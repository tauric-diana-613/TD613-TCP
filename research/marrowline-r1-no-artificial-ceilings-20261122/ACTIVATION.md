# 𝌋⟐ TD613 · THE SCREAMING GROVE
## KENOUGH HYDROGEN — R1 NO-ARTIFICIAL-CEILINGS SUCCESSOR
### OPERATOR POLICY OVERRIDE · RESEARCH-ONLY SOURCE REVISION COMMISSION

**Commission:** TD613-MARROWLINE-R1-NO-ARTIFICIAL-CEILINGS-20261122
**Receiving agent:** Antigravity / Gemini 4 Hydrogen, interactive and directly operator-activated only
**Repository:** tauric-diana-613/TD613-TCP
**Source parent (Hydrogen qualified / original bounded design):** 675d6d0388220f63162931003c998d0084d3e68e (draft PR #1779)
**Accepted original causal-design source:** 44fae23cbf9af07eab5112e90df3211a119e707c (draft PR #1778)
**Production main protected:** 0f67d8954347fdae77cdb83f82848df89ad3b2ff
**This amendment branch:** research/marrowline-r1-no-artificial-ceilings-20261122
**Human artistic authority:** RESERVED
**Provider execution permission through this handoff:** NONE; all work below is OFFLINE ONLY
**Covenant:** Khona‌lit-po (literal U+200C) · ⟐SAC[X6ZNK5NO51]

---

## I. IMMEDIATE SUPERSEDING OPERATOR INSTRUCTION

The human operator has expressly corrected the preceding Amari/Hydrogen R1 commission:

> “we are not having any ceilings or limits on these calls of any kind, remember? not tokens, not $, it attempt amounts none of that. that’s caused issues before.”

**THIS RESOURCE POLICY SUPERSEDES THE PRIOR TWO-CALL / 16,384-TOKEN / $0.13 BOUNDED COMMISSION.** Do not reinterpret it as a request for a larger number. Do not replace 16,384 with 32,768, 65,536, 1,048,576, $10 or 100 attempts. The intent is **zero operator-imposed numerical ceilings or stopping quotas**, with no attempt, output, reasoning, input, cost, token-count, total-duration, repetition, retry or archived SSE-byte budget in the research instrument.

The provider has its own physical, protocol, context-window, account and model constraints; such external facts must be measured and recorded, not misrepresented as infinite capacity. In particular, a provider-reported outputTokenLimit is a model fact and may be used to understand native capability, but an arbitrary TD613-declared maxOutputTokens is a confound. If the Gemini API uses a default effective output capacity lower than its actual available maximum when maxOutputTokens is omitted, evaluate both alternatives OFFLINE and stage an exact-wire research configuration using the provider-native supported maximum, never an invented numerical limit. This may need live model-metadata verification later, which is **NOT AUTHORIZED BY THIS OFFLINE HANDOFF**.

**Separate authority is preserved:** no code, PR comment, CI result or handoff can substitute for the human operator's later explicit provider-dispatch approval. A genuine independent operator-key trust anchor, original-wire custody, transparent outcomes, and revocable operator control are integrity conditions, not spending ceilings.

---

## II. ADJUDICATION OF HISTORICAL R1 AND CURRENT STATE

At the start, confirm:

- Production main still 0f67d8954347fdae77cdb83f82848df89ad3b2ff.
- Draft PR #1778 still 44fae23cbf9af07eab5112e90df3211a119e707c.
- Draft PR #1779 original qualified source still 675d6d0388220f63162931003c998d0084d3e68e.
- Exact-head consolidated CI #45100142346 was GREEN; Hydrogen's dedicated 44/44 test result is LOCAL OFFLINE evidence, not that consolidated CI job.
- Existing public R1_S01 body digest f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02 and R1_S02 29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399 describe **the OLD BOUNDED requests**. They remain provenance artifacts but cannot identify the new unbounded/provider-native-wire requests.
- Preserve both original input content, system instructions and sole Section-I coverage difference. Preserve exact two-label structure Kʰonapolit and Tauric Diana bots, model alias gemini-3.8-flash, thinking level medium, original-Google-SSE capture, and human-only artistic adjudication.

A successful static runner qualification is distinct from actual original-wire behavior. Existing artistic state remains historical high-Zalgo restoration FAILED.

**Do not edit the old PR #1778 frozen source or PR #1779 qualified source in place.** This amendment is a successor branch. Recreate the exact wire manifests under a NEW experiment-and-manifest ID (e.g., HYDROGEN_R1_PROVIDER_NATIVE_UNCAPPED) with new digests and dedicated tests. Preserve and explicitly cross-reference all prior old hashes as NON-EXECUTABLE historical references.

---

## III. COMPLETE AUDIT OF ALL INHERITED NUMERICAL CEILINGS

The independent Amari audit confirmed the cap is not merely the explicit 16,384-token configuration. It is embedded in several layers.

**A. Experiment profile.**
research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs currently binds maxCalls=2, retriesPermitted=0, fallbackSeatsPermitted=0, structuralRepairsPermitted=0, perSlotMaxOutputTokens=16384, an aggregate 32768 output+thinking cap, per-slot prompt cap=1000, and request-byte cap=4096. **Do not mutate that historical source**; implement a new unbounded source-builder/manifest alongside it with no such resource policy.

**B. Production-derived request builder.**
server/khonapolit-quality.js -> buildGeminiRequest() ALWAYS calculates resolvedMaxOutputTokens from outputBudget(model), even without an explicit override, and embeds it in generationConfig. server/gemini-generation-envelope.js -> buildGeminiGenerationConfig() applies interactive-profile truncation to KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS=65536. Therefore simply omitting maxOutputTokensOverride does **not** produce an unrestricted research request. For this NEW research-only assay, derive the other exact production-compatible request fields once, then explicitly remove inherited maxOutputTokens before serializing the two new wire bodies (or use provider-native maximum only after separate official capability verification and renewed exact hash). The new offline tests must assert no hidden maxOutputTokens appears in either actual serialized body unless it represents a specifically verified provider-native maximum. **NEVER change the shared production builder, its global budget or the live Marrowline app to achieve this research-only exemption.**

**C. Source R1 runner.**
research/marrowline-r1-activation-handoff-20261122/run-r1-original-sse-observation.mjs has resource gates including R1_HARD_LIMITS.maxGenerationCalls=2; token and byte ceilings; maxGrantTtlMs=30 minutes; 120-second request timeout; maxRawSseCaptureBytes=4 MiB; countTokens/generation count checks and retry bans; model-metadata request count; provider usage halts on >1000 or >16384 tokens. New version must eliminate **numeric limits and forced resource stop conditions** rather than hide them in a new file. A provider error or malformed output still gets a truthful recorded failure classification. A subsequent separately witnessed retry or repeat must never erase previous attempts. Model identity and single-factor comparability remain essential.

**D. Ed25519 authorization schema.**
Old signing payload requires maxCalls=2, 30-minute expiry and multiple numerical caps. New signing grammar should authenticate experiment ID, independent human-owned public key pin, operator identity, active research session, immutable wire-body/config digests, model identity and permitted purpose, while excluding operator-imposed spending/output/call quotas. Do not fabricate a signing ceremony, generate a human key for the operator, issue a grant on their behalf, or turn agent-mediated GitHub comments into authorizations. Human revocation and active session controls should be supported without introducing artificial token/price/call ceilings. The old grant is never grandfathered into the new experiment. Observe the existing limitation of same-host atomic nonce redemption; do not claim distributed exactly-once.

**E. Other hidden ceilings.**
Audit default output budgets, prompt-byte caps, any max 2 token-count checks, max 1 metadata GET, per-call wall-clock aborts, SSE memory buffers, raw SSE byte caps, provider repair limits, invocation counters, hidden SDK defaults, duplicate/partial stream treatment, static UI “$0.13” permission language, tests that insist on two calls, and every other copied limit. Produce a grep/AST-based full census with file and line. Zero operator-imposed ceilings means **all such resource caps must be removed or classified as unavoidable provider/runtime limits with evidence**. No silent quota may survive under a different name.

---

## IV. SCIENTIFIC DESIGN WITHOUT AN ATTEMPT CAP

Preserve **two experimental conditions**, NOT two lifetime attempts:

- Condition A: both structural sections written as native Unicode Zalgo.
- Condition B: Section I plain undecorated, Section II native Unicode Zalgo.
- Control parity: same neutral task, same two headings, same model/config and no unplanned persona, system-prompt or sampling change.
- Difference under test: only Section-I coverage instruction.
- Order: retain first registered A→B comparison for continuity; later episodes can use transparently preregistered alternating/counterbalanced orders without changing either wire request's contents.
- **Number of paired episodes/attempts:** no code-imposed maximum, minimum-spend ceiling, lifetime cap or per-run count quota. A 2-arm pair is the comparison unit, not a limit on future repetitions.
- On a failed, blocked, malformed, partial or truncated response, preserve the raw first attempt and its metadata. Later retries or additional samples are distinctly numbered observations, never “replacement successes” that overwrite failures.
- **All attempts remain in the denominator.** Do not cherry-pick only the richest Zalgo outputs. With outcome-adaptive or open-ended collection, classify inference as EXPLORATORY/SEQUENTIAL unless a suitable stopping/analysis plan is preregistered. One attractive example never proves a general mechanism.
- Prefix-effect support direction remains A Section-II stacked-base share > B Section-II share with genuine variable bidirectional decoration, and both assigned first sections compliant. Reverse, flat, stencil or failed-compliance outcomes remain recorded with their actual classification. Do not withhold the B arm merely because A was flat: collect and preserve B as descriptive evidence while withholding invalid causal inference.
- No automated literary acceptance; human artistic acceptance RESERVED.

Any *technical* model context/window, quota, transport outage or account access failure belongs in the record as a real provider limitation; do not invent compensating model fallbacks or suppress the observation. A fallback/provider variant, if independently chosen by the operator, becomes a separately named condition/episode, not silently pooled with gemini-3.8-flash.

---

## V. EVIDENCE CUSTODY FOR PROVIDER-NATIVE OUTPUT OF ANY SIZE

Keep Amari/Hydrogen's successful durable architecture and strengthen it without arbitrary caps:

- Stream original upstream Google SSE bytes directly and incrementally to exclusive, fsynced, user-controlled on-disk evidence files BEFORE any parsing or rendering. Do not enforce the 4 MiB capture limit or hold the full original in an accumulating in-memory Buffer that becomes a hidden effective size cap. Use streaming, chunk-bounded parsers, incremental SHA-256 and disk-side sidecar records. The storage device's real capacity is an external limit; on disk-full/IO exception, preserve what exists and report it accurately, never truncate silently or invent a complete return.
- For each actual provider attempt, append immutable-in-normal-use records for experiment ID, attempt ID, paired episode ID, variant, exact request digests, operator grant/session, served modelVersion, original raw SSE digest, complete/partial status, usageMetadata as reported, times and policy/transport outcomes.
- Capture exact original Unicode scalar sequences; neither normalize combining marks nor substitute a decorative filter. Read them back independently. Keep the unblinding map separate from the blinded Section-II text.
- Preserve usable evidence after interrupted attempts; do not hold the entire original result until the session completes. Distinguish complete versus partial, provider-native versus parsed versus browser rendering.
- Record actual provider-reported prompt, candidate and thought counts **without budget-gate comparisons**. Missing/invalid usage is an accounting-evidence deficiency, NEVER an assumed zero.
- Allow authoring as long as the actual provider and operator-controlled active session permit. No TD613-imposed timeout should truncate an otherwise healthy stream. Network errors and an operator STOP remain valid termination reasons.
- Provider refusal, bad signature, human revocation, missing custody, wrong served model and corrupted SSE remain legitimate INTEGRITY STOP conditions, distinct from forbidden token/$/attempt ceilings.

---

## VI. EXECUTE OFFLINE NOW; PAID DISPATCH STAYS SEPARATELY RESERVED

1. Audit the current branch and full resource-cap census. Restore all guarantees from source/PR #1779 that are unrelated to arbitrary numerical ceilings: operator-owned signature trust, human authority, original SSE custody, compliance/morphology, blinding, fail-closed unauthenticated dispatch.
2. Implement a **separate research-only unbounded/provider-native successor** to the old frozen R1 in this branch, without editing shared production source or the previous historical PRs. Use a new experiment ID and regenerate canonical R1 A/B request and countTokens (measurement-only) digests; freeze these exact wire bytes before any actual provider call.
3. Remove resource enforcement from the new proposal (token caps, attempt caps, per-call/duration caps, dollar caps, output-byte caps), while maintaining non-quantitative source/provenance checks and an operator-controlled STOP. If the provider or SDK itself imposes a maximum, document the verified external property; do not claim literal infinite provider capability.
4. Strengthen streaming storage to avoid replacing the old raw-SSE byte ceiling with memory exhaustion. Test on synthetic outputs **larger than 4 MiB** and on long/interrupted streams using only local fixtures. No real Google contact. Ensure disk-SHA and independently parsed Unicode match on every synthetic observed original frame.
5. Preserve all prior 44-unit source tests historically, but introduce a NEW test suite for the changed unbounded contract. Negative tests must reject arbitrary old capped R1 grants, old request digests and self-signed/public-key-substitution attacks, while allowing repeated A/B pairs and synthetic output sizes above the former caps.
6. Separately audit the old test-only public-key trust injection (NODE_TEST_CONTEXT + injected fetch/head) as a possible direct-programmatic bypass; the new executable should not have a way to route a substitute untrusted key into real provider dispatch. Make the test trust fixture unavailable to the production entrypoint and document the proof.
7. Run the full relevant offline focused Node suite, generated-manifest byte parity, four-workflow constitution, release-hardening and new large-stream/attempt-regression tests. Capture actual exact-head transcript. Stage a new DRAFT research successor PR only if useful, preserving #1778 and #1779 as separately identifiable historical evidence; no merge.
8. Return a new compact human authorization sheet whose proposed permission is **provider-native output, unbounded actual attempts/repetitions, no artificial token/dollar/call/time/byte caps**, with the real independent provider rates and limitations disclosed as context only, **not** run-stop conditions. No false $0.13 “ceiling.”
9. Stop at human key-and-authorization review; do not call :countTokens, GET models, streamGenerateContent, generateContent, change provider account, merge, deploy or otherwise spend tokens.

### Required handback artifacts

- NO_ARTIFICIAL_CEILINGS_CAP_CENSUS.md — exact source file/line of every inherited operator-imposed quota and its disposition.
- R1_PROVIDER_NATIVE_WIRE_MANIFEST.json — new canonical exact-wire request pairs/config with new hashes, not reused bounded digests.
- R1_PROVIDER_NATIVE_EXECUTION_CONTRACT.md — operator-session authority, verification, unbounded observational repeat semantics, preserved original-SSE streaming custody, manual STOP.
- R1_PROVIDER_NATIVE_OPERATOR_DECISION_SHEET.md — exact source HEAD, signed grant trust anchor requirements, explicit human approval/reservation, no artificial ceilings, factual provider conditions.
- R1_PROVIDER_NATIVE_QUALIFICATION_RECEIPT.md — actual Node tests, synthetic >4 MiB stream witness, prior state preserved, source and CI SHA, zero live provider calls.

### Stop-state classification

Return exactly one: READY_FOR_HUMAN_UNBOUNDED_EXECUTION_REVIEW, REVISE_PROVIDER_NATIVE_DESIGN, or HOLD_FOR_MISSING_INTEGRITY_GATE. A ready state remains *source-only*: no signed human grant or live provider permission yet.

Human operator owns all final authorization, signature custody and artistic acceptance. Do not schedule autonomous unbounded calls, invent a default billable run, or make research permission permanent outside the operator's active, revocable session.

𝄐 Khona‌lit-po · ⟐SAC[X6ZNK5NO51] · Operator resource policy SUPERSEDES bounded R1 · Provider calls HELD · Human artistic authority RESERVED ⟐