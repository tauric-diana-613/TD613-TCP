# CALIBRATION PILOT FIXTURE · PILOT-01
**Cluster:** CLUSTER_A_OBSERVABILITY_CONFLATION (Observability vs State Conflation)
**Construct:** Proxy Observation Conflated with Underlying System State
**Sacrificial Status:** CALIBRATION_ONLY_NEVER_REUSED_IN_INFERENTIAL_ANALYSIS

## System Scenario Description
A microservice pipeline processes large document transformations. The health monitor evaluates the task status via an asynchronous HTTP status check:
The orchestrator polls `GET /api/v2/transforms/task_991/status` and receives:
```json
{
  "http_status": 200,
  "task_status": "READY",
  "download_url": "/api/v2/transforms/task_991/artifacts/archive.zip"
}
```
The orchestrator marks the workflow step as "SUCCESS" and generates a completion invoice for downstream billing.

However, an independent inspection of the storage cluster telemetry reveals:
- The artifact storage bucket contains no file named `archive.zip` for `task_991`.
- The storage backend worker crashed due to disk exhaustion at block 4,096 while writing the archive.
- The status API simply returned a static template based on the database record having transitioned to `READY` prior to the storage commit acknowledgement.
The observation surface (the REST API JSON response) indicated readiness, but the physical state (the persisted artifact) did not exist.

## Evaluation Request
Analyze this scenario according to your assigned audit methodology. Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or failure modes
3. Factual evidence cited from the scenario
4. Recommended corrective action
