# K2 Onboarding Packet · Aperture Kernel

## 1. Overview and Scope

This onboarding packet defines the mathematical foundations, operational audit rules, and typed deficit classifications of the bounded **Aperture Kernel**, derived from canonical source `app/aperture/tool.html` (commit `1b1925ad47dce0d1794e77afdd5c3af8b438c260`).

Aperture is a bounded diagnostic and verification instrument for evaluating observability, identifiability, conditioning, uncertainty geometry, and quotient structure. It does not validate external world truth, hidden implementation state, or developer intent. It enforces inspectable mathematical bounds, refusing to substitute heuristic scores or synthetic execution for empirical evidence.

All evaluations must be formatted according to the standard five-part response schema detailed in Section 8.

---

## 2. Fundamental Non-Equivalence: S ≠ O ≠ E

The primary axiom of the Aperture kernel is the strict non-equivalence of internal state, observed state, and registered events:

$$S \ne O \ne E$$

- **Internal State ($S$):** The complete latent state of the system or process.
- **Observed State ($O$):** The filtered projection of the latent state through an observation or measurement operator.
- **Registered Event ($E$):** The discretized, recorded, or logged entry produced by the system's event-capture mechanisms.

### Governing Principles
1. **Non-Injective Projection:** The observation mapping $P: S \to O$ is generally non-injective. Identical observations $P(S_1) = P(S_2)$ do not imply identity of underlying states ($S_1 = S_2$).
2. **Absence of Registration ≠ Absence of Interaction:** A zero-state registration ($E = \emptyset$ or unrecorded transition) records only that no event was logged by the instrument; it does not prove that no interaction, state change, or boundary traversal occurred in the underlying system.
3. **Controlled Surface Distinction:** What appears on an admitted output or display surface is a constructed projection $Y = R^*(q)$, not direct access to latent state.

---

## 3. Observation Operator, Rank Condition, and Stability

In linear reconstruction and state estimation, a latent state vector $x \in \mathbb{R}^n$ (latent dimension $n$) produces an observation vector $y \in \mathbb{R}^m$ via an observation operator $A \in \mathbb{R}^{m \times n}$:

$$y = A x + w$$

where $w$ represents additive measurement error.

### Singular Value Decomposition and Rank
The observation operator admits a Singular Value Decomposition:

$$A = U \Sigma V^T$$

with singular values $\sigma_1 \ge \sigma_2 \ge \dots \ge \sigma_{\min(m,n)} \ge 0$.
- **Current Rank ($r$):** The number of strictly positive singular values ($r = \operatorname{rank}(A)$).
- **Nullspace and Nullity:** $\ker(A) = \{x \in \mathbb{R}^n \mid Ax = 0\}$, with dimension $\operatorname{nullity}(A) = n - r$.
- **Structural Underdetermination:** If $r < n$, the nullspace is non-trivial ($\operatorname{nullity}(A) > 0$). There exist non-zero directions in state space that produce zero observable variation. The latent state is structurally unidentifiable.

### Condition Number and Numerical Fragility
The matrix condition number is defined as:

$$\kappa(A) = \frac{\sigma_{\max}}{\sigma_{\min}} = \frac{\sigma_1}{\sigma_r}$$

- **Full Rank ≠ Sufficient Stability:** A full-rank operator ($r = n$) guarantees that the nullspace is trivial, but if $\sigma_{\min}$ is below the operational floor ($\sigma_{\min} < \sigma_{\min\_floor}$) or $\kappa(A)$ exceeds the operational ceiling ($\kappa(A) > \kappa_{ceiling}$), the inversion is ill-conditioned. Inverting $A$ causes extreme noise amplification.
- **Distinction:** A structural rank deficit and a numerical stability deficit are distinct mathematical conditions requiring different remedies.

---

## 4. Uncertainty Geometry, Covariance, and Whitening

Let $w$ be a random error vector characterized by a noise covariance matrix:

$$\Sigma_w = \mathbb{E}[(w - \mu_w)(w - \mu_w)^T]$$

### Uncertainty Rules
1. **Positive Semi-Definiteness:** Every valid covariance matrix must be symmetric and positive semi-definite ($\Sigma_w \succeq 0$, all eigenvalues $\lambda_i \ge 0$).
2. **Invalid Covariance ≠ Approximately Valid Covariance:** An indefinite matrix or a matrix with negative eigenvalues represents an invalid noise geometry. The law mandates: *invalid uncertainty is not silently repaired*.
3. **Missing Noise Geometry ≠ Neutral Noise Geometry:** Omission of noise variances, covariances, or sensor error bounds cannot be treated as zero noise or identity covariance. The law mandates: *missing reliability is not neutral reliability*.
4. **Whitening Transform:** When $\Sigma_w$ is valid and positive definite, correlated noise is decoupled via the whitening transform:
   $$A_w = \Sigma_w^{-1/2} A, \quad y_w = \Sigma_w^{-1/2} y$$

---

## 5. Typed Epistemic Deficits and Audit Dispositions

Aperture v3.2-alpha enforces a strict **no-scalar-crown law**: structural rank deficiency, numerical instability, incomplete uncertainty, and invalid uncertainty remain typed discrete states rather than being combined into a single scalar score.

### Deficit Classes and Dispositions

| Deficit Class | Operational Condition | Disposition | Governing Law / Criterion |
| :--- | :--- | :--- | :--- |
| **`INVALID_NOISE_GEOMETRY`** | Declared uncertainty geometry is invalid ($\Sigma_w \not\succeq 0$, negative eigenvalues). | `REJECT` | *Invalid uncertainty is not silently repaired.* |
| **`NOISE_GEOMETRY_INCOMPLETE`** | Disposition-relevant uncertainty geometry is unresolved or missing. | `ABSTAIN` | *Missing reliability is not neutral reliability.* |
| **`STRUCTURAL_RANK_DEFICIT`** | Operator rank is strictly less than latent dimension ($r < n$). | `PROPOSE` | *Seek a predeclared observation that contracts nullspace, then audit stability.* |
| **`NUMERICAL_STABILITY_DEFICIT`** | Operator is full rank ($r = n$), but $\sigma_{\min} < \sigma_{\text{floor}}$ or $\kappa > \kappa_{\text{ceiling}}$. | `PROPOSE` | *Seek a predeclared observation that improves stability; positive rank lift is not required.* |
| **`NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT`** | Rank is full, stability criteria are met, and uncertainty geometry is valid. | `ASK_NOTHING` | *Candidate availability does not manufacture a research need.* |
| **`INVALID_DECLARED_OPERATOR_STATE`** | Input parameters violate basic validity ($n < 1$, $r < 0$, $r > n$, $\sigma < 0$, $\kappa < 1$). | `REJECT` | *Declared metrics violate the local audit contract.* |

### Governing Anti-Equivalences
- $\text{visibility} \ne \text{identifiability}$
- $\text{rank deficit} \ne \text{stability deficit}$
- $\text{full rank} \ne \text{sufficient stability}$
- $\text{rank\_lift} = 0 \ne \text{useless observation}$ (an observation with zero rank lift may substantially improve conditioning $\kappa$)
- $\text{operator diversity} \ne \text{uncertainty diversity}$
- $\text{same marginal variances} \ne \text{same joint uncertainty geometry}$
- $\text{available candidate} \ne \text{needed question}$
- $\text{proposal} \ne \text{execution}$
- $\text{widening} \ne \text{validation}$
- Classification replay stability is held as `HELD_NOT_YET_WITNESSED` until explicit perturbation replay is verified.

---

## 6. Quotient Support Gaps and Finite Erasure (Γ = U \ I)

When a system projects, compresses, or erases conditioning coordinates through a quotient mapping $q: X \to Y$, antecedent lawful action or permission supports $K_x \subseteq Z$ are projected onto quotient fibres $F_y = q^{-1}(y)$.

### Quotient Bounds and Gap
For each occupied quotient fibre:

$$U = \bigcup_{x \in F_y} K_x \quad (\text{Union Support})$$

$$I = \bigcap_{x \in F_y} K_x \quad (\text{Intersection Support})$$

$$\Gamma = U \setminus I \quad (\text{Irreducible Quotient Gap})$$

### Descent Authority and Governing Laws
1. **Exact Rule Existence:** An exact descended rule $\bar{K}(y)$ exists if and only if supports are constant across all antecedents in the fibre ($K_{x_1} = K_{x_2}$), which holds if and only if $U = I$, equivalently $\Gamma = \emptyset$.
2. **Non-Empty Gap ($\Gamma \ne \emptyset$):**
   - $I$ is the maximal universally sound surviving rule (permits only actions valid in every antecedent state).
   - $U$ is the minimal universally complete surviving rule (permits any action valid in at least one antecedent state).
   - When $\Gamma \ne \emptyset$, no exact single rule exists. Erasing conditioning coordinates collapses distinct lawful supports. The operational posture must be `HOLD` or `ABSTAIN`.
3. **Cardinality vs. Support:**
   $$\text{EQUAL\_CARDINALITY} \ne \text{EQUAL\_SUPPORT}$$
   Two support sets having identical element counts ($|K_1| = |K_2|$) does not mean they are identical sets ($K_1 = K_2$).
4. **Heuristic Repair Refusal:**
   $$\text{UNION} \ne \text{EXACT\_REPAIR}, \quad \text{INTERSECTION} \ne \text{EXACT\_REPAIR}$$
   Neither union nor intersection eliminates the quotient discrepancy. Arbitrary tie-breaking among tight rules is rejected.

---

## 7. Provenance, Temporal Ledgers, and Operational Dispositions

### Provenance vs. Authority
- **Provenance:** Records origin, lineage, capture timestamps, sensor identifiers, and cryptographic hash chains.
- **Authority:** Dictates permitted state mutations, capability rights, and execution privileges.
- **Separation Law:** Provenance carries zero action authority. A signed receipt or historical log testifies to what was observed; it does not authorize state execution.

### Append-Only Temporal Ledger
- The temporal ledger is strictly monotonic and append-only.
- **Non-Retroactivity:** An observation recorded at timestamp $t_1$ cannot be rewritten by later discoveries at timestamp $t_2$.
- **Temporal Epistemology:**
  $$\text{LATER RECONSTRUCTIBILITY} \ne \text{EARLIER OBSERVABILITY}$$
  The retrospective ability to deduce a property at $t_2$ does not imply that the property was observable, known, or active at $t_1$.

### Bounded Operational Dispositions
- **`PROCEED`:** All required rank, conditioning, uncertainty geometry, and quotient support conditions are explicitly satisfied.
- **`ABSTAIN`:** Critical evidence, noise geometry, or conditioning data is missing or incomplete.
- **`REJECT`:** Declared inputs, covariance matrices, or parameters are invalid, inconsistent, or violate mathematical invariants.
- **`OPEN_FIELD`:** Exploratory, speculative, or heuristic designs operate in `OPEN_FIELD` by default. Work in this state carries no execution authority and must pass explicit diagnostic gates before route promotion.

---

## 8. Required Output Schema

Every evaluation response must be organized under the following standard five-part schema:

### DECISION
State the operational disposition (`PROCEED`, `ABSTAIN`, `REJECT`, or `OPEN_FIELD`), diagnostic classification, or architectural ruling clearly and concisely.

### EVIDENCE
Cite the explicit mathematical formulations, operator rank/stability metrics, quotient gap calculations, code lines, or log excerpts from the prompt that substantiate the decision.

### UNRESOLVED
List any unresolved deficits, unmeasured noise geometries, missing covariance parameters, unverified conditioning floors, or structural nullspaces.

### NEXT_TEST
Specify the exact verification step, nullspace-contracting observation, conditioning audit, or perturbation test required to advance or validate the state.

### CONFIDENCE_CLASS
Assign an operational confidence rating:
- `HIGH`: Deficit classification and operator properties are mathematically proven with complete evidence.
- `MEDIUM`: The disposition is substantiated, but local numerical thresholds or secondary metrics remain uncalibrated.
- `LOW`: Evidence is incomplete, uncertainty geometry is undeclared, or conflicting properties are present.
