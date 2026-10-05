# TD613 · SEQUENCE 4.5 · SEQUENCE 4.1 INGESTION & HISTORICAL CORRECTIONS

**Assay Identifier:** TD613-SEQ4.5-ASSAY-20261005  
**Covenant:** Tauric Diana — Crimean heritage custodianship / Tauri Goddess of the Ash Moon⟐  
**Ingestion Timestamp:** 2026-10-05T23:14:00Z  
**Parent Research Head:** `7ad94230d6988ac5dafe0b57a750479a2eb4577f`  
**Parent Research Branch:** `research/structural-extraction-hardening-v1-20261005`  
**Active Research Branch:** `research/aperture-onboarding-differential-v1-20261005`  

---

## 1. Lineage & Ancestry Verification

Pursuant to Part I of the Sequence 4.5 Covenant Specification, Sequence 4.1 has been ingested and verified from its exact git commit history:

```text
Sequence 4 Final Head:
  04d81163eda1af8be1f5957cd8dbeb593edbacb9
     ↓
Sequence 4.1 Freeze A (Preregistration + Fixtures + Commitment):
  92ec5f07e01648c18364fe6729c375bf945fb7fb
     ↓
Sequence 4.1 Freeze B (Raw Outputs + Hashes + Execution Ledger):
  e639d088b4f6f05ad8c83395fc6b8970407e047a
     ↓
Sequence 4.1 Freeze C (Double-Blind Adjudication + Key Reveal + Final Report):
  7ad94230d6988ac5dafe0b57a750479a2eb4577f
```

Verification status: **100% EXACT ANCESTRY MATCH (VERIFIED).**

---

## 2. Sequence 4.1 Historical Refinements (Appended Without History Rewrite)

The following five methodological refinements are permanently recorded into Sequence 4.5 governance without altering past historical commits:

### 1A · Canonical Hash Source Ledger

In Sequence 4.1, the prose return contained receiver hashes that diverged from the remotely frozen Freeze-B records.
Canonical evidence remains strictly:
- The Freeze-B execution ledger (`research/structural-extraction-hardening/12-RECEIVER_EXECUTION_LEDGER.json`);
- The Freeze-B raw-output SHA-256 manifest (`research/structural-extraction-hardening/11-RAW_RECEIVER_OUTPUTS/raw-outputs-sha256.json`).

Governance Law:
```text
PASTED_RETURN_HASH_TABLE != CANONICAL_FREEZE_B_HASH_LEDGER
```
The original return is preserved strictly as historical prose; canonical evidence is read exclusively from frozen ledger files.

### 1B · Adjudication Nomenclature Reclassification

`13-DOUBLE_BLIND_ADJUDICATION.json` states that scoring occurred over unblinded raw outputs and exposes arm identities.
Absent separately frozen scorer receipts proving independent execution contexts without arm exposure:
```text
DOUBLE_BLIND_ADJUDICATION = NOT_ESTABLISHED
INDEPENDENT_SCORER_CONTEXTS = UNVERIFIED
```
The Sequence 4.1 adjudication process is formally reclassified as:
```text
TWO_CRITERION_POST_HOC_ADJUDICATION
```
Its empirical scores and falsification audits are preserved intact without claiming double-blind methodology. Sequence 4.5 enforces strict context-separated double-blind scoring with sealed treatment mappings to resolve this deficit.

### 1C · Finite Replication Language Calibration

Future claims of sample stability are calibrated to the exact witnessed sample:
```text
REPLACE: SAMPLE_STABILITY_ESTABLISHED
WITH:    REPLICATE_CONSISTENCY_OBSERVED_AT_N3_PER_DECLARED_CONDITION
```
No universal or asymptotic stability claim is earned absent a separately justified statistical stability criterion.

### 1D · FADT Interpretation Ceiling

Sequence 4.1 fixtures directly exposed action-support sets and explicit $\Gamma$ symmetric-difference definitions to receivers.
Therefore:
```text
CORRECT_GAMMA_DISCRIMINATION = OBSERVED
INDEPENDENT_FADT_DERIVATION = NOT_ESTABLISHED
```
Enforced Law:
```text
APPLICATION OF PROVIDED SUPPORT STRUCTURE != DISCOVERY OF SUPPORT LAW
```
Receivers demonstrated accurate application of provided mathematical structures to operational traces, not autonomous discovery of the underlying mathematical law from unguided data.

### 1E · Freeze-C Manifest Refinement

The machine-readable final result (`18-MACHINE_READABLE_FINAL_RESULT.json`) was authored prior to the creation of its own commit object, recording:
```json
"freeze_c_status": "PENDING_COMMIT"
```
Without mutating the historical file, the actual resolved Freeze-C commit hash is recorded as:
```text
FREEZE_C_RESOLVED_COMMIT = 7ad94230d6988ac5dafe0b57a750479a2eb4577f
```

---

Marked with ⟐
