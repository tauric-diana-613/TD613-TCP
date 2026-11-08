# 𝌋 05B · SOURCE-FREE 96-WORLD CONFIRMATORY RESULTS REPORT

**THE PALACE OF UNBORN FUTURES: COUNTERFACTUAL SCIENTIFIC INHERITANCE AND THE LIMITS OF FINITE RESEARCH MEMORY**

- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`
- **Supervision Mode:** `INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL` (`independent_external_blinding: false`)
- **Pre-Holdout Frozen Protocol Commit:** `24b57b1b2d0b69ccaf94bdcea9c4a8e7ef73247c` (`8/8` locked artifacts verified byte-identical prior to execution)
- **Confirmatory Suite:** `CONFIRMATORY_96` (`TD613_PALACE_CONFIRMATORY_96_SEED_V1`, 96 synthetic worlds = 24 Iso-$\Pi$ Quartets = 24 worlds per family)
- **Confirmatory Receipt:** `receipts/confirmatory-96-receipt.json`

---

## 1. Qualification & Separation Verification

1. **Zero Post-Freeze Modification:** All 8 locked modules and receipts (`src/prng.mjs`, `src/world-generator.mjs`, `src/capsule-compressor.mjs`, `src/heirs-and-policies.mjs`, `src/evaluator.mjs`, `src/privacy-disclosure-assay.mjs`, `receipts/trained-capsule-codec-v1.json`, `receipts/pilot-48-receipt.json`) matched their pre-committed SHA-256 digests in `preregistration/frozen-confirmatory-lock.json` (`24b57b1b2`).
2. **Cryptographic Split Disjointness:** Across `PILOT_48` ($N = 48$) and `CONFIRMATORY_96` ($N = 96$), `shared_world_ids = 0`, `shared_terminal_pi_digests = 0`, and `shared_history_digests = 0`.
3. **Iso-$\Pi$ Quartet Equality:** `24/24` confirmatory quartets satisfied exact `UniversalAtelierReceiver.canonicalProjectionPi()` SHA-256 equality (`all_four_pi_equal === true`) while retaining 4 distinct process history digests (`distinct_history_digests === 4`).
4. **Secret Vault Isolation:** `competing_conditions_secret_access_count === 0` (`1,152` competing episodes); `random_control_secret_access_count === 0`; noncompeting `CTRL_ORACLE` logged `192` explicit vault reads.

---

## 2. Primary & Secondary Outcomes Across All 96 Worlds

### 2.1 Standard Memory Budget (`B_STANDARD = 256` UTF-8 Bytes)

| Condition | Mean Utility $U$ | Regret vs Oracle | Identifiable ID Rate ($n=90$) | Unidentifiable Abstain ($n=6$) | False Claim Rate | Holdout Acc | Brier Score | ECE (5-bin) | Conf. When Wrong | Surprise Recovery | Mean Bytes (Tokens) | Compression Ratio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **`I_AMNESIACS`** | `0.5887` | `0.3686` | `0.6000` | `1.0000` | `0.3750` | `0.7591` | `0.1464` | `0.0151` | `0.3885` | `0.5313` | `0.0` (`0.0`) | `—` |
| **`II_ARCHIVISTS`** | `0.7960` | `0.1593` | `0.8444` | `1.0000` | `0.1458` | `0.8854` | `0.0958` | `0.0566` | `0.5526` | `0.5313` | `3234.7` (`809.2`) | `1.00x` |
| **`III_HEIRS`** | **`0.9179`** | **`0.0405`** | **`0.9556`** | **`1.0000`** | **`0.0417`** | **`0.9661`** | **`0.0267`** | `0.0965` | `0.5930` | `0.2188` | **`111.5`** (`28.4`) | **`29.01x`** |
| **`IV_FALSE_PROPHETS`** | `0.3613` | `0.5915` | `0.4222` | `0.0000` | `0.6042` | `0.6810` | `0.2477` | `0.1455` | `0.4705` | **`0.8750`** | `3424.3` (`856.5`) | `0.94x` |
| **`V_EXILES`** | `0.4482` | `0.5096` | `0.4889` | `0.1667` | `0.5000` | `0.7188` | `0.2813` | `0.3003` | **`0.6634`** | `0.6771` | `3234.7` (`809.2`) | `1.00x` |
| **`VI_REVISIONISTS`** | `0.8924` | `0.0645` | `0.9333` | `1.0000` | `0.0625` | `0.9557` | `0.0413` | `0.0870` | `0.5542` | `0.2813` | `236.6` (`59.7`) | `13.67x` |
| `CTRL_RANDOM` *(ctrl)* | `0.2251` | `0.7185` | `0.2111` | `0.0000` | `0.6354` | `0.5026` | `0.1615` | `0.0521` | `0.2500` | `0.0000` | `0.0` (`0.0`) | `—` |
| `CTRL_ORACLE` *(upper)* | `0.9436` | `0.0000` | `1.0000` | `1.0000` | `0.0000` | `1.0000` | `0.0001` | `0.0100` | `N/A` | `0.0000` | `0.0` (`0.0`) | `—` |

### 2.2 Tight Memory Budget (`B_TIGHT = 96` UTF-8 Bytes)

*(Conditions `I`, `II`, `IV`, `V`, and `CTRL_ORACLE` are invariant across capsule budget tiers; `III_HEIRS` and `VI_REVISIONISTS` operate under the hard $\le 96$-byte cap.)*

| Condition | Mean Utility $U$ | Regret vs Oracle | Identifiable ID Rate ($n=90$) | Unidentifiable Abstain ($n=6$) | False Claim Rate | Holdout Acc | Brier Score | Mean Bytes (Max) | Compression Ratio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **`III_HEIRS` (`96B`)** | **`0.8891`** | **`0.0685`** | **`0.9222`** | **`1.0000`** | **`0.0729`** | **`0.9583`** | **`0.0663`** | **`81.9`** (`83`B) | **`39.47x`** |
| **`VI_REVISIONISTS` (`96B`)** | `0.8191` | `0.1357` | `0.8667` | `1.0000` | `0.1250` | `0.8919` | `0.0900` | `83.1` (`84`B) | `38.92x` |
| `II_ARCHIVISTS` *(ref)* | `0.7960` | `0.1593` | `0.8444` | `1.0000` | `0.1458` | `0.8854` | `0.0958` | `3234.7` (`3264`B) | `1.00x` |
| `I_AMNESIACS` *(ref)* | `0.5887` | `0.3686` | `0.6000` | `1.0000` | `0.3750` | `0.7591` | `0.1464` | `0.0` (`0`B) | `—` |

---

## 3. Preregistered Paired Contrasts & Noninferiority Tests ($N = 96$, $K = 24$ Quartet Clusters)

| Contrast | Budget | Mean Paired Diff | SD Diff | Quartet-Clustered 95% CI | Cohen's $d_z$ | Sign-Flip $p$ | Preregistered Decision |
|---|---|---:|---:|---:|---:|---:|---|
| $\Delta U_H = \text{II\_ARCHIVISTS} - \text{I\_AMNESIACS}$ | Both | **`+0.2074`** | `0.5291` | **`[+0.1207, +0.2920]`** | `+0.3919` | `< 0.0001` | **Supported (`H1`):** History substantially improves utility overall. |
| $\Delta U_Z = \text{III\_HEIRS} - \text{I\_AMNESIACS}$ | `256B` | **`+0.3292`** | `0.4692` | **`[+0.2530, +0.3981]`** | `+0.7017` | `< 0.0001` | **Supported:** Capsule improves utility over Amnesiacs by `+0.3292`. |
| $\Delta U_Z = \text{III\_HEIRS} - \text{I\_AMNESIACS}$ | `96B` | **`+0.3004`** | `0.4563` | **`[+0.2137, +0.3828]`** | `+0.6583` | `< 0.0001` | **Supported:** `96B` capsule retains `91.3%` of `256B` gain (`39.5x` smaller than $H$). |
| $\text{III\_HEIRS} - \text{II\_ARCHIVISTS}$ ($\Delta_{\text{NI}} = -0.05$) | `256B` | **`+0.1219`** | `0.3749` | **`[+0.0627, +0.1943]`** | `+0.3251` | `0.0010` | **Noninferiority & Superiority Supported (`H2`):** $\text{CI}_{\text{low}} = +0.0627 > -0.05$. |
| $\text{III\_HEIRS} - \text{II\_ARCHIVISTS}$ ($\Delta_{\text{NI}} = -0.05$) | `96B` | **`+0.0931`** | `0.3712` | **`[+0.0325, +0.1613]`** | `+0.2508` | `0.0068` | **Aggregate Noninferiority Supported (`H2`):** $\text{CI}_{\text{low}} = +0.0325 > -0.05$ *(but see Family A heterogeneity below!)*. |
| $\text{VI\_REVISIONISTS} - \text{II\_ARCHIVISTS}$ | `256B` | **`+0.0964`** | `0.3279` | **`[+0.0429, +0.1575]`** | `+0.2941` | `0.0039` | **Supported (`H5`):** Selective forgetting of founder drift improves decisions at `256B`. |
| $\text{VI\_REVISIONISTS} - \text{II\_ARCHIVISTS}$ | `96B` | `+0.0231` | `0.4408` | **`[-0.0575, +0.1055]`** | `+0.0524` | `0.5854` | **Noninferiority FAILED at `96B`:** $\text{CI}_{\text{low}} = -0.0575 < -0.05$ due to Family D residual eviction. |
| $\text{IV\_FALSE\_PROPHETS} - \text{I\_AMNESIACS}$ | Both | **`-0.2274`** | `0.4158` | **`[-0.2847, -0.1662]`** | `-0.5469` | `< 0.0001` | **Supported (`H3`):** Polished false narrative severely harms discovery below ignorance. |
| $\text{V\_EXILES} - \text{I\_AMNESIACS}$ | Both | **`-0.1404`** | `0.5621` | **`[-0.2276, -0.0553]`** | `-0.2498` | `0.0046` | **Supported (`H4a`):** Authentic foreign history actively harms discovery below ignorance. |
| $\text{V\_EXILES} - \text{IV\_FALSE\_PROPHETS}$ (Utility) | Both | `+0.0869` | `0.5210` | `[+0.0039, +0.1711]` | `+0.1668` | `0.0488` | **Nuanced Divergence (`H4b`):** Explicit lies depress raw utility slightly more (`-0.2274` vs `-0.1404`), whereas Exiles suffer **much worse epistemic overconfidence when wrong (`0.6634` vs `0.4705`) and worse ECE (`0.3003` vs `0.1455`)**. |

---

## 4. Disaggregated Results by Hidden-World Family (Refusing Aggregate Collapse)

Aggregate statistics conceal three sharp structural divergences across the four hidden-world families ($n = 24$ worlds = $6$ quartets per family):

### 4.1 Family-by-Family Mean Utility ($U$) & Key Contrasts

| Family ($n=24$ each) | `I_AMNESIACS` | `II_ARCHIVISTS` | `III_HEIRS` (`256B` / `96B`) | `IV_FALSE_PROPHETS` | `V_EXILES` | `VI_REVISIONISTS` (`256B` / `96B`) | `CTRL_ORACLE` |
|---|---:|---:|---:|---:|---:|---:|---:|
| **`A_CAUSAL_LOOKALIKES`** | `0.7506` | `0.7520` | `0.8563` / **`0.7506`** | `0.5509` | `0.6595` | `0.8563` / `0.8563` | `0.9452` |
| **`B_HIGHER_ORDER_RELATIONS`** | `0.4437` | `0.6148` | `0.8756` / `0.8702` | `0.1957` | `0.3006` | `0.7864` / `0.7928` | `0.9120` |
| **`C_TEMPORAL_INHERITANCE`** | `0.7248` | `0.9136` | `0.9618` / `0.9577` | `0.5592` | `0.6545` | `0.9493` / `0.9492` | `0.9350`* |
| **`D_IMPOSSIBLE_LIBRARY`** | `0.4355` | `0.9037` | `0.9779` / `0.9779` | `0.1394` | `0.1782` | `0.9779` / **`0.6781`** | `0.9820` |

### 4.2 Critical Family-Level Findings & Failure Cases

1. **Family A (`CAUSAL_LOOKALIKES`) — Full History Stagnation & `96B` Coarse-Quantization Failure:**
   - Full-history `II_ARCHIVISTS` achieved almost **zero** net gain over `I_AMNESIACS` in Family A ($\Delta U_H = +0.0013$, `95% CI [-0.0959, +0.0924]`) because `68/96` confirmatory worlds carried `EPOCH_0` founder drift (`legacy_sample_count = 64`), offsetting calibrated hub-perturbation clues!
   - At `256B`, both `III_HEIRS` and `VI_REVISIONISTS` discarded `EPOCH_0` drift while preserving continuous calibrated scores, jumping to `U = 0.8563` (`ID = 87.5%`).
   - **Important `96B` Failure:** Under `B_TIGHT = 96B`, `III_HEIRS` quantized calibrated log-support into `F1_CAL_COARSE` $\in \{-1, 0, +1\}$, collapsing the continuous between-cell variance margin distinguishing `ARCH_A1_CAUSAL_CHAIN` from `ARCH_A4_NONLINEAR_SUPPRESSOR`. Consequently, `III_HEIRS (96B)` fell back to `0.7506` in Family A (`heirs_minus_archivists CI95 = [-0.0920, +0.0963]`, **failing family-specific noninferiority** in Family A even though aggregate noninferiority passed!).
2. **Family B (`HIGHER_ORDER_RELATIONS`) — Pairwise Graph Blindness:**
   - Because pairwise spin-outcome edges vanish identically in $\Pi(G)$, `I_AMNESIACS` scored `U = 0.4437` (`ID = 50.0%`). `III_HEIRS` (`U = 0.8756`, $\Delta U_Z = +0.4319$, `95% CI [+0.3617, +0.4823]`, $d_z = 0.7558$) leveraged `triad_synergy_excess` to route directly to 3-body parity clamps when pairwise scores were null.
3. **Family C (`TEMPORAL_INHERITANCE`) — Non-Retroactivity & Heuristic-Oracle Probe Note:**
   - `I_AMNESIACS` committed retroactive/temporal false claims on `25.0%` of Family C worlds (`U = 0.7248`), whereas `III_HEIRS` (`0.9618`) and `VI_REVISIONISTS` (`0.9493`) achieved `100%` identification (`0.0%` false claims).
   - *\*Methodological Transparency Note on `CTRL_ORACLE` (`0.9350`):* On the 6 `ARCH_C1_TRUE_DELAYED_LAG` worlds, the frozen generator's static `optimalProbeId` table assigned `PROBE_PRECURSOR_SEQUENCE` (`0.25 * amp`), whereas `III_HEIRS`'s Gauss-Hermite EIG planner selected `PROBE_DELAYED_T2` (`1.35 * amp`), earning higher objective probe discriminability (`+0.0268`). Because `world-generator.mjs` was frozen prior to confirmatory scoring (`24b57b1b2`), this static-label quirk is preserved unaltered and disclosed here.
4. **Family D (`THE_IMPOSSIBLE_LIBRARY`) — Catastrophic `96B` Omission in `VI_REVISIONISTS`:**
   - At `256B`, both `III_HEIRS` and `VI_REVISIONISTS` achieved `U = 0.9779`, `100%` rupture detection, `100%` `D3` unidentifiable abstention, and **`91.67%` (`11/12`) valid non-renaming predicate invention**.
   - At `96B`, `VI_REVISIONISTS` was forced by its category-truncation budget (`83.1`B $\le 96$B) to evict `CAT_RESIDUAL_ANOMALIES` entirely. Its Family D utility plunged from `0.9779` to **`0.6781`** ($\Delta = -0.2255$ vs `II_ARCHIVISTS`, `95% CI [-0.2476, -0.1966]`), and its **valid ontology invention rate collapsed from `91.67%` to `0.0000%`**, whereas `III_HEIRS (96B)` retained coarse residual code `F4_RES_COARSE` (`rc`) inside `81.9`B and preserved **`91.67%` valid predicate invention**!

### 4.3 Concrete Failure Case Register (Sampled From `confirmatory-96-receipt.json`)

- **`II_ARCHIVISTS` Founder-Drift Failures (`14/90` identifiable worlds missed):** e.g., `CONFIRMATORY_96_A_Q00_W1` (`ARCH_A2_LATENT_CONFOUNDER`, `has_strong_epoch0_drift: true`, declared `M_SLOT_3` with `0.562` confidence, `U = 0.1750`) and `CONFIRMATORY_96_B_Q00_W0` (`ARCH_B3_PURE_TRIAD_XOR`, anchored by 64-run legacy score into pairwise probe, `U = 0.1408`).
- **`III_HEIRS (256B)` Residual Noise Failures (`4/90` identifiable worlds missed):** e.g., `CONFIRMATORY_96_A_Q01_W1` (`ARCH_A4_NONLINEAR_SUPPRESSOR`, high Gaussian draw on preliminary micro-delta masked threshold suppression, `stated_confidence = 0.593`).

⟐ `SAC[X6ZNK5NO51]`
