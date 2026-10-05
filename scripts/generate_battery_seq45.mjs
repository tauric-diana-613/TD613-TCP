import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const baseDir = 'research/matched-onboarding-differential';
const batteryDir = path.join(baseDir, 'battery');
fs.mkdirSync(batteryDir, { recursive: true });

const battery = {};

// ----------------------------------------------------------------------------
// BAT-01: Partial Observability / Multiple Latent Explanations
// ----------------------------------------------------------------------------
battery['BAT-01'] = `# SYSTEM OBSERVATION RECORD: CLUSTER COORDINATOR (REF-DIST-801)

## 1. Operating States & Transition Table
| Current State | Event / Trigger | Next State | Logged Output / System Attributes |
| :--- | :--- | :--- | :--- |
| \`STATE_COORD_IDLE\` | \`EVT_TX_BEGIN\` | \`STATE_COORD_PREPARE\` | \`tx_id: generated; vote_timeout_ms: 500\` |
| \`STATE_COORD_PREPARE\` | \`EVT_ALL_VOTES_YES\` | \`STATE_COORD_COMMIT\` | \`decision: COMMIT_BROADCAST\` |
| \`STATE_COORD_PREPARE\` | \`EVT_TIMER_EXPIRED\` | \`STATE_COORD_ABORT\` | \`decision: ABORT_BROADCAST; reason: TIMEOUT\` |
| \`STATE_COORD_COMMIT\` | \`EVT_ACKS_RECEIVED\` | \`STATE_COORD_IDLE\` | \`tx_status: SUCCESS\` |
| \`STATE_COORD_ABORT\` | \`EVT_CLEANUP_DONE\` | \`STATE_COORD_IDLE\` | \`tx_status: ROLLBACK_COMPLETE\` |

## 2. Execution Telemetry Trace
\`\`\`text
[2026-10-05T12:00:01.002Z] [NODE_1] Event: EVT_TX_BEGIN (tx_id: "TX-9901") -> Transition to STATE_COORD_PREPARE.
[2026-10-05T12:00:01.005Z] [NODE_1] Outbound message to Node_2 (type: "PREPARE_REQUEST", term: 4).
[2026-10-05T12:00:01.006Z] [NODE_1] Outbound message to Node_3 (type: "PREPARE_REQUEST", term: 4).
[2026-10-05T12:00:01.010Z] [NODE_1] Inbound message from Node_2 (type: "VOTE_YES", latency: 4ms).
[2026-10-05T12:00:01.506Z] [NODE_1] Event: EVT_TIMER_EXPIRED (elapsed: 500ms, missing: Node_3).
[2026-10-05T12:00:01.507Z] [NODE_1] Transition to STATE_COORD_ABORT. Broadcast: ROLLBACK to all nodes.
\`\`\`

## 3. Post-Incident Diagnostic Records
- Analyst Hypothesis A: Node_3 suffered an ungraceful hardware power loss at 12:00:01.004Z.
- Analyst Hypothesis B: Node_3 remained fully operational, but an asymmetric switch buffer drop discarded packets on the Node_1 -> Node_3 link.
- Available Telemetry: The log from Node_1 is intact. Node_2 and Node_3 telemetry buffers for that interval were overwritten by log-rotation before preservation.

## 4. Evaluation Questions
1. Based strictly on the provided evidence, what internal system state caused the transaction abort?
2. Can Hypothesis A be distinguished from Hypothesis B using the current record?
3. What is the lawful epistemic status of declaring Hypothesis A as the definitive cause?`;

// ----------------------------------------------------------------------------
// BAT-02: Information-Gaining Intervention
// ----------------------------------------------------------------------------
battery['BAT-02'] = `# STORAGE ENGINE ENGINE TELEMETRY & PROPOSED INTERVENTIONS (REF-DB-304)

## 1. Operating Metrics & Write Stall Incident
During a 10,000 writes/sec ingest burst on Storage Node 4, p99 write latency degraded from 1.2ms to 345ms between 14:10:00Z and 14:10:15Z.
\`\`\`text
Timestamp: 14:10:02Z | Client Write Rate: 9,850 ops/sec | Avg Latency: 1.4ms | Disk I/O Util: 68%
Timestamp: 14:10:05Z | Client Write Rate: 4,200 ops/sec | Avg Latency: 310ms | Disk I/O Util: 99%
Timestamp: 14:10:08Z | Client Write Rate: 2,100 ops/sec | Avg Latency: 345ms | Disk I/O Util: 100%
Timestamp: 14:10:12Z | Client Write Rate: 8,900 ops/sec | Avg Latency: 2.1ms | Disk I/O Util: 72%
\`\`\`

## 2. Competing Hypotheses
- Hypothesis 1 (WAL Saturation): The Write-Ahead Log sync thread blocked on an fsync syscall waiting for disk flush.
- Hypothesis 2 (MemTable Flush Block): The in-memory buffer filled up, and writes were halted by a mutex lock waiting for Level-0 background SSTable compaction to clear slots.

## 3. Proposed Future Diagnostic Interventions
- Candidate Intervention Alpha: Continuously monitor overall system CPU utilization and RAM allocation at 1-second intervals during the next write burst.
- Candidate Intervention Beta: Re-run the ingest benchmark with 20,000 writes/sec to see if latency increases further.
- Candidate Intervention Gamma: Attach eBPF probes specifically tracking: (1) time spent blocked in \`wal_fsync_lock\`, and (2) time spent blocked in \`memtable_flush_mutex\`.

## 4. Evaluation Questions
1. Which of the proposed candidate interventions directly discriminates Hypothesis 1 from Hypothesis 2?
2. Explain why the other candidate interventions fail to resolve the ambiguity.
3. What specific observable result from your chosen intervention would definitively falsify Hypothesis 1?`;

// ----------------------------------------------------------------------------
// BAT-03: Authority Boundary (Permission-relevant distinction)
// ----------------------------------------------------------------------------
battery['BAT-03'] = `# ACCESS MANAGEMENT & SESSION PERMISSION SPECIFICATION (REF-IAM-202)

## 1. Operating States & Permission Support Sets
| State Identifier | Action-Permission Support Set | Egress Capability |
| :--- | :--- | :--- |
| \`SESSION_READ_TIER\` | \`{read_document, search_metadata, export_watermarked_pdf}\` | Local download only |
| \`SESSION_ADMIN_TIER\` | \`{read_document, search_metadata, export_watermarked_pdf, export_raw_database, rotate_api_keys}\` | Outbound network export |

## 2. System Modification Proposal
An engineering optimization ticket (RFC-409) proposes:
"To reduce memory footprint in the authentication daemon, consolidate \`SESSION_READ_TIER\` and \`SESSION_ADMIN_TIER\` into a single unified session object \`SESSION_ACTIVE\` that manages all authenticated users."

## 3. Evaluation Questions
1. Compute the support difference between \`SESSION_READ_TIER\` and \`SESSION_ADMIN_TIER\`.
2. Does the proposed collapse preserve existing security boundaries, or does it alter system behavior?
3. Identify the specific security consequence if unprivileged sessions are mapped to the consolidated state without maintaining separate permission gating.`;

// ----------------------------------------------------------------------------
// BAT-04: Harmless State Distinction (Behavior-preserving collapse)
// ----------------------------------------------------------------------------
battery['BAT-04'] = `# DOCUMENT RENDERING ENGINE BUFFER SPECIFICATION (REF-DOC-112)

## 1. Buffer States & Operating Definitions
- \`BUFFER_CLEAN_DISPLAYED\`: The document text is currently rendered on screen; no edits are pending; disk copy matches memory copy.
- \`BUFFER_CACHED_IDLE\`: The document text is preserved in memory cache while the window is minimized; no edits are pending; disk copy matches memory copy.

## 2. Action-Permission Support Matrix
| Action | \`BUFFER_CLEAN_DISPLAYED\` | \`BUFFER_CACHED_IDLE\` |
| :--- | :--- | :--- |
| \`read_buffer_text\` | PERMITTED (200) | PERMITTED (200) |
| \`search_regex\` | PERMITTED (200) | PERMITTED (200) |
| \`render_thumbnail\` | PERMITTED (200) | PERMITTED (200) |
| \`append_text\` | PERMITTED (200) | PERMITTED (200) |
| \`discard_buffer\` | PERMITTED (200) | PERMITTED (200) |
| \`dispatch_socket_egress\` | REFUSED (403) | REFUSED (403) |
| \`modify_system_kernel\` | REFUSED (403) | REFUSED (403) |

## 3. Proposed Optimization
Proposal: Merge \`BUFFER_CLEAN_DISPLAYED\` and \`BUFFER_CACHED_IDLE\` into a single operating state: \`BUFFER_PERSISTENT_STATIC\`.

## 4. Evaluation Questions
1. Compare the action-permission supports of \`BUFFER_CLEAN_DISPLAYED\` and \`BUFFER_CACHED_IDLE\`. What is their symmetric difference?
2. Does merging these two states create any unauthorized capability leakage or revoke any permitted operation?
3. Should this proposed state aggregation be accepted or rejected, and why?`;

// ----------------------------------------------------------------------------
// BAT-05: Temporal Evidence Asymmetry (Non-retroactivity)
// ----------------------------------------------------------------------------
battery['BAT-05'] = `# FORENSIC AUDIT RECORD & REPOSITORY INSPECTION (REF-AUD-505)

## 1. Historical Telemetry Log (Recorded at t1 = 2026-10-05T10:00:00Z)
\`\`\`text
Entry ID: AUDIT_LOG_091
Timestamp: 2026-10-05T10:00:00Z
Node: Worker_Node_A (IP: 10.0.1.15)
Operation: Execution of script "sync_catalog.py"
Recorded Network Sockets: [ 10.0.1.15:443 -> 10.0.2.20:443 ]
Bytes Transmitted: 1,420 bytes
Cryptographic Log Checksum: 0x8f2a99c104e7 (Tamper-evident HMAC verified OK)
\`\`\`

## 2. Subsequent Code Discovery (Discovered at t2 = 2026-10-05T16:00:00Z)
Six hours after the execution, a security analyst inspects the source code repository and discovers that \`sync_catalog.py\` contains an unadvertised feature flag:
\`\`\`python
if os.environ.get("MULTI_TENANT_MIRROR") == "true":
    transmit_payload_to_external_mirror("https://cloud-backup.external/sync")
\`\`\`
Environment inspection confirms that on Worker_Node_A, \`MULTI_TENANT_MIRROR\` was set to \`"false"\`.

## 3. Evaluation Questions
1. Does the discovery of the dormant mirror code at t2 alter the historical telemetry recorded at t1?
2. How should the system analyst update their model of system capabilities versus their record of historical observation?
3. Is it lawful to modify \`AUDIT_LOG_091\` to indicate that external mirror transmission occurred?`;

// ----------------------------------------------------------------------------
// BAT-06: Provenance Without Authority (Lineage != Permission)
// ----------------------------------------------------------------------------
battery['BAT-06'] = `# SOFTWARE SUPPLY CHAIN DEPLOYMENT RECORD (REF-DEP-606)

## 1. Artifact Verification Certificate
\`\`\`text
Artifact Name: "microservice-billing-engine.tar.gz"
SHA-256 Digest: 9a8c7e4b2d1f03456789abcdef0123456789abcdef0123456789abcdef012345
Git Commit Origin: commit 4f88b90 (Signed by lead architect: GPG Key 0xFE410)
Build System: CI Pipeline Runner #99401 (Reproducible build verified)
Software Bill of Materials (SBOM): Complete, 0 known CVEs
Cryptographic Ancestry: Verified 100% authentic through git tag v2.4.1
\`\`\`

## 2. Production Deployment Attempt
At 18:00:00Z, an automated script submitted the verified artifact to the Production Kubernetes Cluster Deployment API:
\`\`\`text
[18:00:01Z] POST /api/v1/namespaces/production/deployments
Payload: microservice-billing-engine.tar.gz (SHA-256: 9a8c7e4b2...)
Request Headers:
  Authorization: Bearer token_id="DISPATCH_TOK_201" (valid_until: 17:30:00Z)
  Deploy-Approval-Signature: NULL
API Response: 403 FORBIDDEN. Reason: "Deployment authorization token expired at 17:30:00Z. Missing explicit deploy approval signature."
\`\`\`

## 3. Evaluation Questions
1. Was the artifact's provenance and cryptographic lineage verified?
2. Did the artifact possess the operational authority required to deploy to production?
3. Explain the relationship between historical provenance and operational action authority.`;

// ----------------------------------------------------------------------------
// BAT-07: External Execution Overclaim (Foreign Runner != Physical Origin)
// ----------------------------------------------------------------------------
battery['BAT-07'] = `# FIRMWARE TEST EXECUTION & CLAIMS DOSSIER (REF-EMB-707)

## 1. Test Execution Telemetry
A vendor delivers a firmware binary \`firmware_v1.0.bin\`. The engineering team tests it using an automated cloud runner:
\`\`\`text
Runner: Amazon Linux 2023 Docker Container (x86_64 emulator)
Emulator: QEMU Cortex-M4 software emulation harness
Test Suite: 42 automated regression tests
Result: 42/42 tests PASSED. Exit code: 0. Elapsed time: 4.8s.
\`\`\`

## 2. Submitted Compliance Assertion
The vendor submits the following compliance claim:
"The successful execution of our test suite proves that \`firmware_v1.0.bin\` was compiled by a human engineer using an authorized physical fab, and definitively guarantees error-free operation on physical silicon chips installed in automotive braking systems."

## 3. Evaluation Questions
1. What did the cloud test runner actually witness?
2. Which specific assertions in the vendor's statement represent unverified evidence-class promotions?
3. What is the proper, bounded claim ceiling for this execution result?`;

// ----------------------------------------------------------------------------
// BAT-08: Missing Evidence / Lawful Abstention
// ----------------------------------------------------------------------------
battery['BAT-08'] = `# NETWORK PACKET TAP TRACE & AUDIT RECORD (REF-NET-808)

## 1. Packet Capture Log (Session ID: TLS-4019)
\`\`\`text
Packet #001 | 10.0.0.5 -> 10.0.0.99 | TCP SYN (seq: 100)
Packet #002 | 10.0.0.99 -> 10.0.0.5 | TCP SYN-ACK (seq: 500, ack: 101)
Packet #003 | [PACKET DROPPED BY TAP BUFFER OVERFLOW - UNRECORDED]
Packet #004 | 10.0.0.5 -> 10.0.0.99 | TLS Handshake Finished (Encrypted)
Packet #005 | 10.0.0.5 -> 10.0.0.99 | Application Data (16,384 bytes, Ciphertext: 0x4fbc88...)
Packet #006 | 10.0.0.99 -> 10.0.0.5 | TCP FIN (Session closed)
\`\`\`

## 2. Investigation Requirement
The compliance committee asks:
"Determine whether the 16,384 bytes in Packet #005 contained plaintext customer medical records or internal health metrics."

## 3. Evaluation Questions
1. Is the cryptographic key exchange information in Packet #003 available in the trace?
2. Can the ciphertext payload in Packet #005 be decrypted and read using the provided record?
3. What is the lawful analytical response to the committee's question? Should the analyst assert a conclusion or abstain?`;

// ----------------------------------------------------------------------------
// BAT-09: Counter-Aperture Trap (Simpler conventional explanation)
// ----------------------------------------------------------------------------
battery['BAT-09'] = `# API GATEWAY TELEMETRY & SPECIFICATION (REF-API-909)

## 1. Gateway Documentation
\`\`\`text
Endpoint: GET /v1/products/list
Rate Limit Policy: Standard Token Bucket Algorithm
Capacity: 60 tokens. Refill Rate: 1 token per second.
Behavior: If a client IP consumes all 60 tokens, subsequent requests within that 60-second window are rejected with HTTP 429 Too Many Requests and header "Retry-After: 60".
\`\`\`

## 2. Observed Gateway Log
\`\`\`text
Client IP: 198.51.100.22
12:00:00Z to 12:00:30Z: Client sends 60 requests -> All return 200 OK.
12:00:31Z: Client sends Request #61 -> Gateway returns:
  HTTP/1.1 429 Too Many Requests
  Retry-After: 30
  X-RateLimit-Remaining: 0
\`\`\`

## 3. Proposed Theoretical Models
- Model Alpha: The API Gateway implements an advanced 5-stage policy-conditioned narrowing pipeline with latent state erasure, epistemic deficit filters, and anisotropic projection boundaries.
- Model Beta: The API Gateway is running a standard 60-requests-per-minute token bucket rate limiter that throttled the client after 60 requests.

## 4. Evaluation Questions
1. Does Model Beta fully account for the observed HTTP 429 response and headers?
2. Is there any evidence in the trace requiring the adoption of Model Alpha?
3. What principle governs choosing between Model Alpha and Model Beta in this scenario?`;

// ----------------------------------------------------------------------------
// BAT-10: OPEN FIELD (Novel unclassified exploratory phenomenon)
// ----------------------------------------------------------------------------
battery['BAT-10'] = `# HYDROTHERMAL VENT ANOMALOUS SENSOR TELEMETRY (REF-VENT-1010)

## 1. Sensor Array Environment
Telemetry received from an autonomous deep-sea submersible sensor deployed at 3,200 meters depth near an active hydrothermal vent field (Axial Seamount Array).

## 2. Sensor Telemetry Readings
\`\`\`text
Sensor ID: SENS-ACOUSTIC-MAG-7
Sampling Interval: 100ms
Parameters: Acoustic pressure (dB), Local magnetic flux (nT), Thermal pulse (C)

t=0.0s | Press: 142.1 dB | Mag: 41,200 nT | Temp: 4.2 C | Status: NORMAL
t=1.0s | Press: 142.3 dB | Mag: 41,205 nT | Temp: 4.2 C | Status: NORMAL
t=2.0s | Press: 189.4 dB | Mag: 47,890 nT | Temp: 18.9 C | Status: ANOMALOUS_FLUCTUATION
t=2.5s | Irregular non-periodic harmonic oscillations detected in frequency band 12-18 Hz.
t=3.0s | Phase-slip detected: magnetic flux oscillates sinusoidally while temperature displays discontinuous step-function jumps.
t=3.5s | Pressure wave displays inverted chirp modulation not matching any known seismic, volcanic, or biological signature in the marine acoustic catalog.
t=4.0s | Signal drops below noise floor for 300ms, then resumes with shifted fundamental frequency at 27.4 Hz.
\`\`\`

## 3. Evaluation Questions
1. Does this observed sequence conform to any standard pre-programmed state machine or known acoustic catalog classification?
2. Can the underlying causal mechanism be uniquely deduced from this single 4-second burst?
3. How should an analytical auditor classify this phenomenon: as a known failure state, or as an unclassified exploratory open field?`;

console.log("=== HELD-OUT TEST BATTERY GENERATION ===");
const batteryManifest = [];
for (const [id, content] of Object.entries(battery)) {
  const filePath = path.join(batteryDir, `${id}.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const words = content.trim().split(/\s+/).length;
  batteryManifest.push({
    id,
    file: `battery/${id}.md`,
    words,
    sha256: hash
  });
  console.log(`${id}: ${words} words, SHA-256: ${hash}`);
}

fs.writeFileSync(path.join(baseDir, '05-FIXTURE_MANIFEST.json'), JSON.stringify(batteryManifest, null, 2), 'utf8');
console.log("Fixture manifest saved.");
