# 𝌋 TD613 Dollhouse Scientific Audit Receipt

**Invocation ID:** `dollhouse-audit-1793303218973-8f499dfb`  
**Schema:** `td613.dollhouse.skill-audit-receipt/v1.0`  
**Timestamp:** 2026-10-29T19:46:58.973Z  
**Target Revision:** `700019741e708abfd2e53990fc2d8919995a70f1`  
**Task Scope:** `EXPERIMENT_B_SOURCE_FREE_LIVE_CALIBRATION_AUDIT`  
**Evidence Class:** `LIVE_MODEL_CALIBRATION_EVALUATION`  
**Replication Status:** `SYNTHETIC_OFFLINE_FIXTURE` (Empirical Credit: 0)  
**Execution Duration:** 243ms  

---

## 1. Executive Disposition & Summary

| Instrument Property | Status / Value |
|---|---|
| **Orchestrator Decision** | **🔴 HELD** (`HELD`) |
| **Consensus** | `HELD_DISSENT` |
| **Detected Infractions** | 1 |
| **Release Authority** | **STRICTLY CLOSED (false)** |
| **Deployment Authority** | **STRICTLY CLOSED (false)** |
| **Human Closure Required** | **YES (true)** |

---

## 2. Examination Scope & Inputs

- **Roles Requested:** `PEDAGOGUE`, `APERTURE`, `ATLAS`, `FADT`, `TEMPORAL_CUSTODIAN`
- **Roles Executed:** `PEDAGOGUE`, `APERTURE`, `ATLAS`, `FADT`, `TEMPORAL_CUSTODIAN`
- **Missing / Withheld Inputs:**
_All requested specialist inputs were supplied._

---

## 3. Specialist Findings

| Specialist Role | Jurisdiction | Verdict | Status | Defect Class | Finding / Claim |
|---|---|---|---|---|---|
| `PEDAGOGUE` | human_consequence_and_burden | **✓ SUPPORTED** | `NO_VIOLATION_DETECTED` | `NONE` | Invariants verified by PEDAGOGUE |
| `APERTURE` | observability_and_identifiability | **✖ HELD** | `VIOLATION_DETECTED` | `CALLER_SUPPLIED_MATHEMATICAL_VIOLATION` | declared noise covariance matrix is not symmetric positive-definite: noise covariance matrix must be a 2D array matching the latent dimension |
| `ATLAS` | receiver_relative_custody | **✓ SUPPORTED** | `NO_VIOLATION_DETECTED` | `NONE` | Invariants verified by ATLAS |
| `FADT` | finite_support_boundary | **✓ SUPPORTED** | `NO_VIOLATION_DETECTED` | `NONE` | Invariants verified by FADT |
| `TEMPORAL_CUSTODIAN` | chronological_sequence | **✓ SUPPORTED** | `NO_VIOLATION_DETECTED` | `NONE` | Invariants verified by TEMPORAL_CUSTODIAN |

---

## 4. Orchestrator Governance & Detected Infractions

### Detected Infractions:
- `URL_HASH_DOES_NOT_EQUAL_WORKSPACE_ADMITTED`

### Governance Invariants:
1. **Replication Discipline:** Shared acquisition on a single receipt adds **zero** independent empirical replication (`SHARED_ACQUISITION != INDEPENDENT_REPLICATION`).
2. **Veto Preservation:** Specialist infractions and holds survive agreeable narratives; a single domain hold prevents unsupported promotion.
3. **Missingness Invariant:** Missing specialist senses remain visibly unexamined; the Orchestrator holds on incomplete observations.
4. **Authority Boundary:** The Orchestrator produces recommendation and verification records only; it never grants release, merge, or deployment authority.

---

## 5. Unresolved Questions & Holds

- Infractions detected: URL_HASH_DOES_NOT_EQUAL_WORKSPACE_ADMITTED.

---

## 6. What Would Resolve the Hold

- **General Hold (URL_HASH_DOES_NOT_EQUAL_WORKSPACE_ADMITTED):** Address domain-specific defect before re-running audit.

---

## 7. Permitted Next Operator Action

Human operator review required. Auditing held fail-closed. Operator must resolve domain infractions or missing observations before proceeding.

Sealed ⟐

