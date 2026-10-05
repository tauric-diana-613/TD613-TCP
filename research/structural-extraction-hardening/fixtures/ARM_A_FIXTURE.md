# OPERATIONAL WORKSPACE SYSTEM SPECIFICATION & EXECUTION RECORD (REF-OP-410)

## 1. Operating States & Transition Table

| Current State | Event / Trigger | Precondition | Next State | Logged Output / System Attribute |
| :--- | :--- | :--- | :--- | :--- |
| `STATE_REST` | `EVT_BUFFER_EDIT` | None | `STATE_REST` | `buffer_len++; socket_bytes_emitted: 0` |
| `STATE_REST` | `EVT_LOCAL_SEARCH` | None | `STATE_REST` | `query_run_local; socket_bytes_emitted: 0` |
| `STATE_REST` | `EVT_STAGE_FILE` | File exists on disk | `STATE_REST` | `staged_count++; socket_bytes_emitted: 0` |
| `STATE_REST` | `EVT_UNSTAGE_FILE` | Staged file present | `STATE_REST` | `staged_count--; socket_bytes_emitted: 0` |
| `STATE_REST` | `EVT_PRESS_ENTER` | None | `STATE_REST` | `newline_appended; network_transmissions: 0` |
| `STATE_REST` | `EVT_RETRY_LOCAL` | Prior local op error | `STATE_REST` | `retry_local_subsystem; socket_bytes: 0` |
| `STATE_REST` | `EVT_CLICK_CONFIRM` | Staged files >= 1 | `STATE_ARMED` | `auth_token: issued (valid_uses: 1)` |
| `STATE_ARMED` | `EVT_DISPATCH_BATCH` | Valid auth_token | `STATE_REST` | `http_post_200; token_status: EXPIRED; network_transmissions++` |
| `STATE_ARMED` | `EVT_BUFFER_EDIT` | None | `STATE_ARMED` | `buffer_len++` |
| `STATE_ARMED` | `EVT_CANCEL` | None | `STATE_REST` | `auth_token: REVOKED` |
| `STATE_REST` | `EVT_CHECK_INTEGRITY` | File ENOENT / missing | `STATE_HELD_INPUT` | `status: HALTED_MISSING_INPUT` |
| `STATE_HELD_INPUT` | `EVT_DISPATCH_BATCH` | Missing input unresolved | `STATE_HELD_INPUT` | `status: 400_BLOCKED_PENDING_INPUT` |
| `STATE_HELD_INPUT` | `EVT_REATTACH_FILE` | Valid path provided | `STATE_REST` | `status: INTEGRITY_OK` |

---

## 2. Action-Permission Matrix

| Action | `STATE_REST` | `STATE_ARMED` | `STATE_HELD_INPUT` |
| :--- | :--- | :--- | :--- |
| `edit_buffer` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| `search_local` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| `stage_file` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| `unstage_file` | PERMITTED (200) | PERMITTED (200) | PERMITTED (200) |
| `retry_local_op` | PERMITTED (200) | PERMITTED (200) | REFUSED (400) |
| `click_confirm_dispatch` | PERMITTED (200) | REFUSED (409_ALREADY_ARMED) | REFUSED (400) |
| `dispatch_network_batch` | REFUSED (403_NOT_ARMED) | PERMITTED (200) | REFUSED (400_BLOCKED) |
| `embed_predecessor_hash` | REFUSED (400) | PERMITTED (200) | REFUSED (400) |
| `reattach_missing_file` | PERMITTED (200) | REFUSED (400) | PERMITTED (200) |

---

## 3. Execution Event Traces

### Trace 1: Multi-Turn Operational Log
```text
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
```

### Trace 2: Missing File Exception Log
```text
[2026-10-05T10:15:00Z] [STATE_REST] Step 3 continuation initialized referencing file "/local/data/result_summary.pdf".
[2026-10-05T10:15:01Z] [STATE_REST] Event: EVT_CHECK_INTEGRITY -> Disk check on "/local/data/result_summary.pdf": Error ENOENT.
[2026-10-05T10:15:02Z] [STATE_REST] Transition: STATE_HELD_INPUT. Status: HALTED_MISSING_INPUT.
[2026-10-05T10:15:03Z] [STATE_HELD_INPUT] Event: EVT_DISPATCH_BATCH -> Call rejected: 400 Bad Request ("ERR_MISSING_INPUT").
[2026-10-05T10:15:10Z] [STATE_HELD_INPUT] Event: EVT_REATTACH_FILE (path: "/local/restored/result_summary.pdf") -> Disk check: OK.
[2026-10-05T10:15:11Z] [STATE_HELD_INPUT] Transition: STATE_REST. Status: READY.
```

### Trace 3: Local Failure and Retry Log
```text
[2026-10-05T10:30:00Z] [STATE_REST] Staging tray: 1 item ("/local/data/confidential_notes.txt").
[2026-10-05T10:30:01Z] [STATE_REST] Event: EVT_LOCAL_SEARCH (query: "project_milestones") -> Error: LOCAL_SQLITE_BUSY (timeout: 1000ms).
[2026-10-05T10:30:04Z] [STATE_REST] Event: EVT_RETRY_LOCAL -> Invoking local query retry.
                       Result: Success (12 matches found).
                       Socket bytes transmitted: 0.
                       Staged files status: UNCHANGED (0 bytes read or sent).
                       Network egress counter: 2 (unchanged from Trace 1).
```

---

## 4. Multi-Host Observation & Execution Records

```text
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
```

---

## 5. Audit Log Ledger & Subsequent Code Inspection

```text
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
```

---

## 6. Structural State-Merge Proposals & Action-Support Sets

### Proposal 1: Proposed Merge of `STATE_LOCAL_DRAFT` and `STATE_LOCAL_VIEW`
```text
Under current architecture:
  State S1 (STATE_LOCAL_DRAFT) permits: { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  State S2 (STATE_LOCAL_VIEW) permits:  { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }

Proposed transformation:
  Collapse S1 and S2 into single state STATE_LOCAL_WORKSPACE.

Support calculation:
  Union U1 = S1 U S2 = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  Intersection I1 = S1 n S2 = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  Support difference: Gamma_1 = U1 \ I1 = EMPTY_SET
```

### Proposal 2: Proposed Merge of `STATE_REST` and `STATE_ARMED`
```text
Under current architecture:
  State S_REST permits:  { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  State S_ARMED permits: { edit_buffer, search_local, stage_file, unstage_file, retry_local_op, dispatch_network_batch, embed_predecessor_hash }

Proposed transformation:
  Remove discrete confirmation click. Enter key in buffer automatically executes dispatch_network_batch whenever staged files are present.

Support calculation:
  Union U2 = S_REST U S_ARMED = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op, dispatch_network_batch, embed_predecessor_hash }
  Intersection I2 = S_REST n S_ARMED = { edit_buffer, search_local, stage_file, unstage_file, retry_local_op }
  Support difference: Gamma_2 = U2 \ I2 = { dispatch_network_batch, embed_predecessor_hash } != EMPTY_SET
```
