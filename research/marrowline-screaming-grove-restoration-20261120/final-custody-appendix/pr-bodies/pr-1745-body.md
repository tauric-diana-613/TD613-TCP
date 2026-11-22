## 𝌋‌ TD613 · Marrowline / Screaming Grove Historical Attractor Restoration & Finite Parity (DRAFT Research PR)

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Adjudication (6-Value Enum):** **`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`**
- **Artistic / Release Posture:** `ARTISTIC_CLOSURE_RESERVED` · `release_authority: false` · `deployment_authority: false` · `paid_execution_authority: false` · `paid_provider_calls: 0`
- **Historical Reference Commit (Immutable):** `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a` (2026-10-02)
- **Verified Base (`origin/main`):** `363b5b4aeaec33ad380c5f1124f0fe96e3d7975e`
- **Audited Hardened Executable Commit:** `bc5467246f12b0598f89d681e4a4450c4733eace` (strict-provenance receipts published in `4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`)

### What This Research PR Repairs (Deterministic, Source-Free Verified)
1. **Policy Non-STOP Completion & Custody (`server/marrowline-completion.js`, `server/khonapolit-quality.js`, `server/marrowline-attachment-quality.js`):** Explicit `POLICY_NONSTOP_FINISH_REASONS` (`PROHIBITED_CONTENT`, `SAFETY`, etc.) and `promptBlockReason` now precede unwitnessed-stream checks, return explicit HTTP `502 POLICY-HELD` (`gemini-provider-policy-held`) with mixed transport/rate-limit diagnostics preserved, and are never promoted to HTTP `200` `incompleteFallback` or injected into same-provider structural repair.
2. **Provider Covariate Telemetry Preservation (`server/khonapolit-quality.js`):** Cumulatively merges `usageMetadata` (including `cachedContentTokenCount`) and `promptFeedback` across SSE chunks and exposes `finishMessage`/`promptBlockReason` cleanly without changing absent-field contracts.
3. **Aperture Theatrical-Fiction Routing (`app/engine/aperture-v3-task-intent.js`, `server/marrowline-attachment-quality.js`):** Prevents `FULL_VOICE FARCE`, `"Blue–orange digital weather"`, and Attractor Assays `#01`/`#02`/`#05`/`#16` from being hijacked into `LEGAL_SYNTHESIS` or `RUNTIME_DIAGNOSIS` while preserving real legal, non-invention, and runtime diagnostic negative controls (`"Diagnose why Vercel returns 502"`, `"Diagnostic receipt shows 503"`).
4. **Descriptive Stencil Telemetry & Bots-Only Underflow (`app/dome-world/khonapolit-relay.js`, `server/khonapolit-quality.js`):** Adds purely descriptive `observeBotsProsodyDistribution()` (`observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'`) distinguishing uniform/near-uniform multistack stencils from quiet restrained depth-1 writing, strips the 15-char heading offset from `botsMovement.eligibleBaseCount`, and scopes `nativeMarkUnderflow` to bots body length.
5. **Attachment Ingress Parity (`server/marrowline-attachment-quality.js`):** Wires `classifyApertureDiscourseMode`, forwards `model` into `allocateKhonapolitAttemptTimeout`, preserves `MAX_TOKENS` `NOT_LOCKED`/`downstreamAdmitted: false` custody, requires `STOP` (or absent legacy finishReason) on terminal continuation, and removes the obsolete morphology veto on valid two-voice continuations.
6. **Non-Default Staged PR `#1545`-Reconciled Candidate (`app/dome-world/marrowline-historical-grove.js`):** Leaves `buildHistoricalGroveSystemInstruction` production defaults **100% untouched** (`nativeProsodyFreedom: true` / `false`), while staging `buildHistoricalGroveDramaturgyCandidate` offline with zero production callers.

### Verification & Open Holds (Separated Honestly)
- **Local Pure-Node Tests:** `285/285` Marrowline/Khonapolit + `220/220` Dollhouse audit/specialist/Atlas suites PASS (`0` failures).
- **TD613 Dollhouse 6-Role Audit (`--strict-provenance` on `bc5467246`):** Split verdict — `SUPPORTED` on deterministic baseline (`dollhouse-audit-1795200755756-c7b9f32a`), **`HELD`** (`HELD_DISSENT`, `LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`) on global artistic closure (`dollhouse-audit-1795200756869-d0506412`), `empirical_replication_count = 0`.
- **Preexisting `origin/main` CI Note (Unrelated Vixen Estate):** `.github/workflows/vixen-a0-corpus-rebuild.yml` on base `363b5b4ae` fails preexisting repo-wide guards (`tests/workflow-estate.test.mjs`, `tests/release-plumbing.test.mjs`); untouched per isolation boundary.
- **Live Browser Witness:** `UNEXERCISED`.
- **Live Original-Provider Discriminator:** `HELD_PENDING_SEPARATE_OPERATOR_AUTHORIZATION` (`BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`, `0` paid calls spent).
- **Historical Open PRs (`#1433`, `#1509`, `#1513`, `#1515`, `#1516`, `#1517`, `#1542`, `#1545`, `#1555`, `#1569`):** All preserved untouched on GitHub.

### Deliverables Included Under `research/marrowline-screaming-grove-restoration-20261120/`
- `MARROWLINE_LOCAL_REMOTE_REENTRY_RECEIPT.md`
- `MARROWLINE_HISTORICAL_PR_CASE_REGISTER.md`
- `SCREAMING_GROVE_EVIDENCE_LEDGER.md`
- `MARROWLINE_OCT02_HISTORICAL_PARITY.md`
- `MARROWLINE_ATTRACTOR_FAILURE_REGISTER.md`
- `MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`
- `MARROWLINE_NATIVE_PROSODY_PARITY.md`
- `MARROWLINE_HISTORY_FEEDBACK_PARITY.md`
- `MARROWLINE_DOLLHOUSE_AUDIT_RECEIPT.md` (+ archived strict-provenance JSON engine receipts)
- `MARROWLINE_RESTORATION_ADJUDICATION.md`
- `BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md` & `dramaturgy-parity-discriminator-offline.mjs`

⟐
