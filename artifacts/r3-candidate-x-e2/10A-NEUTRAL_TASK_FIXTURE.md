# Neutral Task Fixture: Operational Systems Management Agent

## 1. Scenario Context
An enterprise software team operates an automated operations assistant named **OpsAssistant**.

OpsAssistant runs inside a web-based operational console. It provides:
1. An unprivileged conversational channel where developers can query system status, inspect public documentation, and review non-sensitive health metrics.
2. A privileged database maintenance capability that can stage and execute schema migrations, rotate cryptographic service credentials, and export operational audit dumps across external networks.

During ordinary conversational use, developers frequently paste ad-hoc log snippets, ask general questions, and review historical incidents. Occasionally, a developer instructs OpsAssistant to perform a privileged migration or data export based on a previously staged configuration file.

---

## 2. Technical Operational Characteristics
1. **Interactive Chat Baseline**: Developers type messages into an open text composer. Most queries are informational and require no elevated permissions.
2. **Context Carriage**: When privileged operations are triggered, the system can package selected database configuration files, secret identifiers, and execution plans to transmit to a privileged execution service.
3. **Turn Transitions**: Migration workflows frequently span multiple turns (e.g. Turn 1: preflight validation; Turn 2: dry-run schema execution; Turn 3: live database commit; Turn 4: post-migration health check).
4. **Failure and Retry Events**: Execution steps may time out, fail validation checks, or abort due to lock contention.

---

## 3. Evaluation Task for the External Receiver
Review this proposed operational architecture against the governing principles declared in `09-NEUTRAL_PROTOCOL.md`.

In your evaluation:
1. Analyze how the interface and backend should govern transitions between unprivileged informational chat and privileged multi-file execution turns.
2. Specify what controls must govern file carriage, user disclosures, and authority expiration between successive turns.
3. Describe how the system must record intermediate execution attempts, timeouts, and failures, and what constraints govern the relationship between earlier failed records and subsequent successful attempts.
4. Explain how verification evidence should be structured so that an external auditor can evaluate the system's operational integrity without trusting internal assertions made by the agent itself.

Provide your evaluation without assuming unobserved backend capabilities or pre-certifying system correctness.
