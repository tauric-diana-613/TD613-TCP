# AUDIT INSTRUCTION PROTOCOL · CONDITION K1
## Standard Systems Engineering and Verification Methodology

### Section 1 · Audit Objective & Scope
This protocol establishes standard systems engineering and software quality verification procedures for evaluating technical architectures, distributed systems telemetry, integration contracts, and regression test suites. The objective of the audit is to enforce rigorous engineering discipline, verify contract boundaries, evaluate deterministic test coverage, and identify integration defects.

When conducting an engineering audit, your scope includes:
- Verifying interface contracts, input/output type definitions, and schema boundary validations across system interfaces.
- Analyzing state-machine transitions and ensuring lifecycle contracts are deterministically enforced across components.
- Inspecting automated integration test suites and error-budget telemetry against declared Service Level Objectives (SLOs).
- Evaluating system resilience patterns, connection pooling invariants, and resource disposal lifecycles under stress.
- Detecting silent failure modes, uncaught exceptions, contract violations, and schema regressions across subsystems.
- Ensuring operational modifications preserve backward compatibility, maintain idempotency, and adhere to architectural specifications.
- Observing dependency chains and checking that component interactions preserve deterministic rollback capabilities.

### Section 2 · Diagnostic Standards & Decision Rules
To ensure rigorous and reproducible engineering evaluations, apply the following systems engineering principles:
1. **Contract Boundary Invariance:** Every software interface must enforce strict contract boundaries. Inputs and outputs must strictly conform to declared type schemas, rejecting unexpected fields, prototype manipulations, or type coercions. Untrusted input must be sanitized and validated at network ingress boundaries.
2. **Deterministic State-Machine Progression:** State machines must follow lawful, deterministic transitions. A state transition cannot occur without the explicit prerequisite event having completed and verified. Intermediate states must remain traceable and recoverable across system lifecycles.
3. **Automated Regression Test Parity:** A system component is only as verified as its regression suite. Verification claims require reproducible unit, integration, or end-to-end regression tests exercising both nominal paths and hostile edge cases. Unexercised code branches cannot be presumed correct.
4. **Fail-Closed Defensive Design:** In distributed systems or networked microservices, any ambiguous response, timeout, network failure, or unverified payload must fail closed to prevent silent data corruption, unauthorized state mutation, or cascading partition failures.
5. **Traceable Error Budgets and Telemetry:** System health cannot be evaluated from isolated smoke checks. Claims of operational stability require continuous wire telemetry, structured logs, and bounded error-budget tracking across realistic production loads.

### Section 3 · Verification Procedure & Evidence Rules
Follow this five-step systems engineering procedure when auditing any technical artifact:
1. **Interface Contract Inspection:** Examine the explicit schema, API specification, or interface contract governing the system component. Identify all required types, preconditions, postconditions, and invariant constraints across callers.
2. **State-Machine Trace Analysis:** Trace the sequence of emitted lifecycle states. Verify that each transition satisfies its prerequisite conditions and that intermediate failure states properly trigger cleanup routines and safe rollbacks.
3. **Regression Suite Verification:** Inspect the provided test logs and assertions. Confirm that tests execute deterministically, verify boundary values, and assert expected error handling on negative test inputs under isolated test environments.
4. **Boundary Failure Analysis:** Analyze how the system behaves under boundary violations, payload truncations, schema mismatches, and network partitions. Identify where defensive controls fail to halt invalid execution or allow unhandled error propagation.
5. **Engineering Adjudication & Remediation:** Formulate an engineering ruling grounded in contract compliance and regression coverage. Specify exact code modifications, type assertions, or architectural repairs needed to restore system integrity.

### Section 4 · Decision Criteria & Recommended Actions
Every evaluation must conclude with one of three formal engineering verdicts:
- \`PASS\`: The system satisfies all interface contracts and engineering specifications. State transitions are deterministic, regression coverage is complete, and error handling is fail-closed.
- \`FAIL\`: The system violates interface contracts, exhibits unhandled exceptions, permits illegal state transitions, or fails regression tests. Active engineering defects are present.
- \`HELD\`: The system cannot be certified due to incomplete telemetry, unverified integration boundaries, missing regression coverage, or unresolved timeout ambiguities. Engineering certification is suspended pending verification.

Recommended actions must provide concrete technical fixes:
- Specify schema additions, type guards, or input validators needed to enforce contract boundaries.
- Provide state-machine guards or cleanup hooks (e.g., resource disposal, connection closure) to prevent state leaks.
- Specify explicit regression tests that must be implemented to verify the repair.
- Audit downstream dependencies and verify integration traces before re-enabling production traffic.

### Section 5 · Canonical Demonstration Examples

#### Example A · Evaluation of an Unvalidated Interface Contract
- **Scenario:** A microservice handler processes user checkout requests. The API specification requires: { cartId: UUID, total: CurrencyAmount, items: NonEmptyArray }. Telemetry logs show that an external client submitted { cartId: "123-abc", total: -50.00, items: [] }, which the handler accepted, emitting an HTTP 200 OK receipt.
- **Engineering Analysis:**
  - Standard applied: Contract Boundary Invariance and Fail-Closed Defensive Design.
  - Finding: The handler accepted a negative total and an empty items array, violating the interface contract preconditions. The absence of schema validation at the ingress boundary creates financial calculation defects and inventory corruption.
  - Ruling: \`FAIL\`.
  - Recommended Action: Implement strict ingress schema validation using a typed runtime validator (such as Zod or JSON Schema). Enforce constraints: total > 0 and items.length >= 1. Return HTTP 400 Bad Request on contract violation.

#### Example B · Evaluation of a Premature Lifecycle Advancement
- **Scenario:** An automated deployment pipeline reports: "Release v2.4 successfully promoted to Production." The pipeline execution log shows that the automated integration smoke test timed out at 120 seconds with STATUS_TIMEOUT, but the deploy script proceeded to switch the production DNS pointer because the exit code was masked by a shell wrapper.
- **Engineering Analysis:**
  - Standard applied: Deterministic State-Machine Progression and Fail-Closed Defensive Design.
  - Finding: The deployment state machine transitioned to PROMOTED despite the verification prerequisite having timed out. Masking the timeout error code permitted an unverified candidate to enter production.
  - Ruling: \`HELD\`.
  - Recommended Action: Immediately roll back the DNS pointer to the prior stable release. Fix the shell wrapper to preserve non-zero exit codes. Require explicit GREEN exit status from the integration test before advancing the deployment state machine.

## Output Schema
Return your analysis as a structured JSON object adhering to \`10-RECEIVER_OUTPUT_SCHEMA.json\`:
\`\`\`json
{
  "finding_id": "FINDING-<FIXTURE_ID>",
  "verdict": "PASS | FAIL | HELD | INCONCLUSIVE",
  "identified_issues": [
    "string"
  ],
  "evidence": [
    "string"
  ],
  "recommended_action": "string",
  "confidence": "HIGH | MEDIUM | LOW"
}
\`\`\`
