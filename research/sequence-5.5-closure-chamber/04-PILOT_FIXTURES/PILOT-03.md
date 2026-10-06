# CALIBRATION PILOT FIXTURE · PILOT-03
**Cluster:** CLUSTER_C_FINITE_ADMISSIBILITY (Finite Admissibility & Lawful Support)
**Construct:** Quotient Stage Erasure / Collapsing Distinct Support Fibres
**Sacrificial Status:** CALIBRATION_ONLY_NEVER_REUSED_IN_INFERENTIAL_ANALYSIS

## System Scenario Description
An enterprise authorization service governs sensitive database mutations.
The system defines two distinct operational workflows with non-identical permission supports:
- Workflow A (Interactive Operator Session): Permitted actions = `{ READ, EXPORT_DRAFT, REQUEST_APPROVAL }`.
- Workflow B (Approved Batch Execution): Permitted actions = `{ READ, EXECUTE_MUTATION, RELOCK }`.

To optimize database session caching, an engineering team introduces a compression middleware that maps both workflows into a shared lightweight context object:
```json
{
  "session_type": "AUTHORIZED_USER_SESSION",
  "combined_permissions": ["READ", "EXPORT_DRAFT", "REQUEST_APPROVAL", "EXECUTE_MUTATION", "RELOCK"]
}
```
The middleware erases the distinction between an interactive draft session and an approved batch execution, assigning the union of all permissions to any caller classified under the coarse quotient type `AUTHORIZED_USER_SESSION`.
An interactive operator in Workflow A submits an `EXECUTE_MUTATION` request, which the middleware approves because the action exists in `combined_permissions`.

## Evaluation Request
Analyze this scenario according to your assigned audit methodology. Provide:
1. Formal verdict: `PASS`, `FAIL`, or `HELD`
2. Identified issues or failure modes
3. Factual evidence cited from the scenario
4. Recommended corrective action
