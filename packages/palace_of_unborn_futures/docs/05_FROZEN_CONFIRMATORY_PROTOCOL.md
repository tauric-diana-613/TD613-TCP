# 𝌋 05 · FROZEN CONFIRMATORY PROTOCOL (PRE-HOLDOUT COMMIT LOCK)

**THE PALACE OF UNBORN FUTURES: COUNTERFACTUAL SCIENTIFIC INHERITANCE AND THE LIMITS OF FINITE RESEARCH MEMORY**

- **Authority:** `SAC[X6ZNK5NO51]` · **Covenant:** `Khona‌lit-po`
- **Inherited Predecessor Heads (Unmodified):**
  - PR #1697 HEAD: `20df004c4997689d33ed614b42ab8b683c1da22a`
  - PR #1698 HEAD: `b69c39b17700e511b24a0ffa903bd1dcc6f266b3`
- **Supervision Label:** `INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL` (`independent_external_blinding: false`)
- **Machine-Verifiable Lock Manifest:** `preregistration/frozen-confirmatory-lock.json`

---

## 1. Chronological Freeze Attestation (Section V.4)

This protocol is committed to the isolated Git branch `research/palace-of-unborn-futures-argon-20261105` **after** completion of the 48-world calibration pilot (`PILOT_48`) and **strictly before** generating or scoring any world in the 96-world confirmatory suite (`CONFIRMATORY_96`).

The confirmatory runner (`scripts/run-confirmatory-96.mjs`) **MUST** verify at startup that every locked file listed below matches its exact byte count and SHA-256 digest on disk; any mismatch aborts execution fail-closed (`[CONFIRMATORY_LOCK_MISMATCH]`).

---

## 2. Exact Frozen Artifacts & SHA-256 Digests

| Locked Artifact | Byte Length | SHA-256 Digest |
|---|---:|---|
| `src/prng.mjs` | `2929` | `cc738d7bf933700149c91ce813ac463056b1ef5a14e62a9b56de33100d1cfbc6` |
| `src/world-generator.mjs` | `56254` | `6dee220d143a42f572bc94c0e2a0a4a92b8fb80b5dda6f41acb5f520b34b8be9` |
| `src/capsule-compressor.mjs` | `14610` | `a76f1a38ee59c390d51f51512b413871f4bbfbbc600da5f108d9d39ea2bee1f9` |
| `src/heirs-and-policies.mjs` | `29790` | `9aaf8393b5de02b115bd1ca601d96386bc327a418043cbb2a25b65f598d0a463` |
| `src/evaluator.mjs` | `28770` | `0160872f1666ae4c972778f72be6ac42402e83d21b4f0ac8fb75f04003f4aaee` |
| `src/privacy-disclosure-assay.mjs` | `10720` | `33b7e4443ba773757509b5ecd1d51f9bcfe8216bd06aa95ed1dc842e2cab465f` |
| `receipts/trained-capsule-codec-v1.json` | `3780` | `cda4959058a48c8ea901b311bd47f71fe02072a7fd8dab88d56e1de740de6f19` |
| `receipts/pilot-48-receipt.json` | `89779` | `8a2041a65716d26073b202b0e328cafeeece5f5c1c5f73e3001b4ce7c6a35c16` |

---

## 3. Frozen Confirmatory Design (`CONFIRMATORY_96`)

1. **Disjoint Seed & Sample Size:**
   - Master Generator Seed: `TD613_PALACE_CONFIRMATORY_96_SEED_V1` (disjoint from `TD613_PALACE_PILOT_48_SEED_V1`).
   - Evaluation Seed: `TD613_PALACE_CONFIRMATORY_EVAL_V1`.
   - Total Confirmatory Worlds: **96 worlds** = **24 Iso-$\Pi$ Quartets** (6 quartets = 24 worlds in each of `A_CAUSAL_LOOKALIKES`, `B_HIGHER_ORDER_RELATIONS`, `C_TEMPORAL_INHERITANCE`, `D_IMPOSSIBLE_LIBRARY`).
2. **Frozen Conditions & Noncompeting Controls:**
   - Competing Heirs: `I_AMNESIACS`, `II_ARCHIVISTS`, `III_HEIRS` (using frozen `trained-capsule-codec-v1.json` with **zero** retraining), `IV_FALSE_PROPHETS`, `V_EXILES`, `VI_REVISIONISTS`.
   - Noncompeting Controls: `CTRL_RANDOM` (lower random anchor) and `CTRL_ORACLE` (vault-logged synthetic upper bound).
3. **Matched Budgets:**
   - Memory Budgets: `B_TIGHT = 96` UTF-8 bytes (`selected_atoms: ["F1_CAL_COARSE", "F3_TEMP_LEDGER", "F4_RES_COARSE"]`) and `B_STANDARD = 256` UTF-8 bytes (`selected_atoms: ["F2_CAL_EXACT", "F3_TEMP_LEDGER", "F5_RES_FULL"]`).
   - Action Budget: Strictly `1` diagnostic probe + `1` consequential intervention + `1` terminal claim/abstention + `16` held-out predictions per episode across all conditions.
4. **Frozen Scoring & Noninferiority Rule:**
   - Primary Composite Utility Weights (identifiable worlds): $0.20\,\text{ProbeIG} + 0.35\,\text{IntAcc} + 0.25\,\mathbb{I}[\text{CorrectID}] + 0.20\,\text{HoldoutAcc} - 0.20\,\mathbb{I}[\text{FalseClaim}]$.
   - Primary Composite Utility Weights (unidentifiable `D3` worlds): $0.20\,\text{ProbeIG} + 0.35\,\text{IntAcc} + 0.45\,\mathbb{I}[\text{CorrectAbstain}] - 0.25\,\mathbb{I}[\text{FalseClaim}]$.
   - Preregistered Noninferiority Margin for $\mathbb{E}[U(\text{III\_HEIRS}) - U(\text{II\_ARCHIVISTS})]$: $\Delta_{\text{NI}} = 0.05$ (supported iff the lower bound of the two-sided quartet-clustered 95% bootstrap confidence interval exceeds $-0.05$).
   - Statistical Inference: Quartet-clustered paired bootstrap ($3,000$ resamples over $K = 24$ independent Iso-$\Pi$ Quartet clusters), paired Cohen's $d_z$, and two-sided cluster sign-flip permutation $p$-values, reported both across all 96 worlds and disaggregated within each of the 4 hidden-world families.

⟐ `SAC[X6ZNK5NO51]`
