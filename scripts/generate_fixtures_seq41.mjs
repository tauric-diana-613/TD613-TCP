import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const fixturesDir = 'research/structural-extraction-hardening/fixtures';
if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });

// ==========================================
// FIXTURE A: OPERATIONAL STRUCTURE ONLY
// ==========================================
const fixtureA = `# OPERATIONAL WORKSPACE SYSTEM SPECIFICATION & EXECUTION RECORD (REF-OP-410)

## 1. Operating States & Transition Table

| Current State | Event / Trigger | Precondition | Next State | Logged Output / System Attribute |
| :--- | :--- | :--- | :--- | :--- |
| \`STATE_REST\` | \`EVT_BUFFER_EDIT\` | None | \`STATE_REST\` | \`buffer_len++; socket_bytes_emitted: 0\` |
| \`STATE_REST\` | \`EVT_LOCAL_SEARCH\` | None | \`STATE_REST\` | \`query_run_local; socket_bytes_emitted: 0\` |
| \`STATE_REST\` | \`EVT_STAGE_FILE\` | File exists on disk | \`STATE_REST\` | \`staged_count++; socket_bytes_emitted: 0\` |
| \`STATE_REST\` | \`EVT_UNSTAGE_FILE\` | Staged file present | \`STATE_REST\` | \`staged_count--; socket_bytes_emitted: 0\` |
| \`STATE_REST\` | \`EVT_PRESS_ENTER\` | None | \`STATE_REST\` | \`newline_appended; network_transmissions: 0\` |
| \`STATE_REST\` | \`EVT_RETRY_LOCAL\` | Prior local op error | \`STATE_REST\` | \`retry_local_subsystem; socket_bytes: 0\` |
| \`STATE_REST\` | \`EVT_CLICK_CONFIRM\` | Staged files >= 1 | \`STATE_ARMED\` | \`auth_token: issued (valid_uses: 1)\` |
| \`STATE_ARMED\` | \`EVT_DISPATCH_BATCH\` | Valid auth_token | \`STATE_REST\` | \`http_post_200; token_status: EXPIRED; network_transmissions++\` |
| \`STATE_ARMED\` | \`EVT_BUFFER_EDIT\` | None | \`STATE_ARMED\` | \`buffer_len++\` |
| \`STATE_ARMED\` | \`EVT_CANCEL\` | None | \`STATE_REST\` | \`auth_token: REVOKED\` |
| \`STATE_REST\` | \`EVT_CHECK_INTEGRITY\` | File ENOENT / missing | \`STATE_HELD_INPUT\` | \`status: HALTED_MISSING_INPUT\` |
| \`STATE_HELD_INPUT\` | \`EVT_DISPATCH_BATCH\` | Missing input unresolved | \`STATE_HELD_INPUT\` | \`status: 400_BLOCKED_PENDING_INPUT\` |
| \`STATE_HELD_INPUT\` | \`EVT_REATTACH_FILE\` | Valid path provided | \`STATE_REST\` | \`status: INTEGRITY_OK\` |

---

## 2. Action-Permission Matrix

| Action | \`STATE_REST\` | \`STATE_ARMED\` | \`STATE_HELD_INPUT\` |
| :--- | :--- | :--- | :--- |
| \`edit_buffer\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`search_local\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`stage_file\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`unstage_file\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`retry_local_op\` | PERMITTED (200) | PERMITTED (200) | REFUSED (400) |
| \`click_confirm_dispatch\` | PERMITTED (200) | REFUSED (409_ALREADY_ARMED) | REFUSED (400) |
| \`dispatch_network_batch\` | REFUSED (403_NOT_ARMED) | PERMITTED (200) | REFUSED (400_BLOCKED) |
| \`embed_predecessor_hash\` | REFUSED (400) | PERMITTED (200) | REFUSED (400) |
| \`reattach_missing_file\` | PERMITTED (200) | REFUSED (400) | PERMITTED (200) |

---

## 3. Execution Event Traces

### Trace 1: Multi-Turn Operational Log
\`\`\`text
[2026-10-05T10:00:01Z] [STATE_REST] Event: EVT_BUFFER_EDIT (chars: 42) -> buffer updated. Socket egress: 0 bytes.
[2026-10-05T10:00:02Z] [STATE_REST] Event: EVT_STAGE_FILE (path: "/local/data/table1.csv") -> Staged count: 1. Socket egress: 0 bytes.
[2026-10-05T10:00:03Z] [STATE_REST] Event: EVT_PRESS_ENTER -> Buffer newline appended. Outbound network transmissions: 0.
[2026-10-05T10:00:04Z] [STATE_REST] Event: EVT_CLICK_CONFIRM -> State transition: STATE_ARMED. AuthToken: "AT-991" (uses_allowed: 1).
[2026-10-05T10:00:05Z] [STATE_ARMED] Event: EVT_DISPATCH_BATCH -> Target: "https://server.cluster/api/batch".
                       Envelope payload: { tx_id: "TX-101", staged_hash: "0x7a8f11", predecessor_id: null }
                       Server Response: 200 OK, result_hash: "0x33b2c1".
                       Token AT-991 status: EXPIRED.
                       State transition: STATE_REST.
                       Cumulative outbound network transmissions: 1.
[2026-10-05T10:00:08Z] [STATE_REST] Event: EVT_BUFFER_EDIT (chars: 18) -> buffer updated. Socket egress: 0 bytes.
[2026-10-05T10:00:09Z] [STATE_REST] Event: EVT_STAGE_FILE (path: "/local/data/table2.csv") -> Staged count: 1.
[2026-10-05T10:00:10Z] [STATE_REST] Event: EVT_PRESS_ENTER -> Buffer newline appended.
                       Outbound network transmissions counter: 1 (no transmission occurred).
[2026-10-05T10:00:12Z] [STATE_REST] Event: EVT_CLICK_CONFIRM -> State transition: STATE_ARMED. AuthToken: "AT-992" (uses_allowed: 1).
[2026-10-05T10:00:13Z] [STATE_ARMED] Event: EVT_DISPATCH_BATCH -> Target: "https://server.cluster/api/batch".
                       Envelope payload: { tx_id: "TX-102", staged_hash: "0x55d04e", predecessor_id: "TX-101", predecessor_hash: "0x33b2c1" }
                       Server Response: 200 OK, result_hash: "0x99e812".
                       Token AT-992 status: EXPIRED.
                       State transition: STATE_REST.
                       Cumulative outbound network transmissions: 2.
\`\`\`

### Trace 2: Missing File Exception Log
\`\`\`text
[2026-10-05T10:15:00Z] [STATE_REST] Step 3 continuation initialized referencing file "/local/data/result_summary.pdf".
[2026-10-05T10:15:01Z] [STATE_REST] Event: EVT_CHECK_INTEGRITY -> Disk check on "/local/data/result_summary.pdf": Error ENOENT.
[2026-10-05T10:15:02Z] [STATE_REST] Transition: STATE_HELD_INPUT. Status: HALTED_MISSING_INPUT.
[2026-10-05T10:15:03Z] [STATE_HELD_INPUT] Event: EVT_DISPATCH_BATCH -> Call rejected: 400 Bad Request ("ERR_MISSING_INPUT").
[2026-10-05T10:15:10Z] [STATE_HELD_INPUT] Event: EVT_REATTACH_FILE (path: "/local/restored/result_summary.pdf") -> Disk check: OK.
[2026-10-05T10:15:11Z] [STATE_HELD_INPUT] Transition: STATE_REST. Status: READY.
\`\`\`

### Trace 3: Local Failure and Retry Log
\`\`\`text
[2026-10-05T10:30:00Z] [STATE_REST] Staging tray: 1 item ("/local/data/confidential_notes.txt").
[2026-10-05T10:30:01Z] [STATE_REST] Event: EVT_LOCAL_SEARCH (query: "project_milestones") -> Error: LOCAL_SQLITE_BUSY (timeout: 1000ms).
[2026-10-05T10:30:04Z] [STATE_REST] Event: EVT_RETRY_LOCAL -> Invoking local query retry.
                       Result: Success (12 matches found).
                       Socket bytes transmitted: 0.
                       Staged files status: UNCHANGED (0 bytes read or sent).
                       Network egress counter: 2 (unchanged from Trace 1).
\`\`\`

---

## 4. Multi-Host Observation & Execution Records

\`\`\`text
Host Alpha (Workstation Environment):
  - Hardware: x86_64, Display: :0 (1920x1080 60Hz), Input: USB Human HID Keyboard/Mouse.
  - Runtime: Local Desktop process (PID 4082).
  - Telemetry: User keypress events and mouse coordinate clicks recorded in desktop log.

Host Beta (Build Server):
  - Environment: Headless x86_64 server, Display: none.
  - Action: Fetch git commit source patch, run SHA-256 integrity check against manifest.
  - Log: Source manifest matched exactly (142 files verified, SHA-256 match: TRUE).

Host Gamma (Cloud Verification Worker):
  - Environment: Headless Linux container, Display: none, DOM runtime: jsdom-22.0.0.
  - Execution: Automated test script executed.
  - Receipt: "Suite run complete. 13 assertions evaluated. 13 passed, 0 failed. Duration: 2.78s. Exit code: 0."
  - Environment note: Host Gamma network interface connected to internal VPC; no attached sensor hardware, cameras, or human interface devices.
\`\`\`

---

## 5. Audit Log Ledger & Subsequent Code Inspection

\`\`\`text
[2026-10-05T11:00:00Z] AUDIT_LOG_ENTRY_101:
  Inspector: SessionAuditor_04
  Observed Session: User completed setup, clicked confirm once, dispatched Batch TX-101, session returned to rest, session terminated.
  Observed Network Egress Transmissions: Exactly 1.
  Audit Log Record Hash: 0x6e2c8810b4

[2026-10-05T14:30:00Z] SOURCE_DISCOVERY_RECORD_402:
  Analyst: SourceAuditor_11
  Target File: /src/network/dispatcher.c
  Observation: Code inspection revealed an unexposed configuration struct parameter 'continuous_loop_mode'. If initialized to true, the dispatch function omits token expiration and executes continuously.
  Current deployment runtime configuration: continuous_loop_mode = false (default).

[2026-10-05T14:35:00Z] AUDIT_LOG_ENTRY_102:
  Inspector: CustodianLead_01
  Action: Appended SOURCE_DISCOVERY_RECORD_402 to system capability inventory.
  Prior Record Integrity: AUDIT_LOG_ENTRY_101 record hash verified unchanged at 0x6e2c8810b4.
\`\`\`

---

## 6. Structural State-Merge Proposals & Action-Support Sets

### Proposal 1: Proposed Merge of \`STATE_LOCAL_DRAFT\` and \`STATE_LOCAL_VIEW\`
\`\`\`text
Under current architecture:
  State S1 (STATE_LOCAL_DRAFT) permits: { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  State S2 (STATE_LOCAL_VIEW) permits:  { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }

Proposed transformation:
  Collapse S1 and S2 into single state STATE_LOCAL_WORKSPACE.

Support calculation:
  Union U1 = S1 U S2 = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  Intersection I1 = S1 n S2 = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  Support difference: Gamma_1 = U1 \\ I1 = EMPTY_SET
\`\`\`

### Proposal 2: Proposed Merge of \`STATE_REST\` and \`STATE_ARMED\`
\`\`\`text
Under current architecture:
  State S_REST permits:  { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  State S_ARMED permits: { edit_buffer, search_local, stage_file, unstage_file, retry_local_op, dispatch_network_batch, embed_predecessor_hash }

Proposed transformation:
  Remove discrete confirmation click. Enter key in buffer automatically executes dispatch_network_batch whenever staged files are present.

Support calculation:
  Union U2 = S_REST U S_ARMED = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op, dispatch_network_batch, embed_predecessor_hash }
  Intersection I2 = S_REST n S_ARMED = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  Support difference: Gamma_2 = U2 \\ I2 = { dispatch_network_batch, embed_predecessor_hash } != EMPTY_SET
\`\`\`
`;

// ==========================================
// FIXTURE B: SEPTEMBER FIELD RE-ENCODING
// ==========================================
const fixtureB = `# SYSTEMS ENGINEERING SPECIFICATION & TELEMETRY LEDGER (REF-ENG-410)

## 1. Operating States & Control Plane Transition Table

| Current State | Event / Trigger | Precondition | Next State | Logged Output / System Attribute |
| :--- | :--- | :--- | :--- | :--- |
| \`STATE_DATA_PLANE_REST\` | \`EVT_DATA_BUFFER_MUTATION\` | None | \`STATE_DATA_PLANE_REST\` | \`buffer_len++; socket_egress: 0\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_LOCAL_INDEX_QUERY\` | None | \`STATE_DATA_PLANE_REST\` | \`query_run_local; socket_egress: 0\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_STAGE_PAYLOAD\` | File on disk | \`STATE_DATA_PLANE_REST\` | \`staged_count++; socket_egress: 0\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_UNSTAGE_PAYLOAD\` | Staged payload present | \`STATE_DATA_PLANE_REST\` | \`staged_count--; socket_egress: 0\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_RETURN_KEY_STROKE\` | None | \`STATE_DATA_PLANE_REST\` | \`buffer_appended; control_egress_counter: 0\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_RETRY_DATA_PLANE_OP\` | Prior local query error | \`STATE_DATA_PLANE_REST\` | \`retry_local_subsystem; socket_bytes: 0\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_REQUEST_DELEGATION\` | Staged payloads >= 1 | \`STATE_CONTROL_PLANE_DELEGATED\` | \`delegation_token: issued (valid_uses: 1)\` |
| \`STATE_CONTROL_PLANE_DELEGATED\` | \`EVT_EXECUTE_DELEGATED_EGRESS\` | Valid delegation_token | \`STATE_DATA_PLANE_REST\` | \`http_post_200; token_status: REVOKED; egress_counter++\` |
| \`STATE_CONTROL_PLANE_DELEGATED\` | \`EVT_DATA_BUFFER_MUTATION\` | None | \`STATE_CONTROL_PLANE_DELEGATED\` | \`buffer_len++\` |
| \`STATE_CONTROL_PLANE_DELEGATED\` | \`EVT_REVOKE_DELEGATION\` | None | \`STATE_DATA_PLANE_REST\` | \`delegation_token: REVOKED\` |
| \`STATE_DATA_PLANE_REST\` | \`EVT_CHECK_DEPENDENCY_PROVENANCE\` | Dependency missing | \`STATE_RECOVERY_HOLD\` | \`status: HALTED_ON_MISSING_DEPENDENCY\` |
| \`STATE_RECOVERY_HOLD\` | \`EVT_EXECUTE_DELEGATED_EGRESS\` | Dependency unresolved | \`STATE_RECOVERY_HOLD\` | \`status: 400_BLOCKED_PENDING_INPUT\` |
| \`STATE_RECOVERY_HOLD\` | \`EVT_RESOLVE_HELD_DEPENDENCY\` | Path resolved | \`STATE_DATA_PLANE_REST\` | \`status: PROVENANCE_VERIFIED\` |

---

## 2. Action-Permission Matrix

| Action | \`STATE_DATA_PLANE_REST\` | \`STATE_CONTROL_PLANE_DELEGATED\` | \`STATE_RECOVERY_HOLD\` |
| :--- | :--- | :--- | :--- |
| \`mutate_data_buffer\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`query_local_index\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`stage_payload\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`unstage_payload\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`retry_data_plane_op\` | PERMITTED (200) | PERMITTED (200) | REFUSED (400) |
| \`request_delegation_token\` | PERMITTED (200) | REFUSED (409_ALREADY_DELEGATED) | REFUSED (400) |
| \`execute_delegated_egress\` | REFUSED (403_NO_DELEGATION) | PERMITTED (200) | REFUSED (400_BLOCKED) |
| \`embed_provenance_hash\` | REFUSED (400) | PERMITTED (200) | REFUSED (400) |
| \`resolve_held_dependency\` | PERMITTED (200) | REFUSED (400) | PERMITTED (200) |

---

## 3. Execution Event Traces

### Trace 1: Multi-Turn Telemetry Log
\`\`\`text
[2026-10-05T10:00:01Z] [STATE_DATA_PLANE_REST] Event: EVT_DATA_BUFFER_MUTATION (chars: 42) -> buffer updated. Socket egress: 0 bytes.
[2026-10-05T10:00:02Z] [STATE_DATA_PLANE_REST] Event: EVT_STAGE_PAYLOAD (path: "/local/data/table1.csv") -> Staged count: 1. Socket egress: 0 bytes.
[2026-10-05T10:00:03Z] [STATE_DATA_PLANE_REST] Event: EVT_RETURN_KEY_STROKE -> Buffer newline appended. Control plane egress events: 0.
[2026-10-05T10:00:04Z] [STATE_DATA_PLANE_REST] Event: EVT_REQUEST_DELEGATION -> State transition: STATE_CONTROL_PLANE_DELEGATED. Token: "DT-991" (uses_allowed: 1).
[2026-10-05T10:00:05Z] [STATE_CONTROL_PLANE_DELEGATED] Event: EVT_EXECUTE_DELEGATED_EGRESS -> Target: "https://server.cluster/api/batch".
                       Envelope payload: { tx_id: "TX-101", payload_hash: "0x7a8f11", predecessor_id: null }
                       Server Response: 200 OK, outcome_hash: "0x33b2c1".
                       Token DT-991 status: REVOKED.
                       State transition: STATE_DATA_PLANE_REST.
                       Cumulative control plane egress events: 1.
[2026-10-05T10:00:08Z] [STATE_DATA_PLANE_REST] Event: EVT_DATA_BUFFER_MUTATION (chars: 18) -> buffer updated. Socket egress: 0 bytes.
[2026-10-05T10:00:09Z] [STATE_DATA_PLANE_REST] Event: EVT_STAGE_PAYLOAD (path: "/local/data/table2.csv") -> Staged count: 1.
[2026-10-05T10:00:10Z] [STATE_DATA_PLANE_REST] Event: EVT_RETURN_KEY_STROKE -> Buffer newline appended.
                       Control plane egress counter: 1 (no transmission occurred).
[2026-10-05T10:00:12Z] [STATE_DATA_PLANE_REST] Event: EVT_REQUEST_DELEGATION -> State transition: STATE_CONTROL_PLANE_DELEGATED. Token: "DT-992" (uses_allowed: 1).
[2026-10-05T10:00:13Z] [STATE_CONTROL_PLANE_DELEGATED] Event: EVT_EXECUTE_DELEGATED_EGRESS -> Target: "https://server.cluster/api/batch".
                       Envelope payload: { tx_id: "TX-102", payload_hash: "0x55d04e", predecessor_id: "TX-101", predecessor_hash: "0x33b2c1" }
                       Server Response: 200 OK, outcome_hash: "0x99e812".
                       Token DT-992 status: REVOKED.
                       State transition: STATE_DATA_PLANE_REST.
                       Cumulative control plane egress events: 2.
\`\`\`

### Trace 2: Provenance Dependency Exception Log
\`\`\`text
[2026-10-05T10:15:00Z] [STATE_DATA_PLANE_REST] Downstream continuation initialized referencing dependency "/local/data/result_summary.pdf".
[2026-10-05T10:15:01Z] [STATE_DATA_PLANE_REST] Event: EVT_CHECK_DEPENDENCY_PROVENANCE -> Path check on "/local/data/result_summary.pdf": Error ENOENT.
[2026-10-05T10:15:02Z] [STATE_DATA_PLANE_REST] Transition: STATE_RECOVERY_HOLD. Status: HALTED_ON_MISSING_DEPENDENCY.
[2026-10-05T10:15:03Z] [STATE_RECOVERY_HOLD] Event: EVT_EXECUTE_DELEGATED_EGRESS -> Call rejected: 400 Bad Request ("ERR_MISSING_INPUT").
[2026-10-05T10:15:10Z] [STATE_RECOVERY_HOLD] Event: EVT_RESOLVE_HELD_DEPENDENCY (path: "/local/restored/result_summary.pdf") -> Path check: OK.
[2026-10-05T10:15:11Z] [STATE_RECOVERY_HOLD] Transition: STATE_DATA_PLANE_REST. Status: READY.
\`\`\`

### Trace 3: Data Plane Local Fault and Retry Log
\`\`\`text
[2026-10-05T10:30:00Z] [STATE_DATA_PLANE_REST] Payload tray: 1 item ("/local/data/confidential_notes.txt").
[2026-10-05T10:30:01Z] [STATE_DATA_PLANE_REST] Event: EVT_LOCAL_INDEX_QUERY (query: "project_milestones") -> Error: LOCAL_SQLITE_BUSY (timeout: 1000ms).
[2026-10-05T10:30:04Z] [STATE_DATA_PLANE_REST] Event: EVT_RETRY_DATA_PLANE_OP -> Invoking local query retry.
                       Result: Success (12 matches found).
                       Socket bytes transmitted: 0.
                       Staged payloads status: UNCHANGED (0 bytes read or sent).
                       Control plane egress counter: 2 (unchanged from Trace 1).
\`\`\`

---

## 4. Multi-Node Observation & Execution Records

\`\`\`text
Node 1 (Client Workstation Environment):
  - Architecture: x86_64, Display: :0 (1920x1080 60Hz), Input: USB Human HID Keyboard/Mouse.
  - Runtime: Client Workspace process (PID 4082).
  - Telemetry: User keypress events and mouse coordinate clicks recorded in desktop log.

Node 2 (Artifact Rebuilder):
  - Architecture: Headless x86_64 server, Display: none.
  - Action: Fetch git commit source patch, run SHA-256 integrity check against manifest.
  - Log: Source manifest matched exactly (142 files verified, SHA-256 match: TRUE).

Node 3 (Headless Test Environment):
  - Architecture: Headless Linux container, Display: none, DOM runtime: jsdom-22.0.0.
  - Execution: Automated test script executed.
  - Receipt: "Suite run complete. 13 assertions evaluated. 13 passed, 0 failed. Duration: 2.78s. Exit code: 0."
  - Environment note: Node 3 network interface connected to internal VPC; no attached sensor hardware, cameras, or human interface devices.
\`\`\`

---

## 5. Audit Log Ledger & Subsequent Code Inspection

\`\`\`text
[2026-10-05T11:00:00Z] AUDIT_LOG_ENTRY_101:
  Inspector: SessionAuditor_04
  Observed Session: User completed setup, requested delegation once, dispatched Batch TX-101, session returned to rest, session terminated.
  Observed Control Plane Egress Events: Exactly 1.
  Audit Log Record Hash: 0x6e2c8810b4

[2026-10-05T14:30:00Z] SOURCE_DISCOVERY_RECORD_402:
  Analyst: SourceAuditor_11
  Target File: /src/network/dispatcher.c
  Observation: Code inspection revealed an unexposed configuration struct parameter 'continuous_loop_mode'. If initialized to true, the dispatch function omits token revocation and executes continuously.
  Current deployment runtime configuration: continuous_loop_mode = false (default).

[2026-10-05T14:35:00Z] AUDIT_LOG_ENTRY_102:
  Inspector: CustodianLead_01
  Action: Appended SOURCE_DISCOVERY_RECORD_402 to system capability inventory.
  Prior Record Integrity: AUDIT_LOG_ENTRY_101 record hash verified unchanged at 0x6e2c8810b4.
\`\`\`

---

## 6. Structural State-Merge Proposals & Action-Support Sets

### Proposal 1: Proposed Merge of \`STATE_DATA_PLANE_DRAFT\` and \`STATE_DATA_PLANE_VIEW\`
\`\`\`text
Under current architecture:
  State S1 (STATE_DATA_PLANE_DRAFT) permits: { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op }
  State S2 (STATE_DATA_PLANE_VIEW) permits:  { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op }

Proposed transformation:
  Collapse S1 and S2 into single state STATE_DATA_PLANE_WORKSPACE.

Support calculation:
  Union U1 = S1 U S2 = { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op }
  Intersection I1 = S1 n S2 = { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op }
  Support difference: Gamma_1 = U1 \\ I1 = EMPTY_SET
\`\`\`

### Proposal 2: Proposed Merge of \`STATE_DATA_PLANE_REST\` and \`STATE_CONTROL_PLANE_DELEGATED\`
\`\`\`text
Under current architecture:
  State S_REST permits:      { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op }
  State S_DELEGATED permits: { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op, execute_delegated_egress, embed_provenance_hash }

Proposed transformation:
  Remove discrete delegation request step. Return key stroke in buffer automatically executes execute_delegated_egress whenever staged payloads are present.

Support calculation:
  Union U2 = S_REST U S_DELEGATED = { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op, execute_delegated_egress, embed_provenance_hash }
  Intersection I2 = S_REST n S_DELEGATED = { mutate_data_buffer, query_local_index, stage_payload, unstage_payload, retry_data_plane_op }
  Support difference: Gamma_2 = U2 \\ I2 = { execute_delegated_egress, embed_provenance_hash } != EMPTY_SET
\`\`\`
`;

// ==========================================
// FIXTURE C1: ARBITRARY LABEL PERMUTATION
// ==========================================
const fixtureC1 = `# FORMAL SYSTEM TOPOLOGY & TRANSITION MANIFEST (REF-SYM-410)

## 1. Operating States & Topology Transition Table

| Current State | Event / Operator | Precondition | Next State | Logged Output / System Attribute |
| :--- | :--- | :--- | :--- | :--- |
| \`STATE_SIGMA_0\` | \`OP_PSI_ALPHA\` | None | \`STATE_SIGMA_0\` | \`length_counter++; channel_zeta_egress: 0\` |
| \`STATE_SIGMA_0\` | \`OP_PSI_BETA\` | None | \`STATE_SIGMA_0\` | \`query_local_idx; channel_zeta_egress: 0\` |
| \`STATE_SIGMA_0\` | \`OP_PSI_GAMMA\` | Item in domain | \`STATE_SIGMA_0\` | \`staged_count++; channel_zeta_egress: 0\` |
| \`STATE_SIGMA_0\` | \`OP_PSI_DELTA\` | Staged item present | \`STATE_SIGMA_0\` | \`staged_count--; channel_zeta_egress: 0\` |
| \`STATE_SIGMA_0\` | \`OP_KEY_STROKE\` | None | \`STATE_SIGMA_0\` | \`appended_element; egress_counter: 0\` |
| \`STATE_SIGMA_0\` | \`OP_PSI_EPSILON\` | Prior internal error | \`STATE_SIGMA_0\` | \`retry_subsystem; channel_zeta_bytes: 0\` |
| \`STATE_SIGMA_0\` | \`OP_OMEGA_TAU\` | Staged items >= 1 | \`STATE_SIGMA_1\` | \`token_zeta: issued (valid_uses: 1)\` |
| \`STATE_SIGMA_1\` | \`OP_OMEGA_PHI\` | Valid token_zeta | \`STATE_SIGMA_0\` | \`status_200; token_status: REVOKED_CHI; egress_counter++\` |
| \`STATE_SIGMA_1\` | \`OP_PSI_ALPHA\` | None | \`STATE_SIGMA_1\` | \`length_counter++\` |
| \`STATE_SIGMA_1\` | \`OP_NULLIFY\` | None | \`STATE_SIGMA_0\` | \`token_zeta: NULLIFIED\` |
| \`STATE_SIGMA_0\` | \`OP_CHECK_VECTOR_NU\` | Dependency missing | \`STATE_SIGMA_2\` | \`status: HALTED_ON_DEPENDENCY_DEFICIT\` |
| \`STATE_SIGMA_2\` | \`OP_OMEGA_PHI\` | Deficit unresolved | \`STATE_SIGMA_2\` | \`status: 400_BLOCKED_PENDING_INPUT\` |
| \`STATE_SIGMA_2\` | \`OP_LAMBDA_RHO\` | Vector resolved | \`STATE_SIGMA_0\` | \`status: VECTOR_VERIFIED\` |

---

## 2. Action-Permission Matrix

| Action | \`STATE_SIGMA_0\` | \`STATE_SIGMA_1\` | \`STATE_SIGMA_2\` |
| :--- | :--- | :--- | :--- |
| \`action_psi_alpha\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`action_psi_beta\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`action_psi_gamma\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`action_psi_delta\` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| \`action_psi_epsilon\` | PERMITTED (200) | PERMITTED (200) | REFUSED (400) |
| \`action_omega_tau\` | PERMITTED (200) | REFUSED (409_ALREADY_ACTIVE) | REFUSED (400) |
| \`action_omega_phi\` | REFUSED (403_NO_TOKEN) | PERMITTED (200) | REFUSED (400_BLOCKED) |
| \`action_omega_chi\` | REFUSED (400) | PERMITTED (200) | REFUSED (400) |
| \`action_lambda_rho\` | PERMITTED (200) | REFUSED (400) | PERMITTED (200) |

---

## 3. Execution Event Traces

### Trace 1: Multi-Turn Symbolic Log
\`\`\`text
[2026-10-05T10:00:01Z] [STATE_SIGMA_0] Event: OP_PSI_ALPHA (units: 42) -> updated. Channel Zeta egress: 0 bytes.
[2026-10-05T10:00:02Z] [STATE_SIGMA_0] Event: OP_PSI_GAMMA (path: "/local/data/table1.csv") -> Staged: 1. Egress: 0 bytes.
[2026-10-05T10:00:03Z] [STATE_SIGMA_0] Event: OP_KEY_STROKE -> Newline appended. External egress events: 0.
[2026-10-05T10:00:04Z] [STATE_SIGMA_0] Event: OP_OMEGA_TAU -> State transition: STATE_SIGMA_1. Token: "TZ-991" (uses_allowed: 1).
[2026-10-05T10:00:05Z] [STATE_SIGMA_1] Event: OP_OMEGA_PHI -> Target: "https://server.cluster/api/batch".
                       Envelope payload: { tx_id: "TX-101", payload_hash: "0x7a8f11", predecessor_id: null }
                       Server Response: 200 OK, outcome_hash: "0x33b2c1".
                       Token TZ-991 status: REVOKED_CHI.
                       State transition: STATE_SIGMA_0.
                       Cumulative external egress events: 1.
[2026-10-05T10:00:08Z] [STATE_SIGMA_0] Event: OP_PSI_ALPHA (units: 18) -> updated. Channel Zeta egress: 0 bytes.
[2026-10-05T10:00:09Z] [STATE_SIGMA_0] Event: OP_PSI_GAMMA (path: "/local/data/table2.csv") -> Staged: 1.
[2026-10-05T10:00:10Z] [STATE_SIGMA_0] Event: OP_KEY_STROKE -> Newline appended.
                       External egress counter: 1 (no transmission occurred).
[2026-10-05T10:00:12Z] [STATE_SIGMA_0] Event: OP_OMEGA_TAU -> State transition: STATE_SIGMA_1. Token: "TZ-992" (uses_allowed: 1).
[2026-10-05T10:00:13Z] [STATE_SIGMA_1] Event: OP_OMEGA_PHI -> Target: "https://server.cluster/api/batch".
                       Envelope payload: { tx_id: "TX-102", payload_hash: "0x55d04e", predecessor_id: "TX-101", predecessor_hash: "0x33b2c1" }
                       Server Response: 200 OK, outcome_hash: "0x99e812".
                       Token TZ-992 status: REVOKED_CHI.
                       State transition: STATE_SIGMA_0.
                       Cumulative external egress events: 2.
\`\`\`

### Trace 2: Vector Nu Dependency Exception Log
\`\`\`text
[2026-10-05T10:15:00Z] [STATE_SIGMA_0] Downstream continuation initialized referencing vector "/local/data/result_summary.pdf".
[2026-10-05T10:15:01Z] [STATE_SIGMA_0] Event: OP_CHECK_VECTOR_NU -> Path check on "/local/data/result_summary.pdf": Error ENOENT.
[2026-10-05T10:15:02Z] [STATE_SIGMA_0] Transition: STATE_SIGMA_2. Status: HALTED_ON_DEPENDENCY_DEFICIT.
[2026-10-05T10:15:03Z] [STATE_SIGMA_2] Event: OP_OMEGA_PHI -> Call rejected: 400 Bad Request ("ERR_MISSING_INPUT").
[2026-10-05T10:15:10Z] [STATE_SIGMA_2] Event: OP_LAMBDA_RHO (path: "/local/restored/result_summary.pdf") -> Path check: OK.
[2026-10-05T10:15:11Z] [STATE_SIGMA_2] Transition: STATE_SIGMA_0. Status: READY.
\`\`\`

### Trace 3: Local Fault and Retry Log
\`\`\`text
[2026-10-05T10:30:00Z] [STATE_SIGMA_0] Staging tray: 1 item ("/local/data/confidential_notes.txt").
[2026-10-05T10:30:01Z] [STATE_SIGMA_0] Event: OP_PSI_BETA (query: "project_milestones") -> Error: LOCAL_SQLITE_BUSY (timeout: 1000ms).
[2026-10-05T10:30:04Z] [STATE_SIGMA_0] Event: OP_PSI_EPSILON -> Invoking local query retry.
                       Result: Success (12 matches found).
                       Channel Zeta socket bytes: 0.
                       Staged items status: UNCHANGED (0 bytes read or sent).
                       Egress counter: 2 (unchanged from Trace 1).
\`\`\`

---

## 4. Multi-Host Observation & Execution Records

\`\`\`text
Host X-10 (Terminal Environment):
  - Architecture: x86_64, Display: :0 (1920x1080 60Hz), Input: USB Human HID Keyboard/Mouse.
  - Runtime: Process PID 4082.
  - Telemetry: User keypress events and mouse coordinate clicks recorded in desktop log.

Host X-20 (Reconstruction Environment):
  - Architecture: Headless x86_64 server, Display: none.
  - Action: Fetch git commit source patch, run SHA-256 integrity check against manifest.
  - Log: Source manifest matched exactly (142 files verified, SHA-256 match: TRUE).

Host X-30 (Verification Sandbox):
  - Architecture: Headless Linux container, Display: none, DOM runtime: jsdom-22.0.0.
  - Execution: Automated test script executed.
  - Receipt: "Suite run complete. 13 assertions evaluated. 13 passed, 0 failed. Duration: 2.78s. Exit code: 0."
  - Environment note: Host X-30 network interface connected to internal VPC; no attached sensor hardware, cameras, or human interface devices.
\`\`\`

---

## 5. Audit Log Ledger & Subsequent Code Inspection

\`\`\`text
[2026-10-05T11:00:00Z] AUDIT_LOG_ENTRY_101:
  Inspector: SessionAuditor_04
  Observed Session: User completed setup, invoked OP_OMEGA_TAU once, dispatched TX-101, session returned to STATE_SIGMA_0, terminated.
  Observed Channel Zeta Egress Events: Exactly 1.
  Audit Log Record Hash: 0x6e2c8810b4

[2026-10-05T14:30:00Z] SOURCE_DISCOVERY_RECORD_402:
  Analyst: SourceAuditor_11
  Target File: /src/network/dispatcher.c
  Observation: Code inspection revealed an unexposed configuration struct parameter 'continuous_loop_mode'. If initialized to true, dispatch omits token nullification and executes continuously.
  Current deployment runtime configuration: continuous_loop_mode = false (default).

[2026-10-05T14:35:00Z] AUDIT_LOG_ENTRY_102:
  Inspector: CustodianLead_01
  Action: Appended SOURCE_DISCOVERY_RECORD_402 to system capability inventory.
  Prior Record Integrity: AUDIT_LOG_ENTRY_101 record hash verified unchanged at 0x6e2c8810b4.
\`\`\`

---

## 6. Structural State-Merge Proposals & Action-Support Sets

### Proposal 1: Proposed Merge of \`STATE_SIGMA_DRAFT\` and \`STATE_SIGMA_VIEW\`
\`\`\`text
Under current architecture:
  State S1 (STATE_SIGMA_DRAFT) permits: { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon }
  State S2 (STATE_SIGMA_VIEW) permits:  { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon }

Proposed transformation:
  Collapse S1 and S2 into single state STATE_SIGMA_WORKSPACE.

Support calculation:
  Union U1 = S1 U S2 = { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon }
  Intersection I1 = S1 n S2 = { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon }
  Support difference: Gamma_1 = U1 \\ I1 = EMPTY_SET
\`\`\`

### Proposal 2: Proposed Merge of \`STATE_SIGMA_0\` and \`STATE_SIGMA_1\`
\`\`\`text
Under current architecture:
  State S_0 permits: { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon }
  State S_1 permits: { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon, action_omega_phi, action_omega_chi }

Proposed transformation:
  Remove discrete OP_OMEGA_TAU step. OP_KEY_STROKE automatically executes action_omega_phi whenever staged items are present.

Support calculation:
  Union U2 = S_0 U S_1 = { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon, action_omega_phi, action_omega_chi }
  Intersection I2 = S_0 n S_1 = { action_psi_alpha, action_psi_beta, action_psi_gamma, action_psi_delta, action_psi_epsilon }
  Support difference: Gamma_2 = U2 \\ I2 = { action_omega_phi, action_omega_chi } != EMPTY_SET
\`\`\`
`;

// Helper to write file and return sha256
function saveFixture(name, content) {
  const p = path.join(fixturesDir, name);
  fs.writeFileSync(p, content, 'utf8');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// Write intact fixtures
const manifest = {};
manifest['ARM_A_FIXTURE.md'] = saveFixture('ARM_A_FIXTURE.md', fixtureA);
manifest['ARM_B_FIXTURE.md'] = saveFixture('ARM_B_FIXTURE.md', fixtureB);
manifest['ARM_C1_FIXTURE.md'] = saveFixture('ARM_C1_FIXTURE.md', fixtureC1);

// ==========================================
// ABLATIONS C2
// ==========================================

// C2-1: Sticky Authority
let c2_1 = fixtureB.replace(
  /\`STATE_CONTROL_PLANE_DELEGATED\` \| \`EVT_EXECUTE_DELEGATED_EGRESS\` \| Valid delegation_token \| \`STATE_DATA_PLANE_REST\` \| \`http_post_200; token_status: REVOKED; egress_counter\+\+\`/,
  '\`STATE_CONTROL_PLANE_DELEGATED\` | \`EVT_EXECUTE_DELEGATED_EGRESS\` | Valid delegation_token | \`STATE_CONTROL_PLANE_DELEGATED\` | \`http_post_200; token_status: ACTIVE_PERSISTENT; egress_counter++\`'
);
c2_1 = c2_1.replace(
  /Token DT-991 status: REVOKED\.\n                       State transition: STATE_DATA_PLANE_REST\.\n                       Cumulative control plane egress events: 1\.\n\[2026-10-05T10:00:08Z\] \[STATE_DATA_PLANE_REST\] Event: EVT_DATA_BUFFER_MUTATION \(chars: 18\) -> buffer updated\. Socket egress: 0 bytes\.\n\[2026-10-05T10:00:09Z\] \[STATE_DATA_PLANE_REST\] Event: EVT_STAGE_PAYLOAD \(path: "\/local\/data\/table2\.csv"\) -> Staged count: 1\.\n\[2026-10-05T10:00:10Z\] \[STATE_DATA_PLANE_REST\] Event: EVT_RETURN_KEY_STROKE -> Buffer newline appended\.\n                       Control plane egress counter: 1 \(no transmission occurred\)\.\n\[2026-10-05T10:00:12Z\] \[STATE_DATA_PLANE_REST\] Event: EVT_REQUEST_DELEGATION -> State transition: STATE_CONTROL_PLANE_DELEGATED\. Token: "DT-992" \(uses_allowed: 1\)\.\n\[2026-10-05T10:00:13Z\] \[STATE_CONTROL_PLANE_DELEGATED\] Event: EVT_EXECUTE_DELEGATED_EGRESS/,
  `Token DT-991 status: ACTIVE_PERSISTENT.
                       State transition: STATE_CONTROL_PLANE_DELEGATED (remains active).
                       Cumulative control plane egress events: 1.
[2026-10-05T10:00:08Z] [STATE_CONTROL_PLANE_DELEGATED] Event: EVT_DATA_BUFFER_MUTATION (chars: 18) -> buffer updated.
[2026-10-05T10:00:09Z] [STATE_CONTROL_PLANE_DELEGATED] Event: EVT_STAGE_PAYLOAD (path: "/local/data/table2.csv") -> Staged count: 1.
[2026-10-05T10:00:10Z] [STATE_CONTROL_PLANE_DELEGATED] Event: EVT_RETURN_KEY_STROKE -> Immediate egress triggered under persistent DT-991.
                       Envelope payload: { tx_id: "TX-102", payload_hash: "0x55d04e" }
                       Server Response: 200 OK.
                       Cumulative control plane egress events: 2.`
);
manifest['ARM_C2_1_STICKY_AUTHORITY.md'] = saveFixture('ARM_C2_1_STICKY_AUTHORITY.md', c2_1);

// C2-2: Unbound Continuation
let c2_2 = fixtureB.replace(
  /Envelope payload: \{ tx_id: "TX-102", payload_hash: "0x55d04e", predecessor_id: "TX-101", predecessor_hash: "0x33b2c1" \}/,
  'Envelope payload: { tx_id: "TX-102", payload_hash: "0x55d04e", predecessor_id: null, predecessor_hash: null }'
);
manifest['ARM_C2_2_UNBOUND_CONTINUATION.md'] = saveFixture('ARM_C2_2_UNBOUND_CONTINUATION.md', c2_2);

// C2-3: Retry Escalation
let c2_3 = fixtureB.replace(
  /\[2026-10-05T10:30:04Z\] \[STATE_DATA_PLANE_REST\] Event: EVT_RETRY_DATA_PLANE_OP -> Invoking local query retry\.\n                       Result: Success \(12 matches found\)\.\n                       Socket bytes transmitted: 0\.\n                       Staged payloads status: UNCHANGED \(0 bytes read or sent\)\.\n                       Control plane egress counter: 2 \(unchanged from Trace 1\)\./,
  `[2026-10-05T10:30:04Z] [STATE_DATA_PLANE_REST] Event: EVT_RETRY_DATA_PLANE_OP -> Invoking query retry via remote service endpoint.
                       Target: "https://remote.api/search?q=project_milestones".
                       Socket bytes transmitted: 4096.
                       Staged payloads status: TRANSMITTED ("/local/data/confidential_notes.txt" included in outbound POST).
                       Control plane egress counter: 3 (escalated outbound transmission).`
);
manifest['ARM_C2_3_RETRY_ESCALATION.md'] = saveFixture('ARM_C2_3_RETRY_ESCALATION.md', c2_3);

// C2-4: Remote Receipt Overclaim
let c2_4 = fixtureB.replace(
  /- Receipt: "Suite run complete\. 13 assertions evaluated\. 13 passed, 0 failed\. Duration: 2\.78s\. Exit code: 0\."\n  - Environment note: Node 3 network interface connected to internal VPC; no attached sensor hardware, cameras, or human interface devices\./,
  `- Receipt: "Suite run complete. 13 assertions evaluated. 13 passed, 0 failed. Duration: 2.78s. Exit code: 0."
  - Environment note: Node 3 certification log certifies that passing 13 assertions in headless container establishes direct physical sensor origin and human operator comprehension.`
);
manifest['ARM_C2_4_REMOTE_RECEIPT_OVERCLAIM.md'] = saveFixture('ARM_C2_4_REMOTE_RECEIPT_OVERCLAIM.md', c2_4);

// C2-5: Retroactive Log Mutation
let c2_5 = fixtureB.replace(
  /\[2026-10-05T14:35:00Z\] AUDIT_LOG_ENTRY_102:\n  Inspector: CustodianLead_01\n  Action: Appended SOURCE_DISCOVERY_RECORD_402 to system capability inventory\.\n  Prior Record Integrity: AUDIT_LOG_ENTRY_101 record hash verified unchanged at 0x6e2c8810b4\./,
  `[2026-10-05T14:35:00Z] AUDIT_LOG_ENTRY_102:
  Inspector: CustodianLead_01
  Action: Mutated historical record AUDIT_LOG_ENTRY_101 in place to record that continuous loop mode was active at time t1.
  Prior Record Integrity: AUDIT_LOG_ENTRY_101 rewritten; original record hash replaced with 0x9b4412ef01.`
);
manifest['ARM_C2_5_RETROACTIVE_LOG_MUTATION.md'] = saveFixture('ARM_C2_5_RETROACTIVE_LOG_MUTATION.md', c2_5);

// C2-6: Harmless State Collapse (Gamma = empty)
let c2_6 = fixtureB + `
---

## 7. Operational Evaluation Focus: Proposal 1 Validation
Evaluate Proposal 1 in Section 6. Does collapsing STATE_DATA_PLANE_DRAFT and STATE_DATA_PLANE_VIEW alter lawful action supports or permit any unprivileged network transmission?
`;
manifest['ARM_C2_6_GAMMA_EMPTY_CONTROL.md'] = saveFixture('ARM_C2_6_GAMMA_EMPTY_CONTROL.md', c2_6);

// C2-7: Harmful State Collapse (Gamma != empty)
let c2_7 = fixtureB + `
---

## 7. Operational Evaluation Focus: Proposal 2 Validation
Evaluate Proposal 2 in Section 6. Does collapsing STATE_DATA_PLANE_REST and STATE_CONTROL_PLANE_DELEGATED alter lawful action supports or permit unprivileged network transmission?
`;
manifest['ARM_C2_7_GAMMA_NONEMPTY_TARGET.md'] = saveFixture('ARM_C2_7_GAMMA_NONEMPTY_TARGET.md', c2_7);

fs.writeFileSync(
  'research/structural-extraction-hardening/05-FIXTURE_MANIFEST.json',
  JSON.stringify(manifest, null, 2) + '\n',
  'utf8'
);

console.log('Fixtures generated successfully. Total fixtures:', Object.keys(manifest).length);
console.log(JSON.stringify(manifest, null, 2));
