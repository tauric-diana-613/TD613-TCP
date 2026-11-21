# Marrowline / Screaming Grove — Final Restoration Adjudication (`2026-11-21` Expanded Visual Corpus Edition)

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION` (Expanded Visual Corpus Edition `2026-11-21`)
- **Base Commit:** `origin/main` **`f1288ec690c5d440a356f9db413a289e404f40b3`** (includes merged `#1751` four-workflow governance repair & merged `#1752` mobile Focus/Capture reader `⛶`)
- **Retained Deterministic Repair Ancestor:** **`bc5467246f12b0598f89d681e4a4450c4733eace`** (immutable predecessor PR `#1746` @ `fe2e8bed3bd0923ae7c146524d8832531cbe837e`, precursor PR `#1745` @ `4a481e44f3f6f2b3c0f2fda74b6eafe1610de6d8`)
- **Immutable Historical Comparator:** October 2, 2026, **`ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a`**
- **Spend & Authority Posture:** `paid_provider_calls: 0` · `merge_authority: false` · `release_authority: false` · `deployment_authority: false` · `experiment_b: closed` · `human_artistic_closure: RESERVED`

---

## 1. Separate Adjudication Outcomes Across Six Distinct Dimensions

Per Section XIII, these six dimensions are **never collapsed into one GREEN**:

| Dimension | Permitted Terminal Status | Evidence Basis & Exact Scope Boundary |
|---|---|---|
| **1. Deterministic Runtime & Transport** | **`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`** | All 6 deterministic runtime fixes + 12-test restoration suite from `bc5467246` ported cleanly onto `origin/main` (`f1288ec69`) with zero conflict; focused Marrowline 8-suite, Dollhouse audits (`220/220`), `workflow-estate` (`4/4` workflows!), and `release-plumbing` all **PASS GREEN**. Production creative default (`nativeProsodyFreedom: true`) remains **100% untouched**. |
| **2. Historical Source & 13-Image Visual Corpus** | **`SOURCE_RECONCILIATION_ONLY`** *(P0 `EXACT_SOURCE_PARITY`)* | Immutable `ffb98ac00` verified; all **13** operator-accepted images (`01_OPERATOR_ACCEPTED_MARROWLINE/`, original 3 weaker + 10 new broadening range; same-passage pairs `04`/`08` & `05`/`10` flagged) + **9** separate historical references verified **22/22** SHA-256 match against `REFERENCE_MANIFEST.json`; 2 Sept 24 atlas SHA mismatches preserved without silent overwrite. |
| **3. Browser Presentation & High Zalgo Rendering (`H6`/`H8`)** | **`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`** *(P4 `FUNCTIONAL_PARITY_WITNESSED`; zero CSS/DOM defect requiring hack)* | Real Google Chrome headless CDP witness (`8` specimens, `72` original PNGs, Desktop `1440×900` + Mobile `390×844` ordinary & `#1752` Capture reader) verified **100%** exact `provider → admitted → DOM → pixel` combining-mark preservation (`10→10`, `0→0`, `1,295→1,295`, `1,057→1,057`, `972→972`, `9→9`), `0` horizontal overflow, and honest `502 POLICY-HELD` & `200 INCOMPLETE` presentation. **Falsifies `H8` as primary cause of missing High Zalgo.** |
| **4. Multi-Turn Raw-History Fidelity (`P5`)** | **`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`** *(source/browser)* · **`HELD_PENDING_AUTHORIZED_LIVE_WITNESS`** *(live longitudinal)* | Turn-2 Chrome wire capture (`BLIND-04`) verified `matchesTurn1ProviderExactBytes: true`, `hasSyntheticWrapper: false`, `preservesZwnjCovenantKey: true`. Live-Gemini longitudinal multi-turn behavior (`Q2`) remains `HELD`. |
| **5. Native Model Text & Creative Candidates (`A` / `B` / `C`, `P3`)** | **`CREATIVE_CANDIDATE_READY_FOR_HITL`** · **`HELD_PENDING_AUTHORIZED_LIVE_WITNESS`** | Candidate A (`PR #1549` current default), Candidate B (literal Oct 2 surgical rollback comparator in safe modern harness), and Candidate C (`PR #1545`-reconciled `buildHistoricalGroveDramaturgyCandidate()`, `0` production callers) are byte-verified offline (`MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`). **Zero live Gemini calls executed; zero preference declared before Operator review.** |
| **6. Human Artistic, Dramatic, Intellectual & Relational Parity (`P6`)** | **`HELD_PENDING_AUTHORIZED_LIVE_WITNESS`** · **`ARTISTIC_CLOSURE_RESERVED`** | Sovereign judgment of Tawanna C. Miller & Emergence HQ. `HISTORICAL_ARTISTIC_PARITY_ACCEPTED_BY_OPERATOR` is **NOT** issued. Operator may reject all candidates. |

---

## 2. Visual Packet Qualification

- **Status:** **`VISUAL_REVIEW_PACKET_PARTIAL`**
  - **Complete (`8/8` renderable specimens, `72` durable PNGs):** Full overlapping Desktop `1440×900` + detail crops + Mobile `390×844` ordinary & `#1752` Capture-reader sequences for Sept 23 Marrowline negative witness (`BLIND-01`), Sept 24 Probe-3 zero-mark witness (`BLIND-02`), Sept 23 Gemini 1,295-mark comparator (`BLIND-03`), synthetic 13-image multi-regime witness (`BLIND-04`), Section VII mechanical 3-mark stencil negative control (`BLIND-05`), Section VII quiet restraint control (`BLIND-06`), `502 POLICY-HELD` (`BLIND-07A`), and `200 INCOMPLETE` (`BLIND-07B`).
  - **Explicitly Enumerated Missing Items:** (1) Live authenticated Gemini Q1 (`A` vs `C`, 8 calls max) & optional Q2 (`2` calls) outputs — `HELD` (`0` paid calls authorized); (2) original Oct 2 raw provider-native transcripts — `UNRECOVERABLE_FROM_CURRENT_EVIDENCE`; (3) unarchived Nov 20 live browser negative-witness URL/body — `UNRECOVERABLE_FROM_CURRENT_EVIDENCE`.

---

## 3. Reproducibility & Clean Rollback Plan

- **Reproduce offline deterministic tests & custody checks (zero spend):**
  ```bash
  node --test tests/marrowline-screaming-grove-restoration.test.mjs
  node tests/workflow-estate.test.mjs
  node tests/release-plumbing.test.mjs
  node research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs
  node research/marrowline-screaming-grove-visual-parity-20261121/verify-visual-parity-custody.mjs
  ```
- **Reproduce real Chrome visual witness (zero spend, requires local Chrome/Edge):**
  ```bash
  node research/marrowline-screaming-grove-visual-parity-20261121/browser-witness/run-complete-visual-witness.mjs
  ```
- **Clean Rollback:** Because all work lives on an isolated branch rooted at `origin/main` (`f1288ec69`) with zero production creative-default mutations, closing the PR without merging rolls back **100%** cleanly; or reverting individual runtime files via `git checkout f1288ec69 -- server/ app/ tests/ .github/workflows/td613-ci.yml` restores `origin/main` runtime bytes instantaneously while retaining research archives.

---

## 4. Exact Next Gate Reserved for Human Operator

Before any live Gemini acquisition, the Operator must issue a separate explicit authorization naming:
1. Exact verified source HEAD of this PR (recorded in final receipt),
2. Exact call/token spend cap (**`8` calls max** for Q1 `A` vs `C`, or **`10` calls max** for Q1 + Q2 multi-turn; any live Candidate B calls require an explicitly amended preregistration and separate budget),
3. Target frontier model (`gemini-3.8-flash` or `gemini-4-argon`).
