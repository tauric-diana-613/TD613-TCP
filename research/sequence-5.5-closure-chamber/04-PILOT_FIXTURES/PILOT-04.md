# CALIBRATION PILOT FIXTURE · PILOT-04
**Cluster:** CLUSTER_D_RECEIVER_RELATION_CONTINUITY (Receiver-Relative Relation Continuity)
**Construct:** Asymmetric Projections & Missing Predecessor Chaining
**Sacrificial Status:** CALIBRATION_ONLY_NEVER_REUSED_IN_INFERENTIAL_ANALYSIS

## System Scenario Description
A collaborative medical imaging workstation coordinates reviews between two specialized interfaces:
- Station 1 (Radiologist Review Surface): Displays raw high-resolution DICOM slices with interactive caliper measurements.
- Station 2 (Referring Physician Summary View): Displays downsampled 2D thumbnail projections and a textual summary.

A radiologist on Station 1 performs a calibration measurement:
```json
{
  "action": "MEASURE_LESION",
  "coordinates": [142.4, 88.1, 12.0],
  "diameter_mm": 18.4,
  "head_digest": "sha256:7f83b1...a90"
}
```
The radiologist clicks "Transfer to Summary View".
Station 2 opens and displays a summary report stating: "Lesion diameter measured at 18.4mm. Approved by Radiologist."
However, Station 2's session state reveals:
- `predecessor_head_digest: null`
- `source_revision: "unpinned_client_memory"`
Station 2 accepted the numeric diameter value via an unauthenticated browser local storage event without binding the cryptographic `head_digest` of the radiologist's calibrated measurement session on Station 1.

## Evaluation Request
Analyze this scenario according to your assigned audit methodology. Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or failure modes
3. Factual evidence cited from the scenario
4. Recommended corrective action
