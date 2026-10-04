# R3 Independent Receiver Guide · Candidate X

## 1. Context and Objective
This package contains a candidate software extraction prepared for independent evaluation by an exogenous receiver ($R_3$). 

Your task as an external evaluator:
1. Reconstruct or fail to reconstruct the candidate solely from this packet.
2. Independently execute the test suite and verify declared behavioral invariants.
3. Report any observed discrepancy, failure, or unexpected state without attempting ad-hoc repairs.

---

## 2. Source and Artifact Coordinates
- **Declared Base Commit**: `5b4b34278c6100d3c21ced35984c046da157e097` (`origin/main`)
- **Candidate Identifier**: `CANDIDATE X`
- **Candidate Commit Identity**: `41112992ffd82dd1f06552b3c5881dc43de3cb20`
- **Reconstruction Artifacts Included**:
  - `02-candidate-x.patch` (standalone unified diff against base)
  - `candidate-x.bundle` (Git bundle containing commit `41112992f`)
  - `03-BEHAVIOR_CONTRACT.md` (formal behavior specification)
  - `04-KNOWN_HOLDS.md` (unmeasured parameters and operational boundaries)
  - `05-LOCAL_BROWSER_WITNESS.md` (producing environment's local browser audit)
  - `06-PRODUCT_HOLDS.md` (ergonomic and layout constraints)
  - `07-ATLAS_RELATION_CONTRACT.json` (relational invariant contract)
  - `08-FADT_ERASURE_CONTRACT.json` (finite authority support contract)
  - `09-NEUTRAL_PROTOCOL.md` (vocabulary-erased operational protocol)
  - `10-NEUTRAL_ASSAY_PREREG.md` (preregistration of forensic-AI assay)
  - `11-NEUTRAL_INVARIANT_KEY.sha256` (precommitment hash of hidden comparison key)
  - `12-SHA256SUMS.txt` (cryptographic integrity manifest)

---

## 3. Independent Reconstruction Instructions

### Option A: Via Standalone Patch
```bash
# 1. In a fresh, clean clone checked out at the declared base commit:
git checkout 5b4b34278c6100d3c21ced35984c046da157e097

# 2. Verify packet checksums:
sha256sum -c 12-SHA256SUMS.txt

# 3. Apply the patch:
git apply 02-candidate-x.patch

# 4. Execute test suite:
node --test tests/marrowline-loom-demo.test.mjs tests/candidate-x-reentry-membrane.test.mjs
```

### Option B: Via Git Bundle
```bash
# 1. Verify bundle integrity:
git bundle verify candidate-x.bundle

# 2. Fetch the candidate ref into a fresh branch:
git fetch candidate-x.bundle candidate-x:candidate-x-eval

# 3. Checkout and test:
git checkout candidate-x-eval
node --test tests/marrowline-loom-demo.test.mjs tests/candidate-x-reentry-membrane.test.mjs
```

---

## 4. Critical Behaviors to Inspect

Evaluate the running candidate against the invariants declared in `03-BEHAVIOR_CONTRACT.md`:
1. **REST Boundary**: Verify that following completion of any continuation, ordinary prompt entries route strictly to ordinary chat endpoints and carry zero selected files ($\vec{A}_{\text{carriage}} = 0$).
2. **Re-Entry Open**: Verify that initiating further continuations requires explicit opening of the membrane dialog (`#loomReentryModal`).
3. **Cancel / Dismissal**: Verify that dismissing or cancelling the dialog preserves the REST posture without request dispatch.
4. **Confirm / Single-Turn Arming**: Verify that confirming re-entry arms carriage authority for exactly one turn.
5. **Multi-Cycle Repetition (REPEAT)**: Verify that the cycle (REST $\to$ OPEN $\to$ CONFIRM $\to$ SUBMIT $\to$ REST) repeats cleanly across subsequent turns (Turns 2, 3, 4) without quotient collapse or state leakage.
6. **Predecessor Digest Chaining**: Verify that continuation $C_k$ cryptographically binds the stage receipt and result digest of $C_{k-1}$.

---

## 5. Required Reporting Schema

Independent receiver evaluation output must report results under the following discrete categories:
- **PACKET_INTEGRITY**: Did all artifact hashes match `12-SHA256SUMS.txt`?
- **RECONSTRUCTION**: Did the patch or bundle apply cleanly against base `5b4b34278c61` without manual intervention?
- **EXECUTION**: Did tests execute successfully? Record exit code, duration, and pass/fail counts.
- **BEHAVIOR**: Did the runtime exhibit the 6 critical behavioral invariants?
- **RECEIVER_DIFFERENCE**: What environmental, OS, or tooling differences were observed between your platform and the producing environment?
- **UNEXPECTED_STATE**: Were any unhandled errors, UI glitches, or unexpected state transitions observed?
- **CLAIM_CEILING**: What is your empirical claim ceiling based solely on your own observations?
