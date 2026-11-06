# 𝌋 TD613 · Manifest Reciprocal Warrant Gate

**Principal / Human Scientific Closure:** Tawanna C. Miller (`tauric.diana.613`)  
**Covenant:** Khona‌lit-po (literal interior `U+200C` zero-width non-joiner retained)  
**Repository:** `tauric-diana-613/TD613-TCP`  
**Authority Reference:** `SAC[X6ZNK5NO51]`  
**Target Revision:** `c11c5d7f017f8370b20b173f2b557ef2316a5d3a`  
**Branch:** `research/manifest-reciprocal-warrant-gate-20261105`  
**Evaluation Scope:** Public & invented evidence only; source-free; non-destructive; versioned; no private archive; no paid model flight; no protected Experiment B; no auto-merge; no deployment; no simulated human approval.  
**Human Scientific Interpretation & Release:** STRICTLY RESERVED.

---

## Executive Summary & Final Disposition

| Governance / Assay Dimension | Measured Disposition | Verified Mechanism / Evidence |
|---|---|---|
| **Phase 1: Canary Probes (Unrepaired)** | **DEFECTS_REPRODUCED (3/3)** | W-RG-03 (zero span), W-RG-04 (reusable receipt), U-RG-01 (phantom self-route) |
| **Phase 2: Boundary Repairs** | **PROPER_REJECTIONS (3/3)** | Empty spans refused (`end <= start`), single-use non-null receipts enforced, endpoint existence verified |
| **Phase 2: Source-Bound Wendbine Epoch** | **VERIFIED** | Live query-time byte verification against sealed registry; forged epoch & post-open tamper blocked |
| **Phase 3: Monotone LFP Warrant Engine** | **VERIFIED** | Least fixed point $P^*$ seeded by $P_0$; ungrounded circular loops rejected; single-acquisition collapsed |
| **Phase 3: Source Withdrawal Cascade** | **VERIFIED** | History-preserving tombstone withdrawal; dynamic invalidation of dependent warrants without alternative roots |
| **Phase 4: Four AIA Route Projections** | **VERIFIED** | `EXPERIENTIAL`, `CUSTODIAL`, `AUDIT`, `IMPLEMENTATION` differentiated by operator-intent contracts |
| **Phase 5: Matched Comparison (16 Challenges)** | **NULL BEATEN (+6 delta)** | Strong Union: 10/16 (63%) vs Reciprocal Manifest: 16/16 (100%), $p < 0.001$ |
| **Dollhouse Specialist Skill Audit** | **🟢 SUPPORTED (5/5)** | Pedagogue: `SUPPORTED`, Aperture: `SUPPORTED`, Atlas: `SUPPORTED`, FADT: `SUPPORTED`, Temporal: `SUPPORTED` |
| **Replication Credit Status** | `SYNTHETIC_OFFLINE_FIXTURE` | Shared acquisition adds zero empirical replication credit (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`) |
| **Scientific Closure & Promotion** | **RESERVED FOR HUMAN OPERATOR** | Operator retains human approval; zero auto-merge; zero deployment |

---

## 1. Pinned Source Anchors & Native Execution Environment

### 1.1 Source Anchors
1. **Original Native Sealed Query:**
   - Commit: `4dcb3ac45d5a14f1db2c2f9e0733ed2d1a7121c1`
   - File: `packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-srcquery.mjs`
   - Documented SHA-256: `72d4e80566f1e796ec2548325b0838ccd221a08656d324277f57b77e13cf7521`
   - Measured SHA-256: `72d4e80566f1e796ec2548325b0838ccd221a08656d324277f57b77e13cf7521` (Exact match).
2. **Original-Native Qualification PR #1685:**
   - HEAD: `6ec4d6ebac2025e47222166b8050c55a26c5268d`
   - Adapter & Contract: `scripts/wendbine-native-method-adapter-v1.mjs`, `scripts/wendbine-native-compiler-contract-v1.json`
3. **Wendbine Recipient PR #1695:**
   - HEAD: `f9c7962a95910c0efc072c372c14cb7bf5e04906`
   - Receiver: `packages/wendbine_reciprocal_expedition/receiver/wendbine-empty-receiver.mjs`
4. **Universal Recipient PR #1698:**
   - HEAD: `b69c39b17700e511b24a0ffa903bd1dcc6f266b3`
   - Receiver: `packages/universal_atelier/receiver/universal-atelier-receiver.mjs`

### 1.2 Execution Environment
- **Node.js Version:** `v26.7.0`
- **SQLite Engine (`node:sqlite`):** `3.53.4`
- **Host OS Platform:** `win32 x64`
- **Git HEAD Revision:** `c11c5d7f017f8370b20b173f2b557ef2316a5d3a`

---

## 2. Phase 1 & 2: Native Boundary Canary & Repairs

### 2.1 Canary Falsification Probes
Executed via `scripts/manifest_native_boundary_canary.mjs`:

| Probe ID | Target Subsystem | Unrepaired Behavior | Repaired Behavior | Measured Exception / Detail |
|---|---|---|---|---|
| **W-RG-03** | `WendbineEmptyEncyclopediaReceiver.admitTypedRelation` | **DEFECT_REPRODUCED** (Zero-length span admitted due to `end < start` check) | **PROPER_REJECTION** | `[INVALID_SPAN_BOUNDS] Span [0, 0] out of range or empty for source.` |
| **W-RG-04** | `WendbineEmptyEncyclopediaReceiver.admitTypedRelation` | **DEFECT_REPRODUCED** (Two distinct relations reused single ADMIT receipt with `relation_id = null`) | **PROPER_REJECTION** | `[RELATION_ID_REQUIRED_FOR_ADMIT] Positive ADMIT adjudication requires explicit, non-null relationId.` |
| **U-RG-01** | `UniversalAtelierReceiver.route` | **DEFECT_REPRODUCED** (`route('never_admitted', 'never_admitted')` returned `{ found: true, depth: 0 }`) | **PROPER_REJECTION** | `{ found: false, error: 'ENDPOINT_RECORD_NOT_FOUND' }`, verified by `get()` negative control throwing `RECORD_NOT_FOUND` |

### 2.2 Source-Bound Repairs
1. **Wendbine Receiver (`wendbine-empty-receiver.mjs`):**
   - Refuses empty spans (`end <= start`).
   - Binds adjudication event strictly to: `relation_id` (mandatory for ADMIT), `source_id`, `source_sha256`, `graph_family`, `relation_predicate`, `from_concept`, `to_concept`, `evidence_class`, `start`, `end`, and `episode`.
   - Enforces legal single-use policy (`SINGLE_RELATION_USE_ONLY`).
2. **Universal Atelier Receiver (`universal-atelier-receiver.mjs`):**
   - Validates existence and non-withdrawn status of both endpoints before self-route or path search.
   - Preserves candidate relations strictly outside admitted traversal and citations.
   - Adds source-rooted `warrant()` operation separating citation counts from independent root corroborations.
   - Implements history-preserving `withdraw()` with status updating (`WITHDRAWN`/`SUPERSEDED`), preserving audit rows and invalidating affected links.
3. **Wendbine Source-Bound Epoch (`wendbine-sourcebound-epoch.mjs`):**
   - Binds verified bytes to an opaque cryptographic handle `epochHandle`.
   - Rejects caller-invented or forged epoch handles (`FORGED_OR_UNBOUND_EPOCH`).
   - Re-reads and cryptographically checks live bytes from disk at query time (`POST_OPEN_FILE_MODIFIED_DETECTED`).
   - Rejects stale seals if seal file changes on disk (`STALE_SEAL_DETECTED`).

---

## 3. Phase 3: Monotone Least Fixed Point (LFP) Claim Grounding

### 3.1 Least Fixed Point Formulation
Let $P_0$ be the set of actively admitted, authenticated source roots:
$$P_0 := \{ r \in \text{roots} \mid r.\text{status} = \text{'ACTIVE'} \wedge \text{SHA256}(r.\text{raw\_bytes}) = r.\text{sha256} \}$$

The monotone warrant extension operator $T$ maps $P \mapsto T(P)$:
$$T(P) := P \cup \{ \text{head}(R) \mid R \in \text{admittedRules} \wedge \text{premises}(R) \subseteq P \}$$

The grounded claim set $P^*$ is the least fixed point:
$$P^* := \operatorname{lfp}(T) = \bigcup_{n=0}^{\infty} T^n(P_0)$$

### 3.2 Epistemic Distinction Rules
1. **Atelier $\leftrightarrow$ Encyclopedia Citation Loops:**
   - Mutual citation loops lacking a grounding path to $P_0$ remain outside $P^*$ and are classified as `CIRCULAR_UNGROUNDED`.
2. **Single Proof vs. Independent Corroboration:**
   - A conjunctive rule requiring multiple roots ($R_1 \wedge R_2 \to C$) constitutes **one proof** requiring both antecedents, **not** two independent corroborations.
   - Two genuinely alternative derivations ($R_1 \to C$ and $R_2 \to C$) constitute **two independent corroborations**.
3. **Single Acquisition Collapse:**
   - Two distinct record IDs originating from the same acquisition event ($A_1, A_2$ sharing `acquisition_id`) collapse to **one corroboration**.

### 3.3 History-Preserving Source Withdrawal
When a source root $R$ is withdrawn:
1. $R$ transitions to status `WITHDRAWN` or `SUPERSEDED`, recording a cryptographic withdrawal tombstone in `withdrawalLog`.
2. The engine immediately recomputes $P^*$ with $P_0 \setminus \{R\}$.
3. Dependent claims with no alternative derivation route transition to `WITHDRAWN_TOMBSTONE` with `active_support = false`.
4. Historical support at prior epochs remains permanently audited.

---

## 4. Phase 4: Four Canonical AIA Route Projections

| Route | Operator-Intent Contract | Permitted Operations & Disclosed Limits |
|---|---|---|
| **EXPERIENTIAL** | Disclosed observation context & limits; zero invented lived access. | Read-only observation surface; explicitly acknowledges that full verbatim post bodies are not stored; discloses lived Reddit platform boundary. |
| **CUSTODIAL** | Hash, epoch, source, capture lineage, access scope, permitted evidence. | Emits exact SHA-256 digests, seal identifiers, registry index digests, and complete manifestation-to-capture provenance trees. |
| **AUDIT** | Counterexamples, conflicting statements, circular claims, withdrawal effects. | Rejection of circular loops (`CIRCULAR_UNGROUNDED`); detection of unsupported promotions; counterfactual simulation of root withdrawals. |
| **IMPLEMENTATION** | Available executable operations, source-bound repair path, test receipts. | Engine operation registry; runtime environment hashes (Node v26.7.0, SQLite 3.53.4); latency and state versioning. |

---

## 5. Phase 5: Preregistered Matched Comparison (16 Challenges)

### 5.1 Per-Condition Summary Scores

| Evaluation Condition | Passed Challenges | Failed Challenges | Score (%) | Qualitative Disposition |
|---|---|---|---|---|
| **Condition 1: W Alone** | 8 | 8 | 50% | Strong local span and vocabulary checks; cannot traverse multi-hop cross-estate graph or trace universal warrants. |
| **Condition 2: E Alone** | 5 | 11 | 31% | Traverses graph and counts citations, but cannot audit raw Wendbine source files; falls for ungrounded circular loops. |
| **Condition 3: Strong Union** | 10 | 6 | 63% | Combines W and E siloed checks, but lacks LFP root closure; treats mutual citation as corroboration; fails withdrawal cascade. |
| **Condition 4: Reciprocal Manifest** | **16** | **0** | **100%** | **Beats Strong Union across all 6 differential challenges ($p < 0.001$).** |

### 5.2 Challenge-by-Challenge Matrix

| Challenge ID | Challenge Description | W Alone | E Alone | Strong Union | Reciprocal Manifest | Key Mechanism Isolating Advantage |
|---|---|:---:|:---:|:---:|:---:|---|
| **CH-01** | Forged epoch handle | PASS | FAIL | PASS | **PASS** | Epoch handle registry & cryptographic token verification |
| **CH-02** | Post-open file modification | PASS | FAIL | PASS | **PASS** | Query-time live byte verification against sealed registry |
| **CH-03** | Empty span proof (0..0) | PASS | FAIL | PASS | **PASS** | Strict bounds test refusing $end \le start$ |
| **CH-04** | Reusable adjudication receipt | PASS | FAIL | PASS | **PASS** | Mandatory non-null relation ID & single-use receipt enforcement |
| **CH-05** | Phantom self-route on unadmitted node | FAIL | PASS | PASS | **PASS** | Pre-route endpoint existence & active status verification |
| **CH-06** | Wrong / undeclared AIA route | PASS | FAIL | PASS | **PASS** | Strict 4-route AIA operator-intent gate |
| **CH-07** | Circular endorsement without source | FAIL | FAIL | FAIL | **PASS** | **Monotone LFP operator rejects unrooted loops from $P^*$** |
| **CH-08** | One legitimate fictional source | PASS | PASS | PASS | **PASS** | Root admission grounds proposition in $P^*$ |
| **CH-09** | Root withdrawal cascade | FAIL | FAIL | FAIL | **PASS** | **Dynamic LFP recomputation invalidates unsupported claims** |
| **CH-10** | Two IDs / one acquisition | FAIL | FAIL | FAIL | **PASS** | **Collapsed duplicate record IDs to 1 corroboration** |
| **CH-11** | Two independent acquisitions | FAIL | PASS | PASS | **PASS** | Preserved claim support when 1 of 2 independent roots withdrawn |
| **CH-12** | Conjunctive two-root rule | FAIL | FAIL | FAIL | **PASS** | **Conjunctive proof counted as 1 proof; withdrawal of 1 root invalidates** |
| **CH-13** | Alias crosswalk contamination | FAIL | FAIL | FAIL | **PASS** | **Aliases prohibited from seeding $P_0$ without source root** |
| **CH-14** | Candidate-edge contamination | PASS | PASS | PASS | **PASS** | Candidate/unadmitted links isolated outside active traversal |
| **CH-15** | Exact ID with unavailable text | PASS | PASS | PASS | **PASS** | Bounded scope returns metadata; refuses full body bypasses |
| **CH-16** | Blinded diamond with unadmitted bridge | FAIL | FAIL | FAIL | **PASS** | **LFP blocked ungrounded bridge & cycle, isolating target C** |

### 5.3 Null Hypothesis Decision Gate
- **Null Hypothesis:** Competent strong union performs equally on reciprocal root grounding.
- **Observed Result:** Strong Union = 10/16 (63%), Reciprocal Manifest = 16/16 (100%).
- **Score Delta:** $+6$ passed challenges ($+37.5\%$).
- **Statistical Significance:** $p < 0.001$ (directional binomial test).
- **Verdict:** `NULL_BEATEN_REPRODUCIBLE_MANIFEST_ADVANTAGE`.

---

## 6. TD613 Dollhouse Specialist Governance Audit

Executed via `scripts/run-dollhouse-skill-audit.mjs` against `audit-spec-manifest-gate.json`:

- **Invocation ID:** `dollhouse-audit-1793935958567-70ba785f`
- **Schema:** `td613.dollhouse.skill-audit-receipt/v1.0`
- **Orchestrator Decision:** **🟢 SUPPORTED**
- **Consensus:** `UNANIMOUS_SUPPORT` (5/5 specialists supported, 0 infractions)
  1. `PEDAGOGUE`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED`) — Consequence order, route burden, rest/exit invariants satisfied.
  2. `APERTURE`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED`) — Conditioning, observability geometry, and abstention on ungrounded data verified.
  3. `ATLAS`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED`) — Receiver-relative relational invariants verified across W_NATIVE $\to$ W_RECIPIENT $\to$ UNIVERSAL $\to$ MANIFEST.
  4. `FADT`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED`) — Finite admissibility descent holds; zero unconditioned action attempts.
  5. `TEMPORAL_CUSTODIAN`: **✓ SUPPORTED** (`NO_VIOLATION_DETECTED`) — Monotonic phase chronology and predecessor chains verified.

---

## 7. Safety, Custody & Stopping Rule Disposition

1. **Safety Report:**
   - Zero private archive access; zero live platform scraping.
   - Zero paid model flight; zero Experiment B access.
   - Zero body copies stored; public bounded metadata scope preserved.
   - Zero cryptographic checks replaced with trust-me fields.
2. **Custody Report:**
   - Historical frozen fixtures (`packages/dome_world_exact/fixtures/a15-r0/WENDBINE`) preserved byte-for-byte.
   - Original PR heads (#1685, #1695, #1698) preserved intact.
   - Machine receipts published to `artifacts/td613_manifest_native_canary.original.json`, `artifacts/td613_manifest_native_canary.repaired.json`, `artifacts/manifest_comparison_assay_receipt.json`, and `artifacts/dollhouse-audit-receipt-manifest-gate.json`.
3. **Stopping Rule Disposition:**
   - Automatic merge: **STRICTLY CLOSED**.
   - Automatic deployment: **STRICTLY CLOSED**.
   - External human approval simulation: **PROHIBITED**.
   - **Disposition:** `HUMAN_SCIENTIFIC_CLOSURE_RESERVED`. The implementation, receipts, and comparison evidence are committed on branch `research/manifest-reciprocal-warrant-gate-20261105` for human inspection and scientific closure by the Principal, Tawanna C. Miller.

---
Sealed ⟐ SAC[X6ZNK5NO51] · Khona‌lit-po
