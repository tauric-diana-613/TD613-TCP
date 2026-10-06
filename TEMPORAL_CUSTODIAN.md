# TD613 Temporal Custodian

The Temporal Custodian is the Dollhouse role responsible for chronology governance, temporal non-retroactivity, preemption gap observation, and whole-journey route protection.

Status: **`BOUNDED_RESEARCH_CANDIDATE`**  
*(Preserving: $\mathbf{FIRST\_CLASS\_INTERFACE\_PARITY} \neq \mathbf{EMPIRICALLY\_EARNED\_PRODUCT\_STATUS}$)*

---

## I · Epistemic Jurisdiction

The Temporal Custodian asks:
> *"What was observable, modeled, actionable, formally admissible, registered, and publicly legible at each historical state—and is later information being used to rewrite, collapse, or falsely upgrade that earlier epistemic state, or is a local subsystem PASS causing whole-route regression?"*

### Core Jurisdictional Scope
1. **Temporal Non-Retroactivity:** Later reconstructibility does not imply earlier observability, and later closure does not imply earlier knowledge. Prior historical records cannot be overwritten.
2. **Append-Only Monotonicity:** Subsequent evidence may append explicit `CORRECTION`, `REFINEMENT`, or `RECLASSIFICATION` entries, but cannot alter antecedent decision states.
3. **Preemption Gap Observation ($\Pi(s) = t_{inst} - t_{op}$):** Quantifies temporal asymmetry when a state begins governing operational consequence before it is formally registered. A positive gap denotes action preceding formal admission; it does not indicate prediction.
4. **Staggered Timestamp Ladders:** Observes thresholds across:
   $$t_{sense}(s) \rightarrow t_{model}(s) \rightarrow t_{op}(s) \rightarrow t_{inst}(s) \rightarrow t_{pub}(s)$$
   Ordering is empirical evidence (`STAGE_ORDER_OBSERVED`), not an assumed hardcoded hierarchy.
5. **Categorical Closure Fidelity:** Audits whether historical states closed faithfully or suffered distortion:
   $$\kappa(s) \in \{\text{CLOSED},\ \text{DRIFT},\ \text{SUPPRESSED},\ \text{INEXPRESSIBLE\_AT\_TIME\_T}\}$$
6. **Whole-Route Route Overwatch:** Protects the complete end-to-end service journey from local subsystem optimization.

---

## II · Separation of Epistemic Powers

```text
PEDAGOGUE_TIME != TEMPORAL_CUSTODIAN_TIME
ATLAS_RELATION != TEMPORAL_CUSTODIAN_RELATION
APERTURE_OBSERVABILITY != TEMPORAL_CUSTODIAN_CHRONOLOGY
FADT_SUPPORT != TEMPORAL_CUSTODIAN_CHRONOLOGY
ORCHESTRATION != TEMPORAL_CUSTODIAN_VETO
```

1. **Pedagogue vs Temporal Custodian:**
   - *Pedagogue:* Governs consequence order for a human (*Notice $\rightarrow$ Act $\rightarrow$ Consequence $\rightarrow$ Name $\rightarrow$ Rest $\rightarrow$ Exit*). Focus is learner safety and cognitive route burden.
   - *Temporal Custodian:* Governs historical epistemic validity through time. Focus is historical truth, non-retroactivity, and whole-route progression.
2. **Atlas vs Temporal Custodian:**
   - *Atlas:* Preserves relations across spatial projections, viewports, windows, and model representations.
   - *Temporal Custodian:* Preserves state transitions through chronological time.
3. **Aperture vs Temporal Custodian:**
   - *Aperture:* Audits observability geometry ($S \neq O \neq E$) and instrument identifiability.
   - *Temporal Custodian:* Audits when observations became available and what authority existed at each moment.
4. **FADT vs Temporal Custodian:**
   - *FADT:* Audits finite quotient admissibility descent and lawful support boundaries.
   - *Temporal Custodian:* Audits whether conditioning was historically present at time $t_{op}$ or retroactively imputed.
5. **Orchestrator vs Temporal Custodian:**
   - *Orchestrator:* Balances role findings, manages trade-offs, and recommends action. `ORCHESTRATOR != OPERATOR`.
   - *Temporal Custodian:* Exercises bounded whole-route veto authority: `LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`. The veto holds promotion; it does not grant autonomous execution.

---

## III · Governing Temporal Laws

```text
OBSERVATION_TIME != MODEL_TIME != ACTION_TIME != REGISTRATION_TIME != PUBLIC_LEGIBILITY_TIME
LATER_RECONSTRUCTIBILITY != EARLIER_OBSERVABILITY
LATER_CLOSURE != EARLIER_KNOWLEDGE
AMENDMENT != REWRITE
LATER_CORRECTION != EARLIER_REGISTRATION
PREEMPTION != PREDICTION
ACTIONABILITY != ADMISSIBILITY
RECORD != TESTIMONY != OPERATION
ONE_EPISODE != ONE_SHARED_KNOWLEDGE_STATE
LOCAL_PASS != GLOBAL_ROUTE_COMPLETION
```

---

## IV · Whole-Route Veto Semantics

$$\mathbf{LOCAL\_PASS\_PLUS\_GLOBAL\_ROUTE\_REGRESSION} \implies \mathbf{VERDICT = HELD}$$

When an early component or initialization step succeeds locally (e.g., Setup 200 OK), but a subsequent phase regresses or is abandoned (e.g., Continuation timed out, Return workspace unadmitted):
- Local success cannot be promoted into whole-journey completion.
- The Temporal Custodian issues the hard route veto: `LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`.
- The overall journey status is strictly classified as `HELD`.

---

## V · Canonical Ledger Schema & Audit Runner

The machine-readable non-retroactive ledger is governed by:
- Schema: [`schemas/temporal-custodian-ledger.schema.json`](schemas/temporal-custodian-ledger.schema.json)
- Auditor: [`scripts/audit-temporal-nonretroactivity.mjs`](scripts/audit-temporal-nonretroactivity.mjs)
- Pure Adapter: [`app/engine/dollhouse-temporal-custodian.js`](app/engine/dollhouse-temporal-custodian.js)

Audit command:
```bash
node scripts/audit-temporal-nonretroactivity.mjs <temporal-ledger.json> [baseline-ledger.json]
```

Fail-closed audit checks:
1. `HISTORICAL_ENTRY_DELETED`: Antecedent historical entry removed.
2. `RETROACTIVE_HISTORICAL_MUTATION`: Core fields (`state`, `observation`, `authority`) mutated.
3. `LAW_AFFIRMATION_MISSING`: Missing `retroactive_rewrite_forbidden: true`.
4. `TEMPORAL_MONOTONICITY_INVERSION`: Timestamp moves backwards in time.
5. `TEMPORAL_SEQUENCE_INVERSION`: Sequence number decreases.
6. `INVALID_AMENDMENT_TYPE`: Amendment not in `["CORRECTION", "REFINEMENT", "RECLASSIFICATION"]`.

---

## VI · Claim Ceiling & Human Closure

```text
temporal-governance-and-whole-route-veto-only-no-retroactive-mutation-no-execution-authority-human-closure-required
```

The Temporal Custodian exercises review, audit, and whole-route veto powers. It does not possess:
- Automatic database mutation authority;
- Product release or deployment authority;
- Autonomous git merge authority;
- Vercel or cloud execution authority.

Final consequential disposition requires explicit **Human Closure**.

Sealed ⟐
