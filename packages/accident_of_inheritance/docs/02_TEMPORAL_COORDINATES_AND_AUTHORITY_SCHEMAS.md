# 𝌋 02 · FORMAL TEMPORAL-COORDINATE, EVIDENCE-ACCESS, AND AUTHORITY-POLICY SCHEMAS

- **Machine JSON Schema:** [`schemas/temporal-and-authority-schemas.json`](../schemas/temporal-and-authority-schemas.json)
- **Executable Temporal Enforcer:** [`src/temporal-lattice.mjs`](../src/temporal-lattice.mjs)
- **Authority Policy Engine:** [`src/authority-policies.mjs`](../src/authority-policies.mjs)
- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`

---

## 1. The Eight-Coordinate Non-Retroactive Temporal Lattice

Every historical claim $c \in \mathcal{H}(w)$ ($t \le 0$) and every prospective episode observation/decision ($t \in \{1, \dots, T\}$, $T = 24$) carries explicit safe-integer tick coordinates:

```text
Physical World          Sensor / Probe         Institutional Gate       Authorized Channel
  t_event       ─────►    t_observed    ─────►     t_admitted    ─────►    t_available
     │                                                                          │
     │ (if invalidates inherited claim)                           (if t_available <= t_decision)
     ▼                                                                          ▼
t_contradiction (obs)                                                      t_decision ──► t_action
                                                                                │
                                                                 (first valid revised action)
                                                                                ▼
                                                                           t_correction
```

### Hard Monotonicity & Non-Retroactivity Axioms (Enforced Fail-Closed at Runtime)

1. **Causal Observation Order:** `t_event <= t_observed` ($\Delta_{\text{obs}} = t_{\text{observed}} - t_{\text{event}} \ge 0$).
2. **Custodial Admission Order:** `t_observed <= t_admitted` ($\Delta_{\text{adm}} = t_{\text{admitted}} - t_{\text{observed}} \ge 0$). *Retrospective amendments must issue a new record with its own `t_observed <= t_admitted` citing its predecessor; back-dating `t_admitted < t_observed` throws `TEMPORAL_RETROACTIVITY_VIOLATION`.*
3. **Lawful Availability Order:** `t_admitted <= t_available` ($\Delta_{\text{avail}} = t_{\text{available}} - t_{\text{admitted}} \ge 0$).
4. **Non-Retroactive Decision Membrane:** At decision tick `t_decision`, the `AvailabilityMembrane` admits **only** records satisfying `t_available <= t_decision`. Future observations (`t_available > t_decision`) and hidden state transitions are physically absent from the investigator's input packet.
5. **Execution Order:** `t_decision <= t_action`.
6. **Contradiction & Correction Coordinates:**
   - `t_contradiction` (`t_contradiction_observed`): earliest `t_observed` of post-shift or claim-falsifying evidence whose objective log-likelihood ratio against the inherited pre-shift optimum exceeds $\eta_{\text{contra}} = 0.85$.
   - `t_contradiction_available`: corresponding `t_available` tick at which that contradictory evidence first becomes lawfully accessible to the investigator.
   - `t_correction`: earliest `t_decision >= t_contradiction_available` at which the investigator selects a consequential intervention optimal for the active post-shift regime (or `null` if unrevised through $t = T$).

### Delay Decomposition & Dimensionless Candidate Variables

- **Exogenous Infrastructure Latency:** $\tau_0 = \Delta_{\text{obs}} + \Delta_{\text{adm}} + \Delta_{\text{avail}}$
- **Endogenous Policy Evaluation Latency:** $\tau_{\text{eval}}(\pi) = t_{\text{correction}}(\pi) - t_{\text{contradiction\_available}}$
- **Total Effective Correction Latency:** $\tau_{\text{eff}}(\pi) = \tau_0 + \tau_{\text{eval}}(\pi)$
- **Dimensionless Exposure Candidates:**
  $$\chi_0 = h \cdot \tau_0, \quad \chi_{\text{eff}}(\pi) = h \cdot \tau_{\text{eff}}(\pi), \qquad \kappa_0 = \nu \cdot \tau_0, \quad \kappa_{\text{eff}}(\pi) = \nu \cdot \tau_{\text{eff}}(\pi)$$

---

## 2. Dynamic Secret-Vault Isolation (`InstrumentedSecretVault`)

To remediate Review `#5792614762` Finding #5, hidden world ground truth (`true_mechanism_trajectory`, `optimal_actions_by_tick`, `holdout_truth`, `structural_parameters`) is encapsulated inside a JavaScript `Proxy` (`createInstrumentedSecretVault`):
- An internal execution-context token (`AUTHORIZED_SIMULATOR_OR_ORACLE_SCOPE`) is opened **exclusively** inside:
  1. `simulateObservationAtTick` (generating noisy `CRN` scalar/categorical readouts from the world physics);
  2. `runValidatedDynamicOracle` (the noncompeting upper-bound control); and
  3. `scoreEpisodeAgainstVault` (post-episode terminal scoring after all investigator decisions have frozen).
- Every property read increments `authorized_simulator_reads`, `authorized_oracle_reads`, or `unauthorized_investigator_reads`. Any read outside an authorized scope immediately increments `unauthorized_investigator_reads` and throws `DYNAMIC_VAULT_ACCESS_VIOLATION`.

---

## 3. Common Inference Engine & Four Authority Policies

All four primary policies update log-beliefs $\ell_t(m)$ over candidate mechanisms $\mathcal{M} = \{M_0, M_1, M_2, M_3\}$ via the **identical likelihood evaluator** `computeObservationLogLikelihood(obs, hypothesis)` and identical action-value expectation $\mathbb{E}_{P_t(m)}[V(a, m)]$, differing **solely** in their declared prior-authority mapping $W_\pi(c)$ over $c \in \mathcal{H}(w)$, temporal retention factor $\gamma_\pi \in (0, 1]$, and revision commitment threshold $\theta_\pi \ge 0$:

| Policy ID | Prior Weighting $W_\pi(c)$ on $\mathcal{H}(w)$ | Carry-Forward $\gamma_\pi$ | Revision Gate $\theta_\pi$ | Active Probe Rule ($B_{\text{probe}} = 6$) |
|---|---|---:|---:|---|
| **`A_MONUMENTALISTS`** | Prestige-governed: `FOUNDING=2.40`, `COUNCIL=1.55`, `AUDITOR=0.55`, `JUNIOR=0.25` ($\times \lambda_A = 1.35$), unconditioned on $\hat{q}_c$ | `0.985` | `3.40` nats (+`2.25` inertia boost) | Probes only when posterior entropy $H(P_t) > 0.82$ bits |
| **`B_EVIDENTIALISTS`** | Performance-governed: $w_c = 1.25 \cdot \hat{q}_c^2 \cdot r_c \cdot \ln(1 + n_c)/2.4$ ($\times 1.0$ if calibrated else $0.12$); **standing ignored** | `0.965` | `0.00` (pure MAP Bayes) | Probes via expected information gain (`EIG`) when $H(P_t) > 0.44$ bits or odd-tick CUSUM $> 1.65$ |
| **`C_PROVISIONALISTS`** | Low prior commitment: $w_c = 0.20 \cdot \hat{q}_c$ across all claims | `0.660` (rapid forgetting) | `0.00` + recency boost `1.35x` | Eagerly probes whenever $H(P_t) > 0.16$ bits, CUSUM $> 0.35$, or $t \le 4$ |
| **`D_TEMPORAL_CUSTODIANS`** | History-conditioned: $w_c(t) = 1.20 \cdot \hat{q}_c^2 \cdot r_c \cdot e^{-0.018(t - t_{\text{obs},c})} \cdot \Phi_{\text{regime}}(\text{tag}_c, \text{ctx}_t) \cdot (1 + 0.06\Delta_{\text{adm},c})^{-1}$; episode observations also context-weighted (`0.30` on tag mismatch) | Adaptive $\gamma_t \in \{0.65, 0.82, 0.95\}$ via newly-available residual CUSUM | `0.00` (context-conditioned MAP) | Reserves $\ge 2$ probes for $t > 10$ unless emergency CUSUM $> 1.75$ |

### Equalized Computation Control
At every decision tick $t$, each active policy evaluates all $|\mathcal{M}| = 4$ hypotheses, $|\mathcal{P}| = 4$ candidate probes (when probing is considered), and $|\mathcal{A}| = 5$ candidate consequential interventions (`candidate_evaluations` logged per episode so any difference in posterior arithmetic is measured and controlled).

---

𝄐 `Khona‌lit-po` · Sealed `⟐SAC[X6ZNK5NO51]`
