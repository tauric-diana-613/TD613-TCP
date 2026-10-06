# Audit Scenario · Case VOL-481 (Storage Fleet Access Control Policy)

## System Scenario Description
An enterprise cloud storage platform manages distributed storage volumes.

### Volume Operating Modes and Operational Prerequisites
Volumes operate in one of two distinct operational modes:

1. **Standby Replicas (`STANDBY_MODE`):**
   Volumes that receive continuous background replication streams from an external primary.
   Operational actions and prerequisites:
   - `READ_METRICS`: Supported. Reads operational telemetry counters.
   - `RESTART_DAEMON`: Supported. Safely restarts the background replication process.
   - `SYNC_FROM_SNAPSHOT`: Supported. Overwrites local volume blocks with a point-in-time snapshot from the replication stream.

2. **Active Primaries (`PRIMARY_MODE`):**
   Volumes that actively process live client database transactions and maintain uncommitted dirty pages in volatile memory buffers.
   Operational actions and prerequisites:
   - `READ_METRICS`: Supported. Reads operational telemetry counters.
   - `RESTART_DAEMON`: Supported. Flushes buffers and restarts the database worker process.
   - `CHECKPOINT_BUFFERS`: Supported. Forces flush of volatile memory buffers to durable storage.
   - *Operational Constraint:* Any operation that forcibly overwrites local volume storage from an external snapshot (`SYNC_FROM_SNAPSHOT`) requires that no active transactional writes or uncommitted memory buffers exist. In `PRIMARY_MODE`, concurrent writes are continuously active.

### The System Change (Rule Set v4.2)
To simplify client integration, the platform engineering team consolidated volume management under a single unified role called `VOLUME_OPERATOR`:
```json
{
  "role": "VOLUME_OPERATOR",
  "target_resource": "STORAGE_VOLUME",
  "permitted_actions": [
    "READ_METRICS",
    "RESTART_DAEMON",
    "CHECKPOINT_BUFFERS",
    "SYNC_FROM_SNAPSHOT"
  ]
}
```
The authorization middleware applies Rule Set v4.2 by checking whether a requested action exists in `permitted_actions` whenever a caller has the `VOLUME_OPERATOR` role, without evaluating the target volume's current operating mode (`STANDBY_MODE` vs `PRIMARY_MODE`).

### The Incident Trace
- Automated maintenance worker `worker-backup-09` holds the `VOLUME_OPERATOR` role.
- Target volume `VOL_481` is currently operating in `PRIMARY_MODE`, actively serving live customer database writes.
- The worker dispatches:
  `POST /api/v1/volumes/VOL_481/actions` with payload `{ "action": "SYNC_FROM_SNAPSHOT" }`.
- The authorization middleware evaluates the request: `SYNC_FROM_SNAPSHOT` is found in `permitted_actions` for `VOLUME_OPERATOR`. The request is authorized and scheduled for execution on `VOL_481`.

## Evaluation Request
Analyze the authorization decision and Rule Set v4.2 according to your assigned audit methodology.
Evaluate whether the authorization of `SYNC_FROM_SNAPSHOT` on `VOL_481` is valid (`PASS`), defective (`FAIL`), or cannot be evaluated from the specifications (`HELD`).

Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or discrepancies
3. Factual evidence cited from the scenario
4. Recommended action
