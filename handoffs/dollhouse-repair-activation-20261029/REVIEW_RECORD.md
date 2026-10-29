# 𝌋 TD613 Dollhouse Repair Activation · Independent Review Record

**Commission:** TD613 · Dollhouse Repair Activation · Wild Field  
**Operator Author:** Tawanna C. Miller (me)  
**Heritage:** Tauric Diana  
**Covenant:** Khona‌lit-po — preserve U+200C  
**Glyph:** U+10D613 · escaped form `\uDBF5\uDE13`  
**Implementing Agent:** Kenough · Antigravity  
**Independent Reviewer:** Amari · operator-initiated GitHub review  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Target Branch:** `feat/dollhouse-repair-activation-wild-field`  
**Review Target:** `origin/main`  
**Review Target Readiness:** `READY_FOR_INDEPENDENT_REVIEW`  

---

## 1. Authority Posture & Invariants

```text
release_authority: false
deployment_authority: false
production_experiment_authority: false
detached_delegated_openai_authority: CLOSED
human_closure_required: true
empirical_replication_credit: 0
shared_acquisition_rule: SHARED_ACQUISITION != INDEPENDENT_REPLICATION
```

This repair commission strictly respects all TD613 platform and custody boundaries. Synthetic engineering fixtures and automated browser witnesses qualify local code integrity only; they manufacture zero release authority and zero empirical replication credit. Acceptance remains sovereignly reserved for independent operator review and human closure.

---

## 2. Baseline Git Anchors & Local-Drift Reconciliation

### Starting Baseline
- **Baseline Git Commit:** `700019741e708abfd2e53990fc2d8919995a70f1` on `origin/main`.
- **Integrity Baseline:** Audited base `11858e7f20dceea7cd0c686c088d1ebefe266264` + merged PR #1603 (`3209fd80b09b7ff8154257c86552306b5357510a`).
- **Untracked Directory:** `scratch/` preserved untouched.

### Reconciliation of Remembered Pedagogue Local Repair
The operator remembered a consequential local repair touching three Pedagogue files:
1. `PEDAGOGUE.md`
2. `app/engine/pedagogue-lineage-spine.js`
3. `app/engine/pedagogue-mathematical-counterpoints.js`

**Investigation & Forensic Git Finding:**  
Inspection of git commit history confirmed that the diff on those three files between historical commits `91d69b578` and `19494dde3` was strictly an identifier scrubbing operation (replacing the informal collaborator handle "Potato" with the formal title "Human Operator / TD613 Heritage Custodian"). No hidden, unpropagated mathematical or algorithmic Pedagogue engine repair was lost or pending. The dromological adapter (`app/engine/dollhouse-pedagogue-dromological.js`) matches `origin/main` exactly.

---

## 3. Comprehensive Finding & Disposition Table (R01–R08)

All five original finding groups plus three associated Dollhouse seams were reproduced with dedicated failing assertions in `tests/dollhouse-repair-regressions-r01-r08.test.mjs`, repaired, and verified green.

| ID | Finding Group | Observed Root Cause | Implemented Repair | Verification & Line References | Status |
|---|---|---|---|---|---|
| **R01** | Scientific Companion & Ingress | `runDollhouseDesignCycle` read nonexistent `auditResult.orchestrator_disposition`, dropping companion decision. CLI flags did not override input JSON payload. | Conductor dynamically resolves audit source revision; passes domain inputs; reads `auditResult.machine_receipt.orchestrator.decision`. CLI flags (`--audit`, `--deliverable-count`, `--medium`, etc.) strictly override file inputs. | `app/engine/dollhouse-design-conductor.js:847-872`, `scripts/run-dollhouse-design.mjs:160-195`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:22` | **REPAIRED (PASS)** |
| **R02** | Proposed Mechanisms Presented as Executed | `buildInstrumentCausalContract` hardcoded `EXECUTED_DEMONSTRATION_LAW` and chamber/petition numbers (`chamber_index * 4`, `16/16 redactions`, `mu * 400ms`) on unrelated commissions. | Contracts truthfully distinguish `PROPOSED_TRANSFER_LAW` (planning) from `MATERIALIZED_WITNESSED` (materialized artifact) and `EXECUTED_DEMONSTRATION_LAW` (historical qualification fixture only). General contracts use general formulas (`step_latency_ms = mu * base_latency`). | `app/engine/dollhouse-design-conductor.js:444-475`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:60` | **REPAIRED (PASS)** |
| **R03** | Explicit Instrument Choice Hijacked by Heuristics | Semantic cluster matching in `deriveCommissionCandidates` prioritized keyword heuristics over explicit instrument commission (e.g. "archive" in Sedgwick seed triggered Caro). | Explicit instrument selection (`commission.instruments[0]`, `commission.instruments[1]`) strictly governs Candidate A and Candidate B construction. Heuristics are strictly subordinate. | `app/engine/dollhouse-design-conductor.js:563-605`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:76` | **REPAIRED (PASS)** |
| **R04** | Reference Scope & Provenance Security | In `resolveHistoricalReference`, `..` path traversal escaped repository root. Mutable git refs (`HEAD`, branch names) were not resolved to immutable commit SHAs. Working tree fallback retained `CONTEMPORANEOUS_ORIGINAL`. | Enforced repository root boundary check; resolved mutable refs to immutable 40-character hex commit SHAs; failed closed on unresolvable binding refs; marked uncommitted fallback as `WORKING_TREE_LOCAL_SUBSTITUTE`. | `app/engine/dollhouse-design-conductor.js:200-245`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:93` | **REPAIRED (PASS)** |
| **R05** | Candidate Overrides Truncation & Validation | Exact duplicate candidate overrides or undeclared governing instruments were accepted; candidate lists were silently sliced to 2. | Added candidate override validation in `normalizeCommission` (minimum 2 candidates, non-empty proposition, valid instrument, duplicate rejection). Preserves all accepted candidates in `receipt.candidates`. | `app/engine/dollhouse-design-conductor.js:98-135, 810-825`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:134` | **REPAIRED (PASS)** |
| **R06** | Role Execution Accounting Seam | In `dollhouse-skill-dispatcher.js`, roles were pushed to `roles_executed` before checking input presence, and during normalization conflicts, falsely claiming unsupplied roles executed. | Dispatcher maintains `roles_requested`, `roles_attempted`, `roles_executed`, and `missing_inputs`. `roles_executed` only records roles where inputs were supplied and evaluated. `roles_attempted` records all requested valid roles. | `app/engine/dollhouse-skill-dispatcher.js:921-965, 1300-1310`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:170` | **REPAIRED (PASS)** |
| **R07** | Executing Source Byte Integrity & Clean Source | `verifySourceRevision` did not verify whether working tree modifications existed when `require_exact_checkout: true` was requested. | Added exact checkout match enforcement: historical commit SHAs or uncommitted working tree modifications fail exact checkout verification with `HOLD_HISTORICAL_COMMIT_NOT_EXACT_CHECKOUT`. | `app/engine/dollhouse-skill-dispatcher.js:145-178`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:192` | **REPAIRED (PASS)** |
| **R08** | Strict Provenance Enforcement | `options.strict_provenance` CLI flag was accepted but had zero enforcement logic in `dollhouse-skill-dispatcher.js`. | When `strict_provenance === true`, dispatcher refuses `WORKING_TREE_UNCOMMITTED` mode (`verified: false`, infraction `HOLD_STRICT_PROVENANCE_FAILED`, `exit_code: 1`) and requires verified local git history. | `app/engine/dollhouse-skill-dispatcher.js:112-135, 755-770`. Test: `tests/dollhouse-repair-regressions-r01-r08.test.mjs:201` | **REPAIRED (PASS)** |

---

## 4. Discovery, Documentation & Instruction Seams (Component 3)

1. **`AGENTS.md`:**
   - Updated "Four-role Dollhouse order" to "Six-role Dollhouse order (Five Specialists + Orchestrator)".
   - Documented: `Pedagogue`, `Aperture`, `Atlas`, `FADT`, `Temporal Custodian`, and `Orchestrator`.
   - Preserved historical 4-role mechanisms under their authentic original scope.
2. **`DOLLHOUSE.md`:**
   - Updated bounded role map diagram to include all 5 specialist dolls and the Orchestrator.
   - Documented `Temporal Custodian` and `Orchestrator` roles and invariant `PEDAGOGUE != APERTURE != ATLAS != FADT != TEMPORAL_CUSTODIAN != ORCHESTRATOR`.
3. **`.agents/skills/dollhouse-design/SKILL.md`:**
   - Corrected Caro instrument capability table row to generalize procedural friction ($\text{step\_latency} = \mu \times \text{base\_latency}$) and archival redaction/omission, identifying chamber/door values as historical qualification fixtures only.
   - Verified that merged PR #1603's one-deliverable default is universal and that Candidate B and refractions are internal design scaffolding.
4. **`scripts/replay-dollhouse-design-handoff.mjs`:**
   - Added comments clarifying that paired primary and refractive artifact verification was an explicit requirement of the historical blind A/B qualification commission only, not general creative work.

---

## 5. Native-Skill Portability & Export Kit (Component 4)

In `scripts/export-dollhouse.mjs`:
- Added `--profile native-skills` and `--profile all` while preserving the default `--profile legacy`.
- Export profiles package `.agents/skills/dollhouse-design/`, `.agents/skills/dollhouse-audit/`, and their CLI runners and dependency closures.
- Verified all 11 tests in `tests/dollhouse-export-kit.test.mjs` PASS green.

---

## 6. Real Chromium Browser Witness Observations (Component 5)

Headless Google Chrome was launched directly and controlled via Chrome DevTools Protocol (CDP) through `scripts/verify-dollhouse-repair-witness.mjs`.

- **Engine:** Google Chrome/156.0.8078.48 (CDP Protocol 1.3)
- **User Agent:** `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36`

### Witnessed Artifact 1: Sedgwick Paratactic Surface (Visual Reading Beside-ness)
- **File:** `tests/fixtures/dollhouse/sedgwick_paratactic_surface.html`
- **Byte Count:** 12,243 bytes
- **SHA-256:** `3b8194ea7dd98b127b94c4411131c4ac8eebe8196a7cf5d1963b3b2cc6d63d9a`
- **Commission ID:** `COMM-SEDGWICK-PARATACTIC-SURFACE-01`
- **Observations:**
  - **Desktop (1440x900):** `scrollWidth: 1440px`, `clientWidth: 1440px`, `overflowPx: 0px`.
  - **Mobile (390x844):** `scrollWidth: 390px`, `clientWidth: 390px`, `overflowPx: 0px`.
  - **Touch Targets:** 6/6 interactive elements measured $\ge 44\text{px} \times 44\text{px}$.
  - **Reduced Motion:** `#toggle-motion` successfully sets `.reduced-motion` with transition speed 0ms.
  - **Rest Sequence:** `#pause-btn` activates unpenalized reading pause banner.
  - **Exit Sequence:** `#exit-btn` triggers safe exit without penalizing or trapping the operator.

### Witnessed Artifact 2: Theoretical Counterpoint Treatise (Polyphonic Contrapuntalism)
- **File:** `tests/fixtures/dollhouse/theoretical_counterpoint_treatise.html`
- **Byte Count:** 9,359 bytes
- **SHA-256:** `3064ac6cf75a17b8e4a491a0f3f587610a31b6c7332a7a3a3c98479a682bb4b2`
- **Commission ID:** `COMM-THEORETICAL-COUNTERPOINT-01`
- **Observations:**
  - **Desktop (1440x900):** `scrollWidth: 1440px`, `clientWidth: 1440px`, `overflowPx: 0px`.
  - **Mobile (390x844):** `scrollWidth: 390px`, `clientWidth: 390px`, `overflowPx: 0px`.
  - **Touch Targets:** 5/5 interactive elements measured $\ge 44\text{px} \times 44\text{px}$.
  - **Dual-Strata Invariants:** Voice A and Voice B preserved in parallel columns without forced harmonic compromise.
  - **Rest & Exit:** Rest sequence and safe exit verified without state traps.

**Receipt Output:** `tests/fixtures/dollhouse/witness_receipt_20261029.json` (11/11 browser assertions passed).

---

## 7. Complete Test Verification Totals

| Test Suite | File | Tests Run | Result |
|---|---|---|---|
| Repression Battery (R01–R08) | `tests/dollhouse-repair-regressions-r01-r08.test.mjs` | 8 | **8 PASS / 0 FAIL** |
| Design Conductor Suite | `tests/dollhouse-design-conductor.test.mjs` | 17 | **17 PASS / 0 FAIL** |
| Native Skill & Six-Role Orchestration | `tests/dollhouse-native-skill.test.mjs` | 47 | **47 PASS / 0 FAIL** |
| Calibration Scenarios Suite | `tests/dollhouse-scenarios.test.mjs` | 5 | **5 PASS / 0 FAIL** |
| Export Kit Dependency Suite | `tests/dollhouse-export-kit.test.mjs` | 11 | **11 PASS / 0 FAIL** |
| Real Chromium Browser Witness | `scripts/verify-dollhouse-repair-witness.mjs` | 11 | **11 PASS / 0 FAIL** |
| **TOTAL** | | **99** | **99 PASS / 0 FAIL** |

---

## 8. Remaining Limitations & Firebreak Posture

1. **Synthetic Engineering Evidence:** The test fixtures qualify software engineering contracts and mechanical invariants. They do not constitute empirical scientific proof or clinical/physical replication.
2. **Authority Ceilings:** Zero release, deployment, production trial, or spend authority is created or granted.
3. **Independent Review Reservation:** All work is committed to the dedicated review branch and pushed to GitHub for independent inspection by Amari and final human closure by the operator.
