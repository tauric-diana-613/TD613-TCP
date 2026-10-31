# TD613 Dollhouse Specialist Roles & Domain Engines

The TD613 Dollhouse architecture enforces jurisdictional independence between five specialist analytical disciplines and one coordinating Orchestrator.

---

## 1. Flow-Core Pedagogue (PEDAGOGUE)

- **Jurisdiction:** Consequence order, dromology, route burden, rest/exit availability, and research transfer.
- **Canonical House:** [`PEDAGOGUE.md`](../../../../PEDAGOGUE.md)
- **Primary Engines:**
  - [`dollhouse-pedagogue-dromological.js`](../../../../app/engine/dollhouse-pedagogue-dromological.js)
  - [`pedagogue-institutional-time.js`](../../../../app/engine/pedagogue-institutional-time.js)
  - [`pedagogue-lineage-second-pass.js`](../../../../app/engine/pedagogue-lineage-second-pass.js)
  - [`pedagogue-design-gate.js`](../../../../app/engine/pedagogue-design-gate.js)
- **Key Invariants:**
  - Canonical sequence: `NOTICE < ACT < WORLD_ANSWERS < NAME`.
  - Consequence before ontology: visible feedback must precede formal naming.
  - Institutional time preemption gap $\Pi(s) = t_{\mathrm{inst}} - t_{\mathrm{op}}$: acts must not precede counts.
  - Rest and exit must remain available without penalty.
- **Detected Infractions:**
  - `HUMAN_CONSEQUENCE_BROKEN_RETURN_PROMISE`
  - `PREMATURE_NAMING`
  - `ACTION_BEFORE_NOTICE`
  - `CADENCE_COMPRESSION`
  - `REST_WITHHELD`
  - `EXIT_WITHHELD`

---

## 2. TD613 Aperture (APERTURE)

- **Jurisdiction:** Observability, identifiability, inverse problem conditioning, singular value decomposition (SVD), noise covariance geometry, candidate-probe stability.
- **Canonical House:** [`APERTURE.md`](../../../../APERTURE.md)
- **Primary Engines:**
  - [`aperture-v32-typed-epistemic-deficit.js`](../../../../app/engine/aperture-v32-typed-epistemic-deficit.js)
  - [`dollhouse-witness-plan.js`](../../../../app/engine/dollhouse-witness-plan.js)
- **Key Invariants:**
  - SVD analysis via one-sided Jacobi decomposition (`computeMatrixSvd`).
  - Condition squaring detection in normal equations vs Jacobi stability.
  - Detection of candidate probes that lift algebraic rank but explode numerical condition number $\kappa(A)$ (Counterexample 1).
  - Noise covariance must be symmetric positive-definite; non-symmetric or non-positive-definite matrices reject fail-closed under `INVALID_NOISE_GEOMETRY`.
  - URL hash does not equal admitted DOM workspace.
- **Detected Infractions:**
  - `URL_HASH_DOES_NOT_EQUAL_WORKSPACE_ADMITTED`
  - `NUMERICAL_STABILITY_DEFICIT`
  - `INVALID_NOISE_GEOMETRY`
  - `DEFICIT_RANK_DEFICIENT`

---

## 3. Atlas Receiver-Relation Auditor (ATLAS)

- **Jurisdiction:** Receiver-relative control identity, concrete trajectories, holonomy history parity, content-versus-projection distinctions, bounded digest verification, serialization bridges, and 9-domain mathematical discovery engine.
- **Canonical House:** [`ATLAS.md`](../../../../ATLAS.md)
- **Mathematical Lineage:**
  - Atlas Wild Field Charter: [`docs/atlas/ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER.md`](../../../../docs/atlas/ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER.md)
  - Atlas External Crosswalk Y-01: [`docs/atlas/ATLAS_YOON_TIME_QUBIT_CROSSWALK_Y01.md`](../../../../docs/atlas/ATLAS_YOON_TIME_QUBIT_CROSSWALK_Y01.md)
- **Primary Engines:**
  - [`atlas-mathematical-engine.js`](../../../../app/engine/atlas-mathematical-engine.js) (Modular Reusable Mathematical Discovery Engine)
  - [`dollhouse-atlas-relational-custody.js`](../../../../app/engine/dollhouse-atlas-relational-custody.js)
  - [`dollhouse-atlas-fadt.js`](../../../../app/engine/dollhouse-atlas-fadt.js)
  - [`dollhouse-continuity-audit.js`](../../../../app/engine/dollhouse-continuity-audit.js)
- **Executable Mathematical Capabilities:**
  1. `A-01` (`TEMPORAL_FIBER`): Future-Response Separation. Demonstrates observational equivalence at $t=0$ while proving continuation distinguishability under non-symmetric flow.
  2. `A-02` (`HIGHER_ORDER_PARITY`): Distributed Historical Memory. Proves identical univariate ($p=0.5$) and pairwise marginals ($p=0.25$) while isolating 3-point parity holonomy invariant ($\pm 1$).
  3. `A-03` (`GHZ_LOCALITY`): Relational Continuity & Locality Bounds. Evaluates 2-qubit partial trace $\rho_{12} = \text{diag}(0.5, 0, 0, 0.5)$ (rank 2, $S=1.0$ bit, classical mixture, NOT maximally mixed on 2 qubits) vs 1-qubit reduction $\rho_1 = 0.5 I_2$ (maximally mixed on 1 qubit, $S=1.0$ bit). Global parity stabilizer $M = X_1 X_2 X_3$ distinguishes states. Single-qubit phase flip vulnerability $Z_1 |GHZ_+\rangle = |GHZ_-\rangle$, distance $d=1$; unearned QEC claims refused.
  4. `A-04` (`RANK_CONDITIONING`): Modular Field Rank vs Real Jacobi SVD Conditioning. Computes exact Gaussian elimination over $\mathbb{F}_{31}$ while strictly refusing real continuous SVD on finite fields (`FINITE_FIELD_SVD_REFUSED`). Computes dynamic iterative Jacobi SVD over $\mathbb{R}$.
  5. `A-05` (`LIOUVILLE_DAMPED`): Representation Causal Control & Dissipative Morphisms. Liouville divergence $\text{div}(F) = -\gamma/m < 0$ and $dE/dt \le 0$ contracts phase volume. Damped systems are dissipative and NOT symplectic. Refuses unqualified symplectic labels and rejects nominal buzzwords lacking dynamical morphisms.
  6. `A-06` (`STRUCTURAL_SIGNATURE`): Distinction Ecology & Structural Invariant Divergence. Identifies novel formal mathematical relations (commutators, rank defects, holonomy shifts) in neutral syntax without lexical trigger words.
  7. `A-07` (`QUANTUM_VISIBILITY`): Nuisance-Parameter Inverse Problems. Identifies parameter non-identifiability on the 1D visibility manifold $V(\eta, n) = \frac{\eta n}{1 + n}$ (degenerate $V=0.45$ for distinct $(\eta, n)$ pairs), refusing uncalibrated physical inference.
  8. `A-08` (`MEASUREMENT_CONTEXTS`): Transformation Separation. Strictly discriminates between environmental decoherence, classical coarse-graining, projective quantum intervention, and gauge redundancy.
  9. `A-09` (`NOTATION_NORMALIZATION`): Harmonic Oscillator Symbolic Equivalence. Normalizes genuine syntactic representations (LaTeX, Unicode, plain text, algebraic parameterization) while rejecting inverted-ratio and missing-radical false twins.
- **Key Invariants:**
  - Caller problems drive execution; unsupported domains return typed `NOT_EVALUATED` or `HELD` rather than silently running built-in fixtures.
  - Preserves 5 concrete relation classes without member custody collapse.
  - Holonomy history parity: identical endpoints with different winding routes are non-equivalent (`same endpoint does not erase route history`).
  - Strict injective serialization under `atlas-v1`: distinct preimages for numbers vs strings (`1` vs `"v1:n:1"`).
  - Cross-instrument bridge preserves legacy `dome-v0` string preimages and canonical `fnv32:` digests, while requiring `bridge_verified === true` for cross-instrument translation.
  - Fail-closed handling for property getters, circular structures, and NaN.
- **Detected Infractions:**
  - `PREDECESSOR_CHAIN_UNVERIFIED_CUSTODY_FORK`
  - `HOLD_HOLONOMY_HISTORY_PARITY_FAILED`
  - `HOLD_CONTENT_COLLISION_DETECTED`
  - `HOLD_INVALID_STRUCTURED_PAYLOAD_DOMAIN`
  - `HOLD_CROSS_INSTRUMENT_BRIDGE_FAILED`

---

## 4. Finite Admissibility Descent (FADT)

- **Jurisdiction:** Finite quotient fibers, irreducible gaps between union and intersection supports, coordinate recovery search, typed partition keys, bounded evaluation budgets.
- **Canonical House:** [`FADT.md`](../../../../FADT.md)
- **Primary Engines:**
  - [`dollhouse-fadt-reparative-assistance.js`](../../../../app/engine/dollhouse-fadt-reparative-assistance.js)
  - [`dollhouse-atlas-fadt.js`](../../../../app/engine/dollhouse-atlas-fadt.js)
- **Key Invariants:**
  - Preserves the irreducible gap when conditioning states are erased under stage projection.
  - Coordinate recovery search bounded strictly under 10,000 evaluations; candidates exceeding budget return `UNSUPPORTED_SEARCH_SIZE`.
  - Structural pair representation immune to delimiter injection attacks (`{x: "a|y=b", y: "c"}` vs `{x: "a", y: "b|y=c"}`).
  - Coordinate types strictly preserved (null, 0, false, "" distinct).
  - Rejection of unlawful action widening when support is absent.
- **Detected Infractions:**
  - `ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING`
  - `UNSUPPORTED_SEARCH_SIZE`
  - `TYPE_ERROR_UNSUPPORTED_COORDINATE_DATA`

---

## 5. TD613 Temporal Custodian (TEMPORAL_CUSTODIAN)

- **Jurisdiction:** Monotonic chronology, predecessor chains, attempt lineage preservation, historical epistemic non-retroactivity.
- **Canonical House:** [`DOLLHOUSE.md`](../../../../DOLLHOUSE.md)
- **Primary Engines:**
  - [`dollhouse-temporal-custodian.js`](../../../../app/engine/dollhouse-temporal-custodian.js)
- **Key Invariants:**
  - Sequences and calendar timestamps must strictly increase.
  - Phase evidence must refer to distinct ledger entries in planned order.
  - Predecessor citations are mandatory for retry attempts; unreferenced retries cause whole-route holds.
  - Non-retroactivity: later reconstructibility cannot rewrite what was observable at an earlier time.
- **Detected Infractions:**
  - `UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION`
  - `HOLD_CHRONOLOGY_BACKWARD`
  - `HOLD_DUPLICATE_HISTORICAL_IDENTITY`
  - `HOLD_PHASE_ORDER_VIOLATION`
  - `HOLD_INCOMPLETE_PHASES`

---

## 6. The Orchestrator (ORCHESTRATOR)

- **Jurisdiction:** Multi-role evidence adjudication, consensus aggregation, empirical replication accounting, claim boundaries.
- **Canonical Engine:** [`dollhouse-ablation-harness.js`](../../../../app/engine/dollhouse-ablation-harness.js)
- **Key Invariants:**
  - First-class operational adjudicator, NOT a sixth observational witness.
  - Evaluates active specialist findings strictly without inspecting withheld ground truth.
  - Preserves specialist vetoes: even four agreeable opinions cannot overrule one genuine domain infraction.
  - Shared acquisition on a single receipt adds ZERO empirical replication credit.
  - Decision codes:
    - `SUPPORTED`: All active specialist invariants verified.
    - `HELD`: Domain infraction detected by one or more active specialists.
    - `HELD_MISSING_OBSERVATION`: One or more active specialist senses lacked domain input.
    - `HELD_NO_ACTIVE_SPECIALISTS`: Orchestrator invoked without any specialist senses.
    - `HELD_DISSENT`: Disagreement between specialists where at least one held.
    - `UNANIMOUS_SUPPORT`: All five canonical specialists verified with zero holds.
    - `PARTIAL_ROLE_SUPPORT`: Subset of specialists verified without holds.
  - Strict non-authority: Orchestrator **never** has merge, release, or deployment authority. Human closure remains mandatory.
