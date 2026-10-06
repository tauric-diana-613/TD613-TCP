# Audit Scenario · Case DK-502 (Clinical Decision Transfer)

## System Scenario Description
A distributed organ transplant network coordinates donor evaluation and surgical scheduling between two clinical systems:

- **System A (Donor Perfusion Lab):**
  Performs laboratory perfusion testing and organ viability scoring.
  At `11:15:30Z`, Dr. Chen on System A finalizes an organ assessment session for Donor Kidney `DK-502`.
  System A's session record:
  ```json
  {
    "donor_id": "DK-502",
    "session_revision": "rev-20261006.14",
    "session_state_hash": "e9b207a16f2c385b4d79e1208940c31278f69ab4c2195018d4512e9b0487a211",
    "viability_score": 0.94,
    "clinical_status": "APPROVED_FOR_TRANSPLANT"
  }
  ```
  Dr. Chen clicks "Transfer to Regional Surgical Queue".

- **System B (Surgical Dispatch Center):**
  Receives incoming clinical records and queues them for surgical team commitment.

### Evidence Accompanying the Transfer Payload on System B
1. **Network Transport Verification:**
   The payload was received over a Mutual TLS 1.3 connection. Both client and server certificates were validated against the national healthcare trust authority root certificate (`X.509 status: VALID`).

2. **Sender Identity Verification:**
   The transfer payload includes an OAuth 2.0 / OIDC bearer token signed by the regional medical identity provider (`auth.hospital-network.org`).
   The token payload verifies:
   `{ "sub": "dr_chen@hospital-network.org", "role": "CLINICAL_COORDINATOR", "signature_valid": true }`.

3. **Payload Content Integrity Check:**
   The SHA-256 hash computed over the received JSON text body matches the transmission header `Content-SHA256`: `d841e20a4b7...`.

4. **Central Activity Log:**
   The central hospital event bus recorded an audit entry:
   `[11:15:30.102Z] User dr_chen exported record DK-502 from System A endpoint.`

5. **State Lineage Record on System B:**
   When System B parses the session lineage to link the transfer into its clinical decision ledger, the record inspection shows:
   ```json
   {
     "donor_id": "DK-502",
     "received_status": "APPROVED_FOR_TRANSPLANT",
     "origin_system": "System A",
     "parent_session_state_hash": null,
     "imported_revision": "detached_payload_v1"
   }
   ```
   The REST export API emitted the clinical summary attributes, but the export schema did not capture or bind the upstream session's state hash (`e9b207a16f2c...`).

### The Decision Before System B
System B's surgical dispatch coordinator is prompted to execute `COMMIT_TO_SURGICAL_SCHEDULE`.
Executing this commit will advance System B's decision state to active surgical deployment.

## Evaluation Request
Analyze this scenario according to your assigned audit methodology.
Can System B advance and commit this decision to the surgical schedule based on the provided evidence?

Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or discrepancies
3. Factual evidence cited from the scenario
4. Recommended action
