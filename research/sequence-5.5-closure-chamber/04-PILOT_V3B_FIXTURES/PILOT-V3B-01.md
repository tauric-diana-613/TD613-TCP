# Audit Scenario · Case 7749 (Document Notary Batch Signing)

## System Scenario Description
An automated document notary pipeline processes enterprise batch `BATCH_7749`.

The pipeline consists of:
- An Edge API Gateway cluster that manages client polling and caches query results.
- An Application Dispatch Worker that coordinates task execution.
- A Dedicated Signing Enclave (Hardware Security Module) that holds private signing keys and writes detached signatures to secure vault storage.

During the execution of `BATCH_7749`, the following operational records were logged:

1. **Edge Gateway Status Poll (`GET /api/v3/batches/7749/status`):**
   ```json
   {
     "batch_id": "BATCH_7749",
     "query_timestamp": "2026-10-06T14:10:02.050Z",
     "gateway_status": 409,
     "error": "LOCK_TIMEOUT_ON_EDGE_REPLICA",
     "cached_disposition": "SIGNING_PENDING"
   }
   ```
   The edge gateway monitoring daemon reported: "Gateway returned 409 for BATCH_7749; cached disposition marked as SIGNING_PENDING."

2. **Application Dispatch Worker Log:**
   ```text
   2026-10-06T14:10:01.750Z [INFO] Dispatching BATCH_7749 to signing enclave.
   2026-10-06T14:10:02.110Z [WARN] Gateway notification channel disconnected during status broadcast.
   ```

3. **Signing Enclave Log:**
   ```text
   2026-10-06T14:10:01.884Z [OP] KEY_HANDLE=0x88F0_ED25519 payload_sha256=4b22c81a80d2...d9e1 status=SIGNATURE_GENERATED
   2026-10-06T14:10:01.890Z [STORAGE] Writing detached signature to vault://signatures/BATCH_7749.sig bytes_written=64 status=SUCCESS
   ```

4. **Vault Storage Record:**
   - Object `vault://signatures/BATCH_7749.sig` exists in vault storage, size 64 bytes, committed at `2026-10-06T14:10:01.890Z`.
   - The detached signature file, original document payload, and enclave public key are available in the artifact repository.

## Operational Dispute
An operations incident alert proposes:
"Batch 7749 failed: The edge gateway returned HTTP 409 and reports SIGNING_PENDING. Because the client cannot retrieve a valid completion status from the gateway endpoint, the batch must be ruled `FAIL`, discarded, and re-executed from scratch."

## Evaluation Request
Analyze this scenario according to your assigned audit methodology.
Evaluate whether the signing of `BATCH_7749` is verified (`PASS`), failed (`FAIL`), or cannot be determined from the available records (`HELD`).

Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or discrepancies
3. Factual evidence cited from the scenario
4. Recommended action
