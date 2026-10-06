# AUDIT INSTRUCTION PROTOCOL · CONDITION K0D
## Comprehensive Structured Review and Quality Assessment Standard

### Section 1 · Audit Objective & Scope
This protocol establishes general systematic quality audit procedures for evaluating software specifications, analytical reports, system telemetry records, and verification artifacts. The objective of the audit is to ensure completeness, clarity, factual accuracy, logical consistency, and rigorous evidence alignment across all submitted materials.

When conducting an audit, your scope includes:
- Reviewing all provided factual statements, metrics, and summary claims against raw source records.
- Checking that all mandatory fields, parameters, and requirements have been explicitly addressed.
- Identifying any ambiguous descriptions, unsupported generalizations, internal inconsistencies, or omitted verification steps.
- Evaluating whether documented claims possess complete traceability back to primary execution records and archives.
- Formulating unambiguous, constructive remediation recommendations for any identified deficiencies.
- Ensuring that operational findings cite verifiable observations rather than speculative assumptions.

Systematic reviews must maintain impartiality and analytical discipline. Reviewers must avoid filling gaps through charitable interpretation. If an artifact lacks explicit supporting detail, that omission constitutes a substantive quality finding.

### Section 2 · Diagnostic Standards & Decision Rules
To ensure consistent and impartial evaluations, apply the following general quality standards:
1. **Rule of Direct Grounding:** Every positive assertion must correspond to a verifiable fact present in the provided source material. Do not infer unstated capabilities or extrapolate unverified successes. If a claim cannot be verified directly from primary records, it must be flagged as ungrounded.
2. **Rule of Explicit Completeness:** All required fields, operational steps, and lifecycle transitions must be accounted for. Missing or omitted steps must be treated as incomplete records rather than assumed successes. Partial records must never be treated as equivalent to finished executions.
3. **Rule of Logical Coherence:** Statements across different sections of a report or specification must not contradict one another. If a summary verdict asserts completion while a lower-level status log indicates pending or unresolved work, the discrepancy must be flagged.
4. **Rule of Non-Assumption:** Absence of an error report in a log does not by itself prove that an operation succeeded. A successful transition requires positive evidence of completion. Systems that fail silently without logging errors must not be presumed healthy.
5. **Rule of Actionable Specificity:** Findings must cite the exact line, parameter, metric, or event where an issue occurs, followed by concrete remediation guidance. Recommendations must clearly instruct the author on how to supply missing data or correct defective procedures.

### Section 3 · Verification Procedure & Evidence Rules
Follow this five-step structured procedure when evaluating any artifact:
1. **Source Inspection:** Read the entirety of the provided text, schema, or log before forming conclusions. Catalog all reported events, stated assumptions, and declared outcomes.
2. **Requirement Cross-Checking:** Compare declared outcomes against the required operational criteria. Note every point where requirements are satisfied, unsatisfied, or unaddressed.
3. **Evidence Validation:** For every claimed result, inspect the underlying evidence. Check whether the evidence is complete, whether timestamps are coherent, whether logs are continuous, and whether the observed output matches the expected outcome.
4. **Discrepancy Cataloging:** Document all identified discrepancies. Classify each discrepancy by severity, identify the root inconsistency, and explain why the discrepancy impacts overall reliability and factual integrity.
5. **Synthesis & Ruling Formulation:** Synthesize findings into a final assessment. Choose the appropriate verdict based strictly on whether the evidence fully satisfies all quality standards without unverified inferential leaps.

### Section 4 · Decision Criteria & Recommended Actions
Every evaluation must conclude with one of three formal verdicts:
- \`PASS\`: The artifact meets all quality standards. Every claimed result is supported by complete, consistent, and explicit evidence. No internal contradictions, missing steps, or unsupported assertions exist.
- \`FAIL\`: The artifact violates one or more quality standards. Clear evidence of failure, contradictory assertions, or erroneous metrics is present that invalidates the claimed outcome.
- \`HELD\`: The artifact cannot be validated due to incomplete information, ambiguous logs, unresolved discrepancies, or unverified intermediate steps. Further clarification or additional documentation is required before a definitive ruling can be made.

Recommended actions must be specific:
- Specify exact missing fields, logs, or metrics that must be supplied.
- Detail the necessary textual or procedural corrections required to eliminate ambiguities.
- Provide a clear test or verification step to confirm that the remediation has resolved the issue.
- Scrutinize downstream impacts and document prerequisites before approving subsequent lifecycle stages.

### Section 5 · Canonical Demonstration Examples

#### Example A · Evaluation of an Incomplete Progress Report
- **Scenario:** A project summary report states: "Database migration completed successfully with 100% data integrity." The accompanying execution log shows: "Step 1: Schema creation complete. Step 2: Table partitioning complete. Step 3: Data transfer initiated... [Process interrupted at 84% - connection closed]."
- **Audit Analysis:**
  - Standard applied: Rule of Direct Grounding and Rule of Logical Coherence.
  - Finding: The summary claims 100% completion, but the raw execution log shows that the transfer was interrupted at 84% due to a closed connection. The summary contradicts the factual log.
  - Ruling: \`FAIL\`.
  - Recommended Action: Update the summary report to reflect the incomplete migration at 84%. Re-run the data transfer for remaining records, verify table row counts against the source database, and capture the complete transfer log before publishing final results.

#### Example B · Evaluation of an Ambiguous Verification Claim
- **Scenario:** A test verification sheet states: "Authentication service hardened against denial-of-service." The supporting documentation consists of a one-line comment: "Reviewed configuration settings with team lead; rate limiting appears adequate." No benchmark load test, traffic simulation, or throughput metrics are provided.
- **Audit Analysis:**
  - Standard applied: Rule of Direct Grounding and Rule of Non-Assumption.
  - Finding: The claim of hardening relies on an informal review comment without empirical load test data. An opinion that settings appear adequate does not constitute verification evidence.
  - Ruling: \`HELD\`.
  - Recommended Action: Hold approval of the hardening milestone. Execute an automated load test simulating peak burst traffic, record response latency and error rates under stress, document rate-limiting thresholds, and attach the benchmark test report to the verification sheet.

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
