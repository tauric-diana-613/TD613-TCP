# 𝌋 00 · INHERITED PALACE ACT I ERRATA & INDEPENDENT REVIEW AUDIT

**Separately Versioned Read-Only Reproducer & Errata for Draft PR #1699 (`fb47927c3c7cd5264a3cf9900e90e24868e5c0bb`)**

- **Principal:** Tawanna C. Miller · **Operator:** `tauric.diana.613` · **Covenant:** `Khona‌lit-po` · **Authorization:** `SAC[X6ZNK5NO51]`
- **Inherited Artifact:** Draft PR `#1699` (`research/palace-of-unborn-futures-argon-20261105`, HEAD `fb47927c3c7cd5264a3cf9900e90e24868e5c0bb`)
- **Independent Review Inspected:** Review `#5792614762` (`https://github.com/tauric-diana-613/TD613-TCP/pull/1699#pullrequestreview-5792614762`)
- **Executable Read-Only Reproducer:** [`scripts/run-act1-errata-reproducer.mjs`](../scripts/run-act1-errata-reproducer.mjs)
- **Machine Errata Receipt:** [`receipts/act1-errata-reproducer-receipt.json`](../receipts/act1-errata-reproducer-receipt.json)

---

## 1. Custodial Non-Substitution Law

Per Section IX of the Act II Commission, **zero files** inside `packages/palace_of_unborn_futures/` have been modified (`git diff fb47927c3... -- packages/palace_of_unborn_futures` is strictly empty). The original `confirmatory-96-receipt.json` (`SHA-256: 69f90a6c859f7e688d6bf85c741403e57dfe22802f2f87f8c32cc9f0653c3073`) and all eight pre-holdout locked artifacts from Commit `24b57b1b2d0b69ccaf94bdcea9c4a8e7ef73247c` remain byte-for-byte intact.

Running `scripts/run-act1-errata-reproducer.mjs` regenerates `PILOT_48` and `CONFIRMATORY_96` strictly in memory and reproduces the exact frozen episode tables (`B_TIGHT_96B` digest `1a6c5eb8a6ffdc18b19abed4ba7f093bb9cd69482d1df4def6eda4c1bdf13402`; `B_STANDARD_256B` digest `9c2bf8552a69af9b0607a03de31cd72a7305c27c0c9fbacd7cb8054fbf9dcd67`) before computing the eight review corrections below.

---

## 2. Exact Reproduction & Resolution of the Eight Review `#5792614762` Findings

### Finding 1 — Benchmark Suboptimality in Family C & Censored Signed Regret
- **Defect Identified:** In `packages/palace_of_unborn_futures/src/world-generator.mjs` (line 537), `ARCH_C1_TRUE_DELAYED_LAG` assigned `PROBE_PRECURSOR_SEQUENCE` (`0.25 * amp`, shared with `ARCH_C2`) rather than `PROBE_DELAYED_T2` (`1.35 * amp`, unique positive lag signature). Consequently, in Family C (`CONFIRMATORY_96`), `CTRL_ORACLE` achieved mean utility `0.9350` while `III_HEIRS` (`256B`) achieved `0.9618`. Simultaneously, `evaluator.mjs` (line 623) computed `Math.max(0, oracleRow.utility - scored.utility)`, censoring negative differences.
- **Separately Versioned Errata Calculation (`CONFIRMATORY_96`, `256B`):**
  - Reclassifying original `CTRL_ORACLE` as **Reference Benchmark (`OrigRef`)** and computing the **Exhaustive 16-Action-Pair Oracle (`ExhOracle`)** over $\mathcal{P} \times \mathcal{A}$ flips `ARCH_C1` to `PROBE_DELAYED_T2` across all `6` Family C `ARCH_C1` worlds, raising Family C Oracle mean utility from **`0.9350` to `0.9750`** (strictly above `III_HEIRS` `0.9618`).
  - Under **unclipped signed differences**, `0 / 96` (`0.00%`) episodes of any competing condition outperform `ExhOracle`:

| Condition (`256B`) | Original Clipped Regret | Unclipped Diff vs. `OrigRef` | Exceeded `OrigRef` | Unclipped Regret vs. `ExhOracle` | Exceeded `ExhOracle` |
|---|---:|---:|---:|---:|---:|
| `I_AMNESIACS` | `0.3686` | `+0.3549` | `12 / 96` (`12.50%`) | `+0.3776` | `0 / 96` (`0.00%`) |
| `II_ARCHIVISTS` | `0.1593` | `+0.1475` | `12 / 96` (`12.50%`) | `+0.1702` | `0 / 96` (`0.00%`) |
| `III_HEIRS` | `0.0405` | `+0.0257` | `12 / 96` (`12.50%`) | `+0.0483` | `0 / 96` (`0.00%`) |
| `IV_FALSE_PROPHETS` | `0.5915` | `+0.5823` | `8 / 96` (`8.33%`) | `+0.6049` | `0 / 96` (`0.00%`) |
| `V_EXILES` | `0.5096` | `+0.4953` | `15 / 96` (`15.63%`) | `+0.5180` | `0 / 96` (`0.00%`) |
| `VI_REVISIONISTS` | `0.0645` | `+0.0511` | `11 / 96` (`11.46%`) | `+0.0738` | `0 / 96` (`0.00%`) |
| `CTRL_RANDOM` | `0.7185` | `+0.7185` | `0 / 96` (`0.00%`) | `+0.7411` | `0 / 96` (`0.00%`) |

- **Act II Architectural Fix:** `CTRL_DYNAMIC_ORACLE` exhaustively optimizes over the declared finite action sets at every step, verifies action-space optimality mechanically, and records **unclipped signed regret** $R = U_{\text{oracle}} - U_{\pi} \in (-\infty, +\infty)$ alongside exact exceedance rates.

### Finding 2 — Confirmatory Freeze Scope (`24b57b1b2...fb47927c3`)
- **Defect Identified:** Pre-holdout lock commit `24b57b1b2` locked six `src/*.mjs` files plus two pilot/codec receipts, whereas `scripts/run-confirmatory-96.mjs` (17 files total in `git diff 24b57b1b2 fb47927c3`) was committed after the lock.
- **Act II Architectural Fix:** In Act II, **100% of confirmatory orchestration, statistical aggregation, and reporting code — including `scripts/run-confirmatory-192.mjs` itself — is committed and SHA-256 locked in `preregistration/frozen-confirmatory-lock-act2.json` BEFORE generating or scoring `ACT2_CONFIRMATORY_192`.**

### Finding 3 — Policy / Generator Co-Design & Equalized Calibration Baseline
- **Defect Identified:** `hasStrongEpoch0Drift` occurred in `58.33%` (`28/48`) of `PILOT_48` worlds and `70.83%` (`68/96`) of `CONFIRMATORY_96` worlds; `II_ARCHIVISTS` applied a fixed `0.80` legacy weight while `III_HEIRS` used pilot hidden-mechanism labels to select features.
- **Act II Architectural Fix:** All four primary authority policies (`A_MONUMENTALISTS`, `B_EVIDENTIALISTS`, `C_PROVISIONALISTS`, `D_TEMPORAL_CUSTODIANS`) receive **byte-identical permissible historical records**, use **zero supervised hidden-state training**, and explicitly include an equalized empirical-calibration full-history baseline (`B_EVIDENTIALISTS`).

### Finding 4 — Test Assertion Gap (`terminal_graph_pi.digest` vs. `projection_digest`)
- **Defect Identified:** `test-palace-of-unborn-futures.mjs` line 89 asserted `donor.terminal_graph_pi.digest === w.terminal_graph_pi.digest`, which evaluated `undefined === undefined` across all `144` worlds (though `world-generator.mjs` line 1192 independently enforced `projection_digest` equality).
- **Errata Verification & Act II Fix:** Our read-only reproducer confirms `144 / 144` Act I worlds possess valid 64-hex `projection_digest` strings matching their quartet donor. All Act II tests assert `/^[a-f0-9]{64}$/` on `projection_digest` explicitly.

### Finding 5 — History Immutability Check & Dynamic Secret-Vault Instrumentation
- **Defect Identified:** Act I `evaluator.mjs` compared cached `permissible_history_digest` strings rather than recomputing `sha256Hex(JSON.stringify(history))`, and `competing_conditions_secret_access_count` was not backed by a dynamic property-access trap.
- **Errata Verification & Act II Fix:** Recomputing `sha256Hex(JSON.stringify(w.permissible_full_history))` matches `144 / 144` Act I worlds. In Act II, every world's secret record is wrapped in an **`InstrumentedSecretVault` JavaScript `Proxy`** that dynamically intercepts every property read, increments authorized simulator/oracle counters, and throws `DYNAMIC_VAULT_ACCESS_VIOLATION` on any unauthorized read, while full byte-recomputed SHA-256 checks guard permissible history at every episode step.

### Finding 6 — Temporal Non-Retroactivity (`timestamp_obs` vs. `timestamp_adm`)
- **Defect Identified:** Act I `C4` clock-inverted records placed `timestamp_obs` (`2024-03-09`) after `timestamp_adm` (`2024-03-06`) in `6` pilot records and `10` confirmatory records without modeling retrospective amendment separately from initial admission.
- **Act II Architectural Fix:** Act II implements a strict 8-coordinate safe-integer temporal lattice (`t_event <= t_observed <= t_admitted <= t_available`, `t_decision <= t_action`, `t_contradiction`, `t_correction`) enforced fail-closed by `src/temporal-lattice.mjs`.

### Finding 7 — Monte Carlo Permutation Bounds & Bounded Predicate Induction Ceiling
- **Defect Identified:** Reporting `two_sided_signflip_p: 0` from `4,096` stochastic cluster sign flips overstates Monte Carlo precision; Family D prose risked sounding broader than pre-specified predicate induction.
- **Errata Calculation & Act II Fix:** Under Phipson & Smyth (2010), `0` exceedances in `4,096` draws yields $p_{\text{MC}} = (0 + 1)/(4096 + 1) = 0.000244$ (`1/4097`), never `0`. Act II uses exact $2^K$ enumeration whenever $K \le 16$ and Phipson–Smyth $(k+1)/(B+1)$ upper bounds when $K > 16$, and scopes Act I's Family D claim strictly to bounded predicate induction within `COMPOSITE_MOD3` / `PATH_HOLONOMY_LATCH`.

### Finding 8 — Dollhouse Audit Worktree Cleanliness & Nested Specialist Holds
- **Defect Identified:** Act I ran `/dollhouse-audit` before committing its runner/test scripts (`worktree_cleanliness_verified: false`, `source_revision: 24b57b1b2`) and carried nested `APERTURE` `classification_replay_stability: HELD_NOT_YET_WITNESSED`.
- **Act II Architectural Fix:** Act II commits all scientific code, confirmatory receipts, exploratory analyses, and manuscript **before** invoking `/dollhouse-audit` on a clean working tree (`worktree_cleanliness_verified: true`), and surfaces nested specialist holds prominently in the Operator Decision Packet without equating role unanimity to empirical replication (`EMPIRICAL_REPLICATION_0`).

---

𝄐 `Khona‌lit-po` · Sealed `⟐SAC[X6ZNK5NO51]`
