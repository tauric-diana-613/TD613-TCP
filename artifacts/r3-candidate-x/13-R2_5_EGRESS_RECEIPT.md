# R2.5 Addressable Egress Receipt · Candidate X

**Egress Type**: Witness-Only Remote Branch Publication  
**Repository**: `tauric-diana-613/TD613-TCP`  
**Witness Branch**: `witness/candidate-x-r3-egress-41112992-20261004`  
**Base Commit**: `5b4b34278c6100d3c21ced35984c046da157e097`  
**Transfer Packet Directory**: `artifacts/r3-candidate-x/`  
**Authorization**: Granted by interactive operator directive `<<R2_5_ADDRESSABLE_EGRESS_AND_R3_RECEIVER_ACTIVATION>>`  
**Execution Timestamp**: `2026-10-04T20:58:00Z`  

---

## 1. Scope and Anti-Equivalences

This publication establishes addressable transport availability for an independent receiver ($R_3$). It carries no promotion, deployment, or automatic acceptance authority.

```text
R2.5 != R3
PUSH != EXOGENOUS RECONSTRUCTION
REMOTE BRANCH != PRODUCT PROMOTION
ADDRESSABILITY != ADMISSION
PUBLICATION != TRUST
EGRESS != ESCAPE
```

---

## 2. Packet Members & Verification Status

All packet members are sealed under `12-SHA256SUMS.txt`. Following publication, the remote branch is fetched back into a separate clean environment to verify exact bitwise identity before declaring R2.5 PASS.

---

## 3. Authority Status

- `main` working head: `5b4b34278c6100d3c21ced35984c046da157e097` (clean, unmutated)
- Issue #405: OPEN (deployment membrane closed; no deployment authorized)
- Neon database custody: unmutated (zero production database calls issued)
- Pull requests: 0 opened
- Release tags: 0 minted
