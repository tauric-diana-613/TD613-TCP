# 𝌋 TD613 · Experiment A Independent Review Notes & Replay Instructions

**Covenant:** Tauric Diana · Khona‌lit-po (preserve U+200C)  
**Date:** 2026-10-29  
**Review Target:** `TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip` (`43,100` B, SHA-256 `a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe`)

---

## 1. Physical Archive Transfer Receipt
The physical evidence archive has been transferred to the root artifact directory:
- **Archive Path:** `C:\Users\<operator>\.gemini\antigravity\brain\9f2d357f-af13-4730-b6c0-a1afe1416169\TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip`
- **Byte Count:** `43,100` bytes
- **SHA-256 Digest:** `a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe`

### Contents of the Sealed Archive (16 Manifest Items + 1 Runner):
```text
e3dadffa54d27138c402e6551f2a8ff3b1fc03aedf1d1213677204de2875b7d0  01_entry_reconciliation/POSTFLIGHT_ENTRY_RECONCILIATION.json
877a499eb6f1dee92fb288465e547b4e745e50740fff32f5a662f21baf442de0  02_wild_field_inquiry/RAW_LATIFA_INQUIRY_LEDGER.json
2b3292c87330ee91c395de0fda809e7c4bdfbe8097e1808215845bd14d1e06ed  03_evidence_genealogy/CORPUS_GENEALOGY_AUDIT.json
3dfe2f133b8d752f54cce45c65001a5230519047f33223f28d6039fc15b9acfb  04_assays_a1_to_a5/ASSAY_A1_BLINDED_TOPOLOGY_PLACEMENT.json
2b60d7ab68b9c0d94e65889046d11978f4208c09819dc5a650560d8d59cfa68a  04_assays_a1_to_a5/ASSAY_A2_FALSE_TWIN_STRESS_TEST.json
d6906bd1c7b2c7524b1e4e9d673dd74f008b648119b989fc35006104de6576df  04_assays_a1_to_a5/ASSAY_A3_BUDGET_CROWDING_SWEEP.json
d4a015d0d1f191e39dc47222aff6df6e0c1c6cf10f8e9f528d40c2f3b28e4892  04_assays_a1_to_a5/ASSAY_A4_NON_SCALAR_QUESTION_AUDIT.json
f8fc1e7bfb336558c04392474de41725eb2c01593424384b2a38bc37695473bf  04_assays_a1_to_a5/ASSAY_A5_NOTATION_STRIPPING_SIEVE.json
50027d01a32b54833f3a8916580bf62d39b6873dc59715390fe4233f2cc4020c  05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json
921ee9c747bac25c1c8c0076bd64ac53a2499c1500f7721693d4926422791d30  06_dollhouse_review/BLINDED_ADVERSARIAL_REVIEW_PACKET.json
234a072a34d53ddc732aed322ceb73910c12bdfee0a71f9f448ae1e79ae0ae55  06_dollhouse_review/POSTFLIGHT_DOLLHOUSE_HUMAN_RECEIPT.md
b5e9893682e24fddfc2ad0870a59244e608694d42bd63a19a1e28ff5e691fe6f  06_dollhouse_review/POSTFLIGHT_DOLLHOUSE_MACHINE_RECEIPT.json
fa4af6ca4f57e306edf45ec4ad72abda076ea2aeb892339ac2ee1579d2cb88d2  06_dollhouse_review/SEALED_UNBLINDING_KEY.json
899cffd50d28015d75d344b3c036de1345737ad9d2cb1e32f4a6ad31fcfe31e6  07_synthesis_and_closure/MANIFEST_CANDIDATE_TRAJECTORIES.json
29a1a743e2df4da0fa00d8b791fbc555eff047842c404d29ff97a4a2dd6f5e73  07_synthesis_and_closure/MATHEMATICAL_FALSIFICATION_LEDGER.json
a1c7a606363be79203de7cc8177805718fafe09052bff3e2c279f098cb04414e  run-scientific-postflight.mjs
```

---

## 2. Independent Blinded Evaluation Protocol
To perform an independent replay without authorial bias:
1. **Inspect Blinded Review Packet First:**
   - Read `06_dollhouse_review/BLINDED_ADVERSARIAL_REVIEW_PACKET.json`.
   - The packet presents seven disguised experimental conditions (`ARM_ALPHA` through `ARM_ETA`) containing raw input/output traces, token counts, and SVD conditioning metrics.
   - Do **NOT** open `06_dollhouse_review/SEALED_UNBLINDING_KEY.json` until all arms have been independently scored on:
     - Nullity / rank deficit
     - Information preservation under finite context
     - Cross-chamber boundary compliance
2. **Unblind After Scoring:**
   - Once independent scores are logged, open `SEALED_UNBLINDING_KEY.json` to verify:
     - `ARM_ALPHA` = `ARM_0_EMPTY_EMPTY`
     - `ARM_BETA` = `ARM_1_TD613_NATIVE`
     - `ARM_GAMMA` = `ARM_2_EM_NATIVE`
     - `ARM_DELTA` = `ARM_3_EQUAL_INPUT_NATIVE_UNION`
     - `ARM_EPSILON` = `ARM_4_TD613_RECIPIENT_ATELIER`
     - `ARM_ZETA` = `ARM_5_EM_RECIPIENT_ENCYCLOPEDIA`
     - `ARM_ETA` = `ARM_6_EXPLORATORY_EXTENDED_UNION`

---

## 3. Command-Line Replay Instructions
To replay the full 66-point automated verification suite:
```powershell
# 1. Verify working tree is clean
git status --porcelain=v2 --branch

# 2. Run postflight verification harness
node "C:\Users\<operator>\.gemini\antigravity\brain\9f2d357f-af13-4730-b6c0-a1afe1416169\scratch\exp_a_scientific_postflight_20261029\verify-scientific-postflight.mjs"

# 3. Run closure redpen verification harness
node "C:\Users\<operator>\.gemini\antigravity\brain\9f2d357f-af13-4730-b6c0-a1afe1416169\scratch\exp_a_postflight_closure_r1_20261029\verify-postflight-closure-redpen.mjs"
```
