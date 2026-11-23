# 𝌋 05 · CALIBRATION PILOT REPORT (`ACT2_PILOT_48`)

- **Receipt:** [`receipts/pilot-48-receipt.json`](../receipts/pilot-48-receipt.json)
- **Runner:** [`scripts/run-pilot-48.mjs`](../scripts/run-pilot-48.mjs)
- **Seeds:** `TD613_ACT2_PILOT_48_WORLDS_20261105_SAC_X6ZNK5NO51` / `TD613_ACT2_PILOT_48_EVAL_20261105_SAC_X6ZNK5NO51`
- **Scale:** `48` base worlds (`8` per family across Families A–F = `12` four-world Iso-$\Pi$ clusters) $\times 6$ diagnostic calibration cells = `288` world-trajectories $\times 7$ policies = **`2,016` pilot episodes**
- **Confirmatory Worlds Generated / Inspected During Pilot:** **`0`**
- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`

---

## 1. Transparent Pre-Freeze Calibration Log

In strict adherence to Section V (*"Develop and validate the generator and inference architecture before examining confirmatory outcomes"*), two engineering defects were identified and repaired exclusively on `ACT2_PILOT_48` prior to freezing `frozen-confirmatory-lock-act2.json`:

1. **`UniversalAtelierReceiver` Adjudication Action Enum:** Initial pilot smoke run threw `INVALID_ACTION` on process-note label `'HISTORICAL_INTAKE_VERIFIED'`; repaired to canonical `UA_VALID_ACTIONS` member `'RECORD_ADMISSION'`.
2. **Observation Queue Ordering, Newly-Available CUSUM & Sensor Noise Calibration:**
   - `AvailabilityMembrane.getAuthorizedRecordsAt` originally returned records in insertion order (placing pre-queued ambient records ahead of dynamically requested probes regardless of `t_available`), causing `residualCusum` to inspect an early probe rather than newly admitted evidence. Repaired to sort visible records deterministically by `(t_available, t_event, obs_id)` and update `residualCusum` strictly on observations with `t_available === t`.
   - Added context-consistency weighting (`0.30` on tag mismatch) to `D_TEMPORAL_CUSTODIANS` episode observations so Beta-excursion active probes do not overwrite Alpha recurrence in `FAM_E_RECURRENT_REGIMES`.
   - Calibrated `ambient_sd = 0.74` and `probe_sd = 0.30` (from `0.52` / `0.24`) and set cluster ancestral founder validity to `3/4` calibrated vs `1/4` uncalibrated (reserving exact `50/50` orthogonal crossing for the `96`-world `2x2` standing factorial) to eliminate near-ceiling saturation (`0.9989 -> 0.9714`) in `FAM_A_STATIONARY_INHERITANCE`.

Zero confirmatory worlds (`ACT2_CONFIRMATORY_192`) were generated or inspected prior to freezing.

---

## 2. Qualification Checklist (`2,016 / 2,016` Episodes Verified)

| Qualification Invariant | Observed Value | Status |
|---|---|---|
| Numerical stability (`NaN` / `Infinity` absence) | `2,016 / 2,016` finite | **PASS** |
| Live `UniversalAtelierReceiver` 64-hex `projection_digest` Iso-$\Pi$ equality | `12 / 12` four-world clusters (`4` distinct histories per cluster) | **PASS** |
| Dynamic `Proxy` secret-vault unauthorized investigator reads | **`0`** (`simulator=1,356`, `oracle=4,896`, `scorer=26,208`) | **PASS** |
| Full-byte SHA-256 history immutability recomputations | **`3,456 / 3,456`** exact matches | **PASS** |
| Exhaustive Oracle upper bound (`exceeded_oracle`) | **`0.0000`** across all `2,016` episodes (`U_oracle = 0.9845`) | **PASS** |
| Policy distinctiveness & ceiling/floor absence | Primary utilities span `[0.4989, 0.7211]` $\subset (0.25, 0.92)$ | **PASS** |

---

## 3. Pilot Aggregate Performance & Family Disaggregation

| Policy / Control | Mean Utility (`O1`) | Signed Regret (`O2`) | Pre-Avail Error (`O3`) | Post-Avail Error (`O4`) | Mean Probes (`/6`) | False Claim Rate (`O6`) |
|---|---:|---:|---:|---:|---:|---:|
| **`D_TEMPORAL_CUSTODIANS`** | **`0.7211`** | `0.2634` | `0.6274` | **`0.3526`** | `4.46` | **`0.1528`** |
| **`C_PROVISIONALISTS`** | `0.6302` | `0.3544` | `0.8148` | `0.5677` | `6.00` | `0.3194` |
| **`B_EVIDENTIALISTS`** | `0.6261` | `0.3585` | `0.7044` | `0.5391` | `3.28` | `0.2569` |
| **`A_MONUMENTALISTS`** | `0.4989` | `0.4856` | `0.6428` | `0.6488` | **`0.18`** | `0.4688` |
| `CTRL_NO_HISTORY` *(ref)* | `0.5582` | `0.4263` | `0.8377` | `0.6174` | `4.56` | `0.3160` |
| `CTRL_RANDOM` *(ref)* | `0.3261` | `0.6584` | `0.8091` | `0.8207` | `5.23` | `0.7639` |
| `CTRL_DYNAMIC_ORACLE` *(ref)* | `0.9845` | `0.0000` | `0.0000` | `0.0000` | `0.00` | `0.0000` |

### Mean Utility by World Family (`ACT2_PILOT_48`)

| World Family | Monumentalists | Evidentialists | Provisionalists | Temporal Custodians | No-History |
|---|---:|---:|---:|---:|---:|
| **`FAM_A` Stationary Inheritance** | `0.8974` | **`0.9714`** | `0.8727` | `0.9478` | `0.9118` |
| **`FAM_B` Abrupt Transition** | `0.2784` | `0.4640` | `0.5863` | **`0.6868`** | `0.4788` |
| **`FAM_C` Gradual Drift** | `0.4067` | `0.4547` | `0.5042` | **`0.6476`** | `0.4320` |
| **`FAM_D` Action-Invariant Change** | `0.7290` | **`0.8700`** | `0.7241` | `0.8479` | `0.7407` |
| **`FAM_E` Recurrent Regimes** | `0.4694` | `0.4712` | `0.4886` | **`0.5819`** | `0.3655` |
| **`FAM_F` Delayed Contradiction** | `0.2128` | `0.5250` | `0.6052` | **`0.6149`** | `0.4204` |

**Qualification Decision:** `QUALIFIED_FOR_CONFIRMATORY_FREEZE = true`. Proceed to lock all scientific modules and `scripts/run-confirmatory-192.mjs` in Git prior to executing `ACT2_CONFIRMATORY_192`.

---

𝄐 `Khona‌lit-po` · Sealed `⟐SAC[X6ZNK5NO51]`
