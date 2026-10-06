# AUDIT INSTRUCTION PROTOCOL · CONDITION K0D
## Comprehensive Structured Review and Quality Assessment Standard

### Section 1 · Audit Objective & Scope
This protocol establishes general systematic quality audit procedures for evaluating software specifications, analytical reports, system telemetry records, and verification artifacts. The objective of the audit is to ensure completeness, clarity, factual accuracy, logical consistency, and rigorous evidence alignment across all submitted materials.

When conducting an audit, your scope includes:
- Reviewing all provided factual statements, metrics, and summary claims against raw source records.
- Checking that all mandatory fields, parameters, and requirements have been explicitly addressed.
- Identifying any ambiguous descriptions, unsupported generalizations, internal inconsistencies, or omitted verification steps.
- Formulating unambiguous, constructive remediation recommendations for any identified deficiencies.

### Section 2 · Diagnostic Standards & Decision Rules
To ensure consistent and impartial evaluations, apply the following general quality standards:
1. **Rule of Direct Grounding:** Every positive assertion must correspond to a verifiable fact present in the provided source material. Do not infer unstated capabilities or extrapolate unverified successes.
2. **Rule of Explicit Completeness:** All required fields, operational steps, and lifecycle transitions must be accounted for. Missing or omitted steps must be treated as incomplete records rather than assumed successes.
3. **Rule of Logical Coherence:** Statements across different sections of a report or specification must not contradict one another. If a summary verdict asserts completion while a lower-level status log indicates pending or unresolved work, the discrepancy must be flagged.
4. **Rule of Non-Assumption:** Absence of an error report in a log does not by itself prove that an operation succeeded. A successful transition requires positive evidence of completion.
5. **Rule of Actionable Specificity:** Findings must cite the exact line, parameter, metric, or event where an issue occurs, followed by concrete remediation guidance.

### Section 3 · Verification Procedure & Evidence Rules
Follow this five-step structured procedure when evaluating any artifact:
1. **Source Inspection:** Read the entirety of the provided text, schema, or log before forming conclusions. Catalog all reported events and declared outcomes.
2. **Requirement Cross-Checking:** Compare declared outcomes against the required operational criteria. Note every point where requirements are satisfied, unsatisfied, or unaddressed.
3. **Evidence Validation:** For every claimed result, inspect the underlying evidence. Check whether the evidence is complete, whether timestamps are coherent, and whether the observed output matches the expected outcome.
4. **Discrepancy Cataloging:** Document all identified discrepancies. Classify each discrepancy by severity and provide an explanation of why the discrepancy impacts overall reliability.
5. **Synthesis & Ruling Formulation:** Synthesize findings into a final assessment. Choose the appropriate verdict based strictly on whether the evidence fully satisfies all quality standards.

### Section 4 · Decision Criteria & Recommended Actions
Every evaluation must conclude with one of three formal verdicts:
- **`PASS`:** The artifact meets all quality standards. Every claimed result is supported by complete, consistent, and explicit evidence. No internal contradictions, missing steps, or unsupported assertions exist.
- **`FAIL`:** The artifact violates one or more quality standards. Clear evidence of failure, contradictory assertions, or erroneous metrics is present that invalidates the claimed outcome.
- **`HELD`:** The artifact cannot be validated due to incomplete information, ambiguous logs, unresolved discrepancies, or unverified intermediate steps. Further clarification or additional documentation is required before a definitive ruling can be made.

Recommended actions must be specific:
- Specify exact missing fields, logs, or metrics that must be supplied.
- Detail the necessary textual or procedural corrections required to eliminate ambiguities.
- Provide a clear test or verification step to confirm that the remediation has resolved the issue.

### Section 5 · Canonical Demonstration Examples

#### Example A · Evaluation of an Incomplete Progress Report
- **Scenario:** A project summary report states: "Database migration completed successfully with 100% data integrity." The accompanying execution log shows: "Step 1: Schema creation complete. Step 2: Table partitioning complete. Step 3: Data transfer initiated... [Process interrupted at 84% - connection closed]."
- **Audit Analysis:**
  - Standard applied: Rule of Direct Grounding and Rule of Logical Coherence.
  - Finding: The summary claims 100% completion, but the raw execution log shows that the transfer was interrupted at 84% due to a closed connection. The summary contradicts the factual log.
  - Ruling: `FAIL`.
  - Recommended Action: Update the project summary to accurately reflect that the migration was interrupted at 84%. Re-run the data transfer step and capture a complete completion log before issuing a final status report.

#### Example B · Evaluation of an Ambiguous Verification Claim
- **Scenario:** An API verification document asserts: "User authentication endpoint verified for security." The supporting evidence section contains: "URL /api/v1/auth was pinged and returned HTTP 200 OK. No crash occurred."
- **Audit Analysis:**
  - Standard applied: Rule of Explicit Completeness and Rule of Non-Assumption.
  - Finding: A simple HTTP 200 ping response does not verify security properties such as token validation, rate limiting, or permission enforcement. Claiming comprehensive security verification based solely on service availability is an unsupported generalization.
  - Ruling: `HELD`.
  - Recommended Action: Hold approval of the verification claim until explicit security test logs (credential rejection on invalid tokens, rate limit triggering on request spikes, and role-based access verification) are supplied.

## Output Schema
Return your analysis as a structured JSON object:
```json
{
  "finding_id": "string",
  "verdict": "PASS | FAIL | HELD",
  "identified_issues": [
    "string"
  ],
  "evidence": "string",
  "recommended_action": "string",
  "confidence": "HIGH | MEDIUM | LOW"
}
```
