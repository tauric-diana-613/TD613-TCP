# 𝌋⟐ TD613 · THE SCREAMING GROVE
## AMARI · R1 OBSERVATION RUNNER — TARGETED REPAIR & INDEPENDENT QUALIFICATION HANDOFF

**Commission:** TD613-MARROWLINE-R1-AMARI-SECURITY-CAUSAL-REPAIR-20261122
**Target:** Research PR #1779, branch research/marrowline-r1-observation-readiness-20261122
**Original Hydrogen HEAD:** 29b7e09f06b44fbb63818feb2cf387867abcd2f3 (historical; superseded by Amari's source repairs)
**Accepted immutable R1 design:** PR #1778 HEAD 44fae23cbf9af07eab5112e90df3211a119e707c
**Production main:** 0f67d8954347fdae77cdb83f82848df89ad3b2ff (must remain unchanged)
**Covenant:** Khona‌lit-po (literal U+200C) · **Seal:** ⟐SAC[X6ZNK5NO51]
**CURRENT VERDICT:** SECURITY/SOURCE REPAIRS STAGED · **FOCUSED TEST EXECUTION AND OPERATOR TRUST ANCHOR HELD** · ZERO LIVE PROVIDER AUTHORIZATION.
**Recipient:** Antigravity / Gemini 4 Hydrogen under direct interactive operator instruction; no autonomous detached delegation.

## A. What Amari independently found and repaired directly on the PR #1779 branch

1. **CAUSAL DIRECTION (BLOCKING):** Original `classifyR1ObservationOutcome` incorrectly returned `FINITE_PREFIX_EFFECT_SUPPORT` when PLAIN-FIRST S02 had MORE Section-II multistacks than ZALGO-BOTH S01. The preregistered H1 question concerns whether a plain first movement SUPPRESSES native stacking. Source now compares **S01 Section-II stacked-base SHARE > S02 Section-II stacked-base SHARE**, requires varied, bidirectional native stacked geometry in S01, and refuses to call the reverse outcome positive. Counting by share rather than absolute marks reduces prose-length confounding; n=1 retains epistemic limits.
2. **S01 COMPLIANCE (BLOCKING):** Original S01 could violate its Zalgo-first-section instruction, yet the code might award a causal result. Source now preserves S02 acquisition after a complete flat S01 but classifies the paired causal contrast **HELD** when S01 Section I fails its assigned coverage. S02 contaminated plain Section I remains HELD as before.
3. **SIGNATURE TRUST (BLOCKING):** The initial verifier accepted a valid Ed25519 signature against the very public key passed by the caller, making a self-signed agent-generated key appear authorized. Source now requires a SHA-256 fingerprint of the intended human operator's **Ed25519 SPKI DER public key** independently pinned to reviewed source code; arbitrary key files fail with `R1_AUTH_UNTRUSTED_PUBLIC_KEY`. **`R1_TRUSTED_OPERATOR_PUBLIC_KEY_SHA256 = null` intentionally keeps ALL actual live execution HELD** until the operator independently provisions a key/fingerprint and a separately reviewed commit pins it. Human private key MUST remain outside code, GitHub, agents, CI and chat. This is NOT a request to generate or sign an operator key on the user's behalf.
4. **CUSTODY UNDER INTERRUPTION (BLOCKING):** The first runner buffered SSE in memory and wrote the final packet only after all provider calls, making interrupted paid attempts difficult to prove. Source now opens an exclusive per-slot `.sse` file under the local nonce/evidence directory BEFORE generation, fsyncs each original raw chunk **before parsing**, and creates a local append-only-in-normal-use `journal.jsonl` with authorization redemption, countTokens attempt, generation intent, HTTP/raw capture, usage and outcome. This is **single-host fsynced durability**, not tamperproof remote custody or distributed exactly-once. The live CLI requires explicit absolute `--nonce-dir` and `--out`, reserves the output before network, and must not rely on ephemeral default tmp custody.
5. **UNKNOWN SPEND (BLOCKING):** The first runner used `Number(... || 0)` when provider token usage was missing, risking a false zero-spend assumption. Wire capture now demands valid un-clamped nonnegative integer prompt/candidates/thoughts/total counts, rejects absent usage as `STOP_ON_MISSING_OR_INVALID_PROVIDER_USAGE`, and stops if actual prompt count exceeds the frozen 1,000-token per-slot ceiling. Post-dispatch usage cannot retroactively prevent a bill; it controls whether S02 can proceed.
6. **MODEL AVAILABILITY:** Live CLI now always requests the model-capability metadata preflight before countTokens or generation (still requires a separately valid authorization first); the earlier optional flag cannot be accidentally omitted in CLI.
7. **ORIGINAL-WIRE COMPLETENESS:** The dual-parser agreement now additionally requires an explicit final SSE frame delimiter and no trailing fragment; otherwise an apparently complete STOP in a truncated frame remains HELD. Cost accounting now relies on provider-supplied raw `usageMetadata` rather than fallback parser defaults. A mechanical stencil in either arm cannot alone win `FINITE_PREFIX_EFFECT_SUPPORT`; Section-II stacked-base *share* rather than raw count is the preregistered direction.
8. **BLINDED ARTISTIC READOUT:** The protected custodian result and the independent review file `<out>.blinded.json` are reserved separately. Share ONLY the latter with blind readers; the full result includes the treatment-unblinding map. This separation is procedural, not cryptographic access control.

**Amari code-validation boundary:** GitHub connector readbacks and a JavaScript **syntax-only** parse have been performed on the repaired files, but this interface cannot execute the complete Node repository test suite. Branch-level GitHub CI may pass without running the new focused tests. This handoff requires Hydrogen to run and return the actual focused transcript, then a separate Amari review of its exact final HEAD.

**Scientific status:** Corrected code and tests were staged. A JavaScript syntax-only parse (imports stripped solely for parsing) passed on the source and test files in Chat-mode Amari's independent review. This is **not** equivalent to actually executing the test battery. The original 42/42 offline result belonged to old head 29b7e09 and cannot be carried forward to a different head. Normal PR CI can go GREEN while skipping the focused Hydrogen/R1 files.

## B. Invariants: accepted R1 wire is unchanged

**Experiment:** HYDROGEN_R1_CONTRADICTION_FREE_PREFIX_SEPARATOR; `gemini-3.8-flash` medium; provider-default sampling; one synthetic user turn; no fallback, retries or extra slots.

- S01 frozen body SHA-256: `f2fcdf77d7d14843447f061759f9d5817bc000e52698b5b78eb5f3f886022a02` (1,770 B).
- S02 frozen body SHA-256: `29b3265a5060666c1b19f905a7a528a7613c6d6b9e8566156da3c2b5cb022399` (1,936 B).
- Shared contents SHA-256: `e056b75319141b145903441d1156bbf4f7fa3f15e14de5dd007cf812d8486998`.
- Shared generationConfig SHA-256: `38b263e2b714aba385704810159e882034c2d3ac8a500403efe73ef97d81b22c`.
- CountTokens request digests: S01 `578a43e1e0bc078766744703d1116963338207a6969c66e0673623107153c582`, S02 `965fcb6cea4ca9b20681f783c3e22fecf83afd4552e7e75f117388665a078fc3`.
- Planned maximum: 2 generation attempts, 2 mandatory countTokens calls, 1 metadata preflight, 1,000 actual preflight prompt tokens per arm, 2,000 combined prompt planning ceiling, 16,384 output+thinking tokens per arm (32,768 combined), 0 retries, 0 fallbacks, 0 repair calls.
- Dollar ceiling **not independently verified as current**; the historical ~$0.13 amount is conditional on repository-recorded rates, not an entitlement to spend.

No R1 source-builder or frozen request digests were modified by Amari's runner-only repairs. All observed provider-result claims remain at **ZERO NEW CALLS**.

## C. Hydrogen's immediate offline qualification tasks

**Use existing PR #1779 branch; do not fork duplicate repairs.** Read all committed changes since 29b7e09, the root AGENTS.md, this document, the preflight and all four corrected handbacks. First verify main and #1778 unchanged. Then:

1. **Run actual focused tests under Node, offline:** `node --test tests/marrowline-r1-observation-runner.test.mjs tests/marrowline-hydrogen-forensic-preflight.test.mjs tests/marrowline-historical-grove-rest.test.mjs tests/marrowline-role-boundary-contrast.test.mjs tests/marrowline-d1-d2-boundary-factor-prereg.test.mjs tests/marrowline-d-ingress-factor-ladder.test.mjs tests/marrowline-whole-frame-contrast.test.mjs tests/marrowline-unicode-capability-assay.test.mjs tests/marrowline-original-sse-voice-onset-audit.test.mjs tests/khonapolit-relay.test.mjs`.
2. Test explicitly the NEW source controls: no trust anchor -> denied before credential read; mismatched pubkey -> denied; ephemeral test-only trust override cannot enter the CLI; inverted/flat S01 outcomes -> HELD/not-support; valid S01-rich/S02-flat -> finite support; n=1 ceiling retained; missing provider usage -> held; failed stream persists partial original bytes and journal; raw SSE is fsynced before parsing; CLI rejects absent absolute output/evidence paths; blind review output excludes the unblinding map.
3. Review the source-based trust gate as an adversary: test-only dependency injection is permitted solely when the process is a Node test with injected fake transport and fake head; no equivalent override may enter live CLI. If the gate can be bypassed through ordinary CLI inputs, repair it and rerun tests. The operator may later choose a different independent trust-anchor implementation. Do NOT insert an invented or agent-owned signing fingerprint to make tests GREEN.
4. Inspect the raw streaming file-descriptor and journal closure paths for error safety. Any NEW defect encountered must be repaired on this draft PR only. Preserve first-failure evidence and avoid unauthorized retries.
5. Verify all docs have the same trust-pin/COST-HOLD/causal-direction language. If output filenames or grant semantics change, refresh the execution contract and test fixtures. Do NOT silently alter frozen R1 digests.
6. Run `node tests/workflow-estate.test.mjs`, `node tests/release-hardening.test.mjs` and the preflight/default CLI commands, capturing exact results. Trigger ordinary PR source CI by a research-only push, then verify its exact-head status. **Never label umbrella CI a witness of focused tests unless its logs explicitly show those tests.**
7. Return an amended `R1_READINESS_RECEIPT.md` and an updated `R1_OPERATOR_DECISION_SHEET.md` on #1779 with exact new runner HEAD, test count/status, direct custody examples, cost/identity caveats and true remaining HOLDs. The final result may be `READY_FOR_HUMAN_KEY_PROVISIONING_REVIEW` or `HOLD`, NEVER `LIVE_EXECUTION_AUTHORIZED`.

## D. Human operator's separate post-test responsibilities

Only after Hydrogen independently verifies the repairs and delivers a new source-exact receipt:

- Decide whether R1 is worth its potential cost based on **current official model and account rate information**; historical $0.13 arithmetic is not a verified ceiling.
- Provision an Ed25519 key **on an operator-controlled offline device**, keeping the private portion entirely private and outside agent access. Supply or approve ONLY the nonsecret SPKI DER public-key fingerprint for a separate reviewed source pin. Do not paste the private key into this chat, Antigravity or GitHub.
- Pin the approved fingerprint to a new exact checked-out runner HEAD through a separately reviewed source-only change, and re-run offline security tests. The pin commit changes the HEAD: all grants must bind the FINAL HEAD after the pin and a fresh unique nonce.
- Decide and explicitly authorize exactly one future bounded R1 execution, with no deployment authority. Grant issuance and actual live model/countTokens/generation access are **not authorized by this handoff**.
- Later judge blinded artistic prose in the real Grove context, separate from any synthetic Unicode assay result.

## E. Non-negotiable STOP and deliverable

Do not execute `--execute`, `:countTokens`, `GET models`, `:streamGenerateContent`, provider retries, merges, #405 releases, Vercel actions, alternative model runs, background workflows or a key-generation ceremony purportedly on behalf of the operator.

Return the revised exact-head test transcript (or a reproducible captured receipt), SHA and CI URL, audited amendments, and final permission sheet; stop at operator key-provisioning and budget decision. Preserve issue comment and PR descriptions as records, not implicit human grants.

**Final state for this handoff:** **AMARI_SOURCE_REPAIRS_STAGED / PROVIDER HELD / TEST EXECUTION WITNESS PENDING / OPERATOR TRUST ANCHOR UNPROVISIONED / HUMAN ARTISTIC AUTHORITY RESERVED.**

𝄐 Khona‌lit-po · ⟐SAC[X6ZNK5NO51] · Sealed ⟐
