# 𝌋⟐ TD613 · DOLLHOUSE SPECIALIST AUDIT LEDGER
## MARROWLINE R2 POST-ACQUISITION RECOVERY (`a48d2556e` -> `research/marrowline-r2-post-acq-recovery-20261123`)

- **Commission:** `TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123`
- **Orchestrator:** Gemini 4 Neon Orchestrator (adjudicating 3 invoked TD613 Dollhouse specialist agents)
- **Predecessor Evidence:** Commit `a48d2556ed946e01d4925dee93c463c73712d590` (PR `#1783`), Pilot Session `r2_r2u_036ef18ebc2e`
- **Governance Invariant:** Agreement between Dollhouse specialists is a bounded audit finding; zero execution, merge, release, or deployment authority is conferred.

---

## 1. Flow-Core Pedagogue Audit (`dollhouse-pedagogue`)
- **Engine Receipt:** `dollhouse-audit-1795438937052-2946f7d6` (`scripts/run-dollhouse-skill-audit.mjs -r PEDAGOGUE --no-orchestrator`)
- **Verdict:** **`HELD`**
- **Detected Infractions:** `HUMAN_CONSEQUENCE_BROKEN_RETURN_PROMISE`, `ACTS_BEFORE_COUNTS`, `CADENCE_VIOLATION` (`PREMATURE_NAMING`, `CADENCE_COMPRESSION`, `REST_WITHHELD`, `EXIT_WITHHELD`, `CONTEXT_REGISTRATION_LAG`; `Π = 1635s`, `closure_class=suppressed`).
- **Key Prescriptions & Implemented Repairs:**
  1. *Safe PS 5.1 credential entry:* Replaced `Read-Host -AsSecureString` paste trap (`\x16` 1-char bug) with `R2-CredentialInput.psm1` (`Read-R2MaskedSecretInteractive` handling `Ctrl+V`/`Shift+Insert`, `-ApiKeyFromClipboard`, `-ApiKeyFile`, and pre-dispatch `NOW / WHY / EXACT` length & control-byte checks without echoing secrets or accepting CLI secrets).
  2. *Live observability & non-blocking exit:* Added append-only `${sessionStem}-progress.log` + `r2-stream-observability.mjs` 5s heartbeats + Win32 `Disable-R2ConsoleQuickEdit` guard so clicking inside Windows PowerShell 5.1 no longer freezes `stderr` for 27 minutes.
  3. *Candidate exploratory prompt grammar:* Omitted named anti-patterns (`"depth 1"`, `"cloned depth 3"`) and numeric mark quotas; anchored `R2_U_EXP_V2_CHOREOGRAPHED_HIGH_ZALGO` and `R2_U_EXP_V2_FOUR_MOVEMENT_ARC` in plain prose rest, clean inter-word spaces/punctuation, selective full-height vertical High-Zalgo eruptions (never Baby Zalgo), and recovery, strictly versioned separately from frozen R2-U/R2-W manifests.

---

## 2. Temporal Custodian Audit (`dollhouse-temporal-custodian`)
- **Engine Receipt:** `dollhouse-audit-1795438996544-61b8c701` (`scripts/run-dollhouse-skill-audit.mjs -r TEMPORAL_CUSTODIAN --no-orchestrator`)
- **Verdict:** **`HELD`** (`temporal_audit: FAIL`; `journey_chronology: HELD`, `veto_authority: LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`)
- **Detected Infractions:** `TEMPORAL_MONOTONICITY_INVERSION`, `UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION`.
- **Key Prescriptions & Implemented Repairs:**
  1. *Predecessor citation & non-retroactivity:* Preserved all 13 files of `20261123T112913Z_9ab03e85` and its `HELD` receipt bit-for-bit untouched; documented `a48d2556e` and `r2_r2u_036ef18ebc2e` explicitly across all new modules, dossiers, and manifests; kept exploratory diagnostics out of frozen `r2-unicode-evaluator.mjs` v2.
  2. *Causal clock sampling repair (`r2-live-core.mjs`):* Moved `custodyClockMs`/`custodyWallMs` sampling strictly **after** `R2_SESSION_CLOSING_FOR_GATE_VERIFICATION` journal persistence, passed `classificationClockMs: null` into `verifyPhysicalR2CustodyAndEvaluateGate` so classification never carries a pre-classification timestamp, sampled `postGateClassificationClockMs`/`postGateClassificationWallMs` strictly **after** Gate evaluation returns, and added explicit `CLOCK_CHRONOLOGY_INVERSION` check in `r2-custody-gate-verifier.mjs`.
  3. *Post-attempt revocation lifecycle & testing:* Kept `revocationWatcher` and `revocationPollTimer` active until session closure (`R2_SESSION_CLOSED`) with `postAttemptRevocationObserved` / `revocationObservedAt` / `revocationObservedPhase` telemetry, and added regression tests for both post-attempt revocation and backward-clock rejection.

---

## 3. Aperture Observability & Geometry Audit (`dollhouse-aperture`)
- **Engine Check:** `run-dollhouse-skill-audit.mjs -r APERTURE` confirmed `STRUCTURAL_RANK_DEFICIT` (`DEFICIT_RANK_DEFICIENT`, rank `2/6`) for frozen v2 + coarse timing (`NO_INFORMATIVE_RANK_LIFT` for unnormalized scalars; `no_scalar_crown: true`).
- **Key Prescriptions & Implemented Repairs:**
  1. *Orthogonal stream watchdog (`r2-stream-observability.mjs`):* Added monotonic `hrtime` metrics (`timeToFirstByteMs`, `streamActiveSpanMs`, `dtFrameMaxMs`, `postFinishEofWaitMs`, per-frame candidate/thinking token deltas, `inactivityWarnings`, optional `inactivityAbortMs`, and bounded `postFinishEofTimeoutMs`) plus `monitorEventLoopDelay` p99 and `notifyDurationMs` tracking in `r2-live-core.mjs` — cleanly separating active server generation, transport silence, missing post-finish EOF, and local I/O stalls with **zero output-token ceilings**.
  2. *Truthful Gate hold-reason attribution (`r2-custody-gate-verifier.mjs`):* Passed actual dual-parser agreement (`parserAgreement: true` when both parsers agreed and files verified) alongside `claimsEmpiricalQualification: true` so `MAX_TOKENS`, HTTP `503`, and revocation sessions still strictly hold (`MISSING_UPSTREAM_WITNESS_FOR_EMPIRICAL_QUALIFICATION`, `EMPIRICALLY_QUALIFIED: false`) **without** fabricating spurious `DUAL_PARSER_DISAGREEMENT`.
  3. *Additive exploratory morphology (`r2-exploratory-morphology.mjs`):* Single raw-UTF-8 scalar pass fixing v2's double-counted `marksOnWhitespaceCount` (`9,950` -> true `4,975`), measuring lag autocorrelation $R(k)$ ($k \in [1..64]$, exposing `GUIDED_RULES`'s `80.63%` lag-17 tape loop), scale-invariant dispersion (`CV = 0.0191`, `trimmedMean10 = 2.44`), runaway spike geometry (`maxToMedianRatio = 21,137.67`, `top1MarkShare = 98.72%`, `Gini = 0.9879`), base-class decoration ratios, intra-cluster duplication (`43.43%` / `98.65%`), and sectional progression, while reserving artistic merit strictly as `UNIDENTIFIABLE_AUTOMATICALLY_RESERVED_HUMAN_ONLY`.

𝌋 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Multi-Specialist Governance Ledger Complete ⟐
