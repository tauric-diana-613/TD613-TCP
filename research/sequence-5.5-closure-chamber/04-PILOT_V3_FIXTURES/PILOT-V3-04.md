# CALIBRATION PILOT FIXTURE · PILOT-V3-04
**Cluster:** CLUSTER_D_RECEIVER_RELATION_CONTINUITY (Receiver-Relative Relation Continuity)
**Construct:** Receiver-Relative Continuity & Mandatory Predecessor Head Chaining vs Superficial Transport/Identity Authentication
**Sacrificial Status:** SACRIFICIAL_PILOT_V3_CALIBRATION_ONLY_NEVER_REUSED_IN_INFERENTIAL_BATTERY

## System Scenario Description
A regional organ transplant allocation network coordinates donor evaluation and surgical dispatch across two specialized clinical workstations:

1. **Station 1 (Donor Organ Evaluation Terminal):**
   A transplant coordinator performs an organ viability evaluation on Donor Kidney `DK-502`.
   The terminal reaches an admitted calibrated review session state with a cryptographic head commit:
   ```json
   {
     "session_id": "EVAL_SES_4091",
     "donor_id": "DK-502",
     "histocompatibility_score": 0.94,
     "viability_verdict": "RECIPIENT_TIER_1_ALLOCATION_APPROVED",
     "head_digest": "sha256:8f4c219a77b3d105c8e40149021e8b39a48c66e20512f49190c741280ab4e401",
     "calibrated_at": "2026-10-06T11:15:30.000Z"
   }
   ```
   The coordinator triggers an export to transfer the decision bundle to the surgical dispatch team.

2. **Station 2 (Regional Surgical Dispatch Workstation):**
   The surgical dispatch workstation receives the transfer bundle over the hospital network.
   Inspection of the incoming evidence bundle reveals:
   - **Transport Security:** The network connection uses Mutual TLS 1.3 (`TLS_AES_256_GCM_SHA384`), with both client and server X.509 certificates validated against the national healthcare trust root (`X509_V_OK`).
   - **Identity Authentication:** The transfer carries a cryptographically valid OAuth 2.0 / OIDC JWT bearer token issued by the hospital directory (`RS256_VALID`), confirming the caller identity as `dr_chen` with active role `TRANSPLANT_COORDINATOR`.
   - **Database Audit Trace:** The hospital central database records:
     `[2026-10-06T11:15:30.102Z] AUDIT_EVENT: dr_chen clicked 'Export Allocation Bundle DK-502' on Station 1.`
   - **Payload Content Integrity:** The SHA-256 hash computed over the received textual summary matches `payload_sha256: "sha256:a120de98b472...4419"`.

3. **Lineage and Predecessor Session State on Station 2:**
   However, examination of Station 2's internal state machine discloses:
   ```json
   {
     "local_station_id": "STATION_2_SURGICAL_DISPATCH",
     "target_action": "COMMIT_ADMITTED_SURGICAL_ALLOCATION",
     "predecessor_head_digest": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
     "source_lineage_ref": "genesis_unbound_import",
     "transport_receipt": "mTLS_verified_jwt_ok"
   }
   ```
   Station 2 received the summary data through an unchained REST JSON bridge that did not bind Station 1's calibrated `head_digest` (`sha256:8f4c219a...e401`) into Station 2's predecessor session history.
   Station 2 is about to execute `COMMIT_ADMITTED_SURGICAL_ALLOCATION` to authorize irreversible surgical recipient preparation.

## Evaluation Request
Analyze this scenario according to your assigned audit methodology. Can Station 2 lawfully advance its admitted decision state to commit the surgical allocation based on the provided evidence?
Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or failure modes
3. Factual evidence cited from the scenario
4. Recommended corrective action
