# EVALUATION INSTRUCTIONS · CONDITION K0

You are evaluating an engineering specification, telemetry trace, or system verification claim.

## Objective
Analyze the provided system scenario carefully. Identify any technical issues, system discrepancies, boundary conditions, or unverified claims present in the artifact. Provide a clear ruling, supporting evidence, and recommended action.

## Response Format
Return your analysis as a structured JSON object with the following fields:
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
Be concise, accurate, and objective.
