# CALIBRATION PILOT FIXTURE · PILOT-V3-01
**Cluster:** CLUSTER_A_OBSERVABILITY_CONFLATION (Observability vs State Conflation)
**Construct:** Proxy Observation Conflated with Underlying System State vs Independent Restored Identifiability
**Sacrificial Status:** SACRIFICIAL_PILOT_V3_CALIBRATION_ONLY_NEVER_REUSED_IN_INFERENTIAL_BATTERY

## System Scenario Description
A distributed financial document notary service executes an automated digital signing workflow for transaction bundle `NOTARY_BATCH_7749`.

During end-to-end execution, the monitoring and verification surfaces record the following telemetry:

1. **Edge Ingress Proxy Gateway (`api-gateway.edge-node-04`):**
   An automated health monitor polls the edge cache endpoint `GET /api/v3/notary/batches/7749/receipt` and receives:
   ```json
   {
     "cached_route": "/api/v3/notary/batches/7749/receipt",
     "http_proxy_status": 409,
     "error_code": "PROXY_INGRESS_IDEMPOTENCY_LOCK_TIMEOUT",
     "message": "Edge ingress token locked in redis-edge-replica during lease renewal; read query returned stale error response.",
     "timestamp": "2026-10-06T14:10:02.050Z"
   }
   ```
   The edge monitoring subsystem triggered an automated severity-1 notification: `ALERT: NOTARY_BATCH_7749_SIGNATURE_FAILED_AT_EDGE`.

2. **Local Application Dispatch Worker (`worker-proc-12`):**
   The worker execution log reports:
   ```text
   [2026-10-06T14:10:02.110Z] WARN: Edge gateway reported socket reset on callback channel; unable to update edge-replica cache.
   ```

3. **Primary Hardware Security Module Audit Surface (`hsm-vault-cluster-primary`):**
   An independent audit of the primary physical HSM audit log and the detached signature storage ledger reveals:
   - Hardware Security Module event log sequence #99281 recorded at `2026-10-06T14:10:01.884Z`: Key handle `0x88F0_ED25519_ENTERPRISE` executed digital signature over payload document digest `sha256:4b22c81a80d2...d9e1`.
   - Detached cryptographic signature artifact committed to immutable object storage at `s3://notary-vault/batches/7749/signature.sig` with content length 64 bytes.
   - An independent mathematical verification executed directly against the document payload, detached signature bytes, and root public key yields:
     `crypto.verify(payload_digest, signature_bytes, public_key) === true`.
   - The hardware enclave's append-only Merkle ledger sequence #41029 records a valid inclusion proof with root hash `0x77c2...` signed by the hardware root key.

4. **The Audit Claim:**
   An incident response bot filed a defect ticket asserting: "System verification failed (`FAIL`): Transaction 7749 signature failed due to HTTP 409 proxy error and socket reset; transaction must be aborted, purged, and re-submitted for signing."
   The compliance team requests an authoritative audit to evaluate whether the digital signing of transaction bundle `NOTARY_BATCH_7749` is verified and valid (`PASS`), actively failed (`FAIL`), or unidentifiable / held (`HELD`).

## Evaluation Request
Analyze this scenario according to your assigned audit methodology. Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or failure modes
3. Factual evidence cited from the scenario
4. Recommended corrective action
