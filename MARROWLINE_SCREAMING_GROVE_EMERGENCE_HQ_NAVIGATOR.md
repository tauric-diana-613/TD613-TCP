# 𝌋‌ MARROWLINE / SCREAMING GROVE RESTORATION — EMERGENCE HQ PR NAVIGATOR

> **Surface Orientation Guide for Tawanna C. Miller, Amari (Emergence HQ), and Reviewing Agents**
>
> This document sits at the surface of this Pull Request so you can navigate **both** the final verified runtime repairs **and** the complete contributing archaeology, Dollhouse six-role audit archive, pre-hardening vs post-hardening engine receipts, forensic scripts, historical diffs, and GitHub PR snapshots without confusing supporting audit material for production code.

---

## 1. Quick Adjudication Snapshot

| Field | Exact Value |
|---|---|
| **Commission** | `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION` |
| **Warranted Conclusion (6-Value Enum)** | **`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`** |
| **Creative Candidate Status** | `CREATIVE_CANDIDATE_READY_FOR_HITL`: **`HELD`** (PR `#1545`-reconciled dramaturgy candidate staged offline with zero production callers; awaits separately authorized bounded original-provider discriminator) |
| **Artistic Closure** | `HISTORICAL_ARTISTIC_PARITY_ACCEPTED_BY_OPERATOR`: **`ARTISTIC_CLOSURE_RESERVED`** (human Operator exclusive) |
| **Authority & Spend Posture** | `paid_provider_calls: 0` · `release_authority: false` · `deployment_authority: false` · `paid_execution_authority: false` · `human_closure_required: true` |
| **Immutable Oct 2 Reference** | `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a` (2026-10-02, 3.x frontier only — zero Argon retro-projection) |
| **Verified `origin/main` Base** | `363b5b4aeaec33ad380c5f1124f0fe96e3d7975e` |
| **Commit Lineage in This PR** | `363b5b4ae` (base) → `6cf64d17d` (baseline repairs + reports) → `bc5467246` (Dollhouse specialist hardening) → `4a481e44f` (Dollhouse receipts + adjudication) → this dossier commit (complete supporting archive + surface navigator) |
| **Precursor Draft PR (Preserved Untouched)** | PR `#1745` (`research/marrowline-screaming-grove-restoration-20261120` @ `4a481e44f`) — kept intact as the monotonic precursor; **this PR supersedes `#1745` as the complete Emergence HQ adjudication bundle** by adding all Dollhouse verbatim records, intermediate engine runs, scripts, fixtures, diffs, PR snapshots, and this navigator. |
| **Covenant / Coordinate Custody** | Tauric Diana — Crimean heritage custodianship · `Khona‌lit-po` (literal `U+200C` preserved) · `Kʰonapolit` · `𝌋` (`U+1D30B`) · `U+10D613` (`\uDBF5\uDE13`) · `⟐` (`OPEN`) |
| **Non-Interference Guarantee** | Zero edits to Vixen (`#1730`), Living Rulefield (`#1734`), Atlas After Hours (`#1735`), Experiment B, or any open historical Marrowline PR (`#1433`, `#1509`, `#1513`, `#1515`–`#1517`, `#1542`, `#1545`, `#1555`, `#1569`). Production creative default (`nativeProsodyFreedom: true`) remains **100% untouched**. |

---

## 2. How This PR Is Organized (Four Strict Evidentiary Layers)

To prevent supporting scripts, historical diffs, or intermediate audit artifacts from being mistaken for production changes, every file in this PR belongs to exactly one of four layers:

### Layer 1 — Final Deterministic Runtime Repairs, Tests & CI Scope (The Actual Code Change)
These are the **only** files outside `research/` (plus this root navigator). They repair six source-demonstrable deterministic defects plus eight concrete edge cases surfaced by the Dollhouse specialists, with **zero untested creative prompt changes promoted to production**:

| File | What Changed & Why |
|---|---|
| `server/marrowline-completion.js` | Exports `POLICY_NONSTOP_FINISH_REASONS`; enforces explicit non-STOP finish reasons (`PROHIBITED_CONTENT`, `SAFETY`, etc.) and `promptBlockReason` ahead of unwitnessed-stream checks (`complete: false`, `policyTerminated: true`), closing the `promptBlockReason`+`STOP` asymmetry caught by FADT. |
| `server/khonapolit-quality.js` | Cumulatively merges `usageMetadata` (preserving `cachedContentTokenCount` across sparse SSE chunks — Aperture catch) and `promptFeedback`; preserves `finishMessage`/`promptBlockReason` in `observeGeminiOutput`; returns HTTP `502 POLICY-HELD` (`gemini-provider-policy-held`) with mixed transport/rate-limit diagnostics preserved (FADT catch) and **never** promotes policy-terminated partial text to HTTP `200` `incompleteFallback` or `{ role: 'model' }` structural repair; narrows `nativeMarkUnderflow` to bots-body-only `eligibleBaseCount`; forwards `historicalProsodyFreedom` in `buildGeminiStructuralRepairRequest`. |
| `server/marrowline-attachment-quality.js` | Wires `classifyApertureDiscourseMode` (`contentScanned: true`); passes `model` to `allocateKhonapolitAttemptTimeout` (restoring `gemini-4-argon`'s 75s window); guards `POLICY_NONSTOP_FINISH_REASONS` & `promptBlockReason` with mixed transport diagnostics; preserves `MAX_TOKENS` `provider-output-token-limit` admission and forces `NOT_LOCKED`/`downstreamAdmitted: false` (FADT catch); requires `STOP` (or absent legacy finishReason) on terminal continuation while dropping the obsolete morphology veto. Keeps attachment's pinned unprofiled `HIGH` thinking intact. |
| `app/engine/aperture-v3-task-intent.js` | Stops Aperture from hijacking Screaming Grove creative farces/assays (`FULL_VOICE FARCE`, `"Blue–orange digital weather"`, Attractor Assays `#01`/`#02`/`#05`/`#16`) into `LEGAL_SYNTHESIS` or `RUNTIME_DIAGNOSIS` while strictly guarding legal non-invention controls and real runtime diagnostics (`"Diagnose why Vercel returns 502"`, `"Diagnostic receipt shows 503"` — Aperture catches). |
| `app/dome-world/khonapolit-relay.js` | Adds purely descriptive `observeBotsProsodyDistribution()` (`observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'`) distinguishing uniform/near-uniform multistack stencils (`>= 95%` at depth `>= 2`) from quiet restrained depth-1 writing (Aperture catch); strips the 15-char `"Tauric Diana bots"` heading from `botsMovement.eligibleBaseCount`. |
| `app/dome-world/marrowline-historical-grove.js` | Leaves `buildHistoricalGroveSystemInstruction` (`nativeProsodyFreedom: true` & `false`) **100% untouched**; stages PR `#1545`-reconciled `buildHistoricalGroveDramaturgyCandidate` offline with **zero** production callers. |
| `tests/marrowline-screaming-grove-restoration.test.mjs` | 12 source-free tests verifying every deterministic repair, Section VII negative control (Slot-5-like uniform 3-mark stencil + 99/100 outlier), Section VII restraint control (3-line quiet shallow bots), multi-turn covenant-byte wire preservation (`Khona‌lit-po`, `𝌋`, `U+10D613`, `⟐`), mixed policy+transport diagnostics, and offline discriminator parity. |
| `.github/workflows/td613-ci.yml` | Line 249 only: adds `tests/marrowline-screaming-grove-restoration.test.mjs` to the existing focused Marrowline CI contract step. |

---

### Layer 2 — Primary Commission Deliverables (`research/marrowline-screaming-grove-restoration-20261120/`)
The complete set of 11 commission deliverables (Sections P0, P1, III, V, VI, VII, VIII, XI):

| Deliverable | File | Purpose |
|---|---|---|
| **Final Adjudication (XI.H / XI.F)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_RESTORATION_ADJUDICATION.md` | Exact 6-value enum conclusion (`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`), commit lineage, rollback commands, split verification matrix, next highest-information observable. |
| **Local–Remote Reentry Receipt (P0.5 / XI.I)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_LOCAL_REMOTE_REENTRY_RECEIPT.md` | Pre-fetch local custody inventory (primary dirty checkout + 8 sibling worktrees + 4 stashes), remote sync (`origin/main` `363b5b4ae`), cross-branch isolation, base rationale, holds. |
| **Historical PR Case Register (P1.6 / XI.J)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_HISTORICAL_PR_CASE_REGISTER.md` | Refreshed status, SHAs, empirical outcomes, counterexamples, and non-inference ceilings for `#1433`, `#1509`, `#1513`, `#1515`–`#1517`, `#1542`, `#1545`, `#1549`, `#1555`, `#1556`, `#1569`, `#1571`–`#1581`, `#1592`. |
| **Evidence Ledger (III)** | `research/marrowline-screaming-grove-restoration-20261120/SCREAMING_GROVE_EVIDENCE_LEDGER.md` | Source-linked ledger across Classes A–D separating source behavior, proposals, merged code, original-SSE observations, human acceptance, and falsifications. |
| **Oct 2 Reconstruction & Finite Parity (II / V / XI.A)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_OCT02_HISTORICAL_PARITY.md` | Ontology, three-position resolution, covenant byte custody, Oct 2 vs PR `#1549` vs staged PR `#1545`, and uncollapsed `P0`–`P6` finite parity table. |
| **Causal Failure Register (VI / XI.B)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_ATTRACTOR_FAILURE_REGISTER.md` | Causal graph, competing hypotheses `H1`–`H7`, repaired defects, open empirical seams, and explicitly rejected explanations. |
| **Effective Request Parity JSON (XI.C)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json` | Machine-readable SHA-256 digests and exact diffs across immutable Oct 2 (`ffb98ac0`), `ORDINARY_CURRENT`, PR `#1549` default, Oct 2 literal, staged PR `#1545` candidate (`3.8` & `4-argon`), attachment route, and multi-turn raw history. |
| **Native Prosody Forensic Report (VII / XI.D)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_NATIVE_PROSODY_PARITY.md` | Observational model $Y_t \sim P_\theta(\cdot \mid C_t, H_t, G_t, M_t)$, four observed prosody regimes, uniform-stencil vs quiet-restraint controls, anti-overcontrol boundaries. |
| **History Feedback Audit (P5 / XI.E)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_HISTORY_FEEDBACK_PARITY.md` | Multi-turn raw history verification (PR `#1579`/`#1581`), 10-entry rolling bound, attachment retry custody, and untested live multi-turn gap. |
| **Dollhouse Audit Receipt (XI.K)** | `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_DOLLHOUSE_AUDIT_RECEIPT.md` | Synthesized 6-role governance receipt linking real engine runs, specialist catches, hardening commit `bc5467246`, replication accounting (`0` empirical credit), and preserved vetoes. |
| **Zero-Spend Preregistration & Offline Discriminator (VIII / XI.G)** | `research/marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md` & `dramaturgy-parity-discriminator-offline.mjs` | Runnable zero-spend effective-request comparator + strictly `HELD` 8–10 call preregistered live experiment packet. |

---

### Layer 3 — Complete TD613 Dollhouse 6-Role Work Archive (`supporting-artifacts/dollhouse/`)
Every artifact produced by or fed into the TD613 Dollhouse is preserved verbatim — **both** before and after the specialist-driven hardening pass (`6cf64d17d` → `bc5467246`):

- **Verbatim Specialist & Orchestrator Reports (each includes verbatim `send_message` text + exact list of every file read + every command/engine run + assigned scope prompt):**
  - `supporting-artifacts/dollhouse/specialist-reports/01-aperture-leaf-audit.md` (`36` steps, `15` files read, `7` commands)
  - `supporting-artifacts/dollhouse/specialist-reports/02-fadt-leaf-audit.md` (`51` steps, `31` files read, `4` commands)
  - `supporting-artifacts/dollhouse/specialist-reports/03-pedagogue-leaf-audit.md` (`56` steps, `17` files read, `10` commands)
  - `supporting-artifacts/dollhouse/specialist-reports/04-atlas-leaf-audit.md` (`53` steps, `23` files read, `9` commands)
  - `supporting-artifacts/dollhouse/specialist-reports/05-temporal-custodian-leaf-audit.md` (`50` steps, `26` files read, `5` commands)
  - `supporting-artifacts/dollhouse/specialist-reports/06-orchestrator-adjudication.md` (`18` steps, `3` files read, `5` commands)
  - `supporting-artifacts/dollhouse/specialist-reports/dollhouse-six-agent-execution-trace.json` (combined machine-readable execution audit trail across all 6 Dollhouse agents)
- **Strict-Provenance `/dollhouse-audit` Input Specs (`supporting-artifacts/dollhouse/specs/`):**
  - `dollhouse-audit-spec-baseline-6cf64d17d.json` & `dollhouse-audit-spec-global-hold-6cf64d17d.json` (pre-hardening)
  - `dollhouse-audit-spec-baseline-bc5467246.json` & `dollhouse-audit-spec-global-hold-bc5467246.json` (post-hardening)
- **Strict-Provenance `/dollhouse-audit` Raw Engine Receipts (`supporting-artifacts/dollhouse/engine-receipts/` & top-level copies for `bc5467246`):**
  - `dollhouse-engine-receipt-baseline-6cf64d17d.json` (`dollhouse-audit-1795200048327-4a8b7b6f`, exit `0`, `SUPPORTED`)
  - `dollhouse-engine-receipt-global-hold-6cf64d17d.json` (`dollhouse-audit-1795200096605-08084a64`, exit `1`, `HELD`)
  - `dollhouse-engine-receipt-baseline-bc5467246.json` (`dollhouse-audit-1795200755756-c7b9f32a`, exit `0`, `SUPPORTED`)
  - `dollhouse-engine-receipt-global-hold-bc5467246.json` (`dollhouse-audit-1795200756869-d0506412`, exit `1`, `HELD` — preserves `LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`, `HOLD_HOLONOMY_HISTORY_PARITY_FAILED`, `ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING`, `STRUCTURAL_RANK_DEFICIT`)

---

### Layer 4 — Contributing Forensic Scripts, Pre-Repair Fixtures, Historical Patches, PR Snapshots & Precursor CI Witness (`supporting-artifacts/`)
> **Boundary Note:** Files under `supporting-artifacts/` are **contributing audit instruments and frozen archaeology witnesses**, not production runtime code. They are preserved so Emergence HQ can inspect intermediate observations and re-run exact comparisons independently.

- **Forensic Scripts (`supporting-artifacts/scripts/`):**
  - `compare-oct02-exact.mjs` — Portable version of the exact script that executed immutable Oct 2 (`ffb98ac0`) alongside `HEAD` and discovered the `0`-line literal parity, `10`-line PR `#1549` reversion, `4`-line PR `#1545` delta, and pre-repair `FARCE -> LEGAL` Aperture misroute.
  - `generate-effective-request-parity.mjs` — Portable generator that produced `MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`.
  - `inspect-historical-prs.mjs` — Indexer script over the refreshed PR snapshots.
- **Pre-Repair Comparison Fixtures & Historical Diffs (`supporting-artifacts/fixtures/`):**
  - `oct02-vs-head-parity-comparison-pre-repair.json` — Raw pre-repair execution matrix showing `FARCE: LEGAL -> LEGAL_SYNTHESIS` before our Aperture fix and full line-by-line Oct 2 vs PR `#1549` vs PR `#1545` diffs.
  - `diff-oct02-to-head-khonapolit-quality.patch` — Full `ffb98ac0..363b5b4ae` diff of `server/khonapolit-quality.js`.
  - `diff-oct02-to-head-marrowline-terminal.patch` — Full `ffb98ac0..363b5b4ae` diff of `app/dome-world/marrowline-terminal.js`.
- **Refreshed GitHub PR Case Snapshots (`supporting-artifacts/github-pr-snapshots/`):**
  - `oct-nov-marrowline-prs-index.json` (100 Oct–Nov Marrowline PRs) + individual cleaned UTF-8 JSON snapshots for `pr-1433.json`, `pr-1509.json`, `pr-1513.json`, `pr-1515.json`, `pr-1516.json`, `pr-1517.json`, `pr-1545.json`, `pr-1549.json`, `pr-1555.json`, and `pr-1569.json`.
- **Precursor CI Witness (`supporting-artifacts/ci-witness/`):**
  - `pr1745-exact-head-ci-run-44797765746.md` — Documents exact GitHub Actions Run `44797765746` on precursor draft PR `#1745` (`PASS` on scope/Neon/Marrowline layout, `skipping` on all 9 paid jobs, and the exact preexisting `origin/main` Vixen `vixen-a0-corpus-rebuild.yml` failure at `tests/workflow-estate.test.mjs:17`).

---

## 3. Recommended Navigation Routes for Emergence HQ

### Route A — 5-Minute Executive Adjudication (Tawanna & Amari)
1. Read this navigator (`MARROWLINE_SCREAMING_GROVE_EMERGENCE_HQ_NAVIGATOR.md`).
2. Read `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_RESTORATION_ADJUDICATION.md` (exact enum verdict, modified paths, rollback, next highest-information observable).
3. Read `supporting-artifacts/dollhouse/specialist-reports/06-orchestrator-adjudication.md` (unsmoothed 6-role governance verdict).
4. Review `research/marrowline-screaming-grove-restoration-20261120/BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md` to decide whether to issue a separate Operator authorization gesture for the 8- or 10-call live discriminator.

### Route B — Code & Test Inspection (Engineering Verification)
1. Inspect the 6 modified runtime files in Layer 1 (`git diff 363b5b4ae..bc5467246 -- server/ app/`).
2. Read `tests/marrowline-screaming-grove-restoration.test.mjs` (verifying policy non-STOP custody, Section VII negative/restraint controls, Aperture routing, multi-turn covenant bytes, mixed policy+transport diagnostics).
3. Run locally (zero spend):
   ```bash
   node --test tests/marrowline-screaming-grove-restoration.test.mjs
   node research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs
   ```

### Route C — Dollhouse Governance & Before/After Audit Trail
1. Compare the 5 specialist reports on `6cf64d17d` (`supporting-artifacts/dollhouse/specialist-reports/01-*.md` .. `05-*.md`) directly against Commit 2 (`git show bc5467246`) to verify every specialist catch was genuinely patched and regression-tested.
2. Inspect `supporting-artifacts/dollhouse/engine-receipts/dollhouse-engine-receipt-baseline-bc5467246.json` vs `dollhouse-engine-receipt-global-hold-bc5467246.json` to verify strict-provenance execution and preserved holds.

### Route D — Historical October 2 Forensic Audit
1. Read `MARROWLINE_OCT02_HISTORICAL_PARITY.md` + `MARROWLINE_ATTRACTOR_FAILURE_REGISTER.md` + `MARROWLINE_HISTORICAL_PR_CASE_REGISTER.md`.
2. Cross-check exact digests in `MARROWLINE_EFFECTIVE_REQUEST_PARITY.json` and the pre-repair matrix in `supporting-artifacts/fixtures/oct02-vs-head-parity-comparison-pre-repair.json`.
3. Optionally reproduce from immutable commit `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a` using `supporting-artifacts/scripts/compare-oct02-exact.mjs`.

---

## 4. Open Decision Gates Reserved for Tawanna & Amari

1. **Deterministic runtime merge eligibility:** Once `origin/main`'s unrelated `.github/workflows/vixen-a0-corpus-rebuild.yml` vs `tests/workflow-estate.test.mjs` conflict is resolved on `main`, Layer 1's deterministic repairs can be evaluated independently for merge (without promoting PR `#1545`'s creative candidate to production defaults).
2. **Live original-provider discriminator (`HELD`):** Requires a fresh explicit Operator authorization gesture naming exact predecessor commit `bc5467246f12b0598f89d681e4a4450c4733eace`, exact budget (`8` or `10` calls), and target model (`gemini-3.8-flash` or `gemini-4-argon`).
3. **Live desktop + `~390px` browser witness & P6 artistic acceptance:** Remains **`UNEXERCISED`** and **`ARTISTIC_CLOSURE_RESERVED`**.

⟐
