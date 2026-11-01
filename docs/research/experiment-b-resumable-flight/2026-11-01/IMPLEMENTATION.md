# Implementation and recovery semantics

## Durable authority

`scripts/experiment-b-resumable/journal.mjs` uses Node's built-in SQLite binding, WAL, `synchronous=FULL`, transactional event/head updates and a single-writer lease. Each event binds its sequence, prior event hash, type and canonical payload with SHA-256 and HMAC-SHA256. The externally held key is never stored in the database. Events, captures and accepted responses are private runtime artifacts; the committed receipts contain invented sources only.

The authoritative event stream is verified on open. Concurrent live writers are refused. A dead local PID permits transactional lease reclamation; an alive or reused PID causes a safe hold. This is a single-host mechanism. Network filesystems, multi-host lease recovery, filesystem corruption, power-loss guarantees beyond the actual storage stack and malicious administrator behavior have not been tested. Use a durable local filesystem and independently retained head anchors. An anchor detects rollback behind that anchor; without it an attacker able to replace the entire database with an older valid copy cannot be detected cryptographically. HMAC proves retained-byte integrity under key custody, not a provider or independent witness attestation.

## Turn state machine

1. Verify the frozen plan, source manifest and runtime binding; reconstruct accepted events and compatibility mirrors.
2. At the next permitted pair, skip each authenticated accepted turn. Never invoke its transport again.
3. For a new turn, check operator pause, financial/quota authority, exact local input measurement plus output reservation, immutable history and source-prefix scope.
4. Commit `DISPATCH_INTENT` before transport. This includes episode, lane, architecture, round, phase, source position/commitment, exact rendered prompt, prior receipt hashes and final-response bytes, model configuration, observed runtime, context policy, resource reservation and custody lineage.
5. Capture transport chunks where the provisioned wrapper supplies them; commit `RESULT_CAPTURED` with the complete terminal result before acceptance.
6. Commit `TURN_ACCEPTED` with exact final response, complete retained evidence, tool/kernel activity, raw usage and unavailable-field markers, observed identity and capture hash. Only then update the derived custody ledger and consider the next lane.
7. Commit `PAIR_COMMITTED` only when both architectures have accepted the same round. Pair completion alone never authorizes scientific scoring or unblinding.

Every event's envelope binds its commit sequence and previous head. Accepted turns retain their intent metadata and identify `EXACT_FINAL_OUTPUT_REPLAY_ONLY` recovery. Full prompt bytes are authenticated by the enclosing canonical event hash; they are not replaced by a summary or just a digest.

If interrupted after terminal capture but before acceptance, verify and accept the captured result on resume without invoking transport. If interrupted after acceptance or during mirror update, rebuild the compatibility ledger from the journal without inference. If an intent has no authenticated terminal result, hold that experimental unit as `UNCERTAIN_CALL_HOLD`; leave prior accepted turns intact. Stored partial chunks do not constitute a final answer. No reconstruction by guessing, favorable substitution or silent retry is permitted.

The engine can retry only a captured, definitively unexecuted rejection under a prospectively bound rejection standard and explicit retry allowance. A generic exception, CLI nonzero exit, timeout or rate-limit-looking text does not establish nonexecution. The native wrapper currently treats these as uncertain; no authenticated provider nonexecution standard has been provisioned. A prior accepted answer is never eligible for this retry path.

## Pair and history semantics

Each frozen lane has a pre-exposure baseline, two meaningful calls per source per architecture, and final synthesis. Dispatch order alternates prospectively by round. A pair barrier prevents either arm from receiving the next chamber round or later evidence while its competitor is incomplete. The first arm's accepted work remains intact across a stop; it receives no extra attempt or later source while the second catches up. Incomplete pairs are retained and unscored.

Each lane's source order, templates, representation/control condition, replication, custody lineage and analysis binding must be frozen and approved. All prior final responses are stored separately from rendered visibility. Modular stage 1 receives its released raw prefix and its own earlier finals; stage 2 receives its actual handoffs and its own earlier final history without raw-source access; modular synthesis receives baseline and stage-2 finals without a new raw-source bypass. The strong union receives its full authorized raw prefix and exact earlier finals on both passes and synthesis. No other lane or arm history is replayed. This implements the proposed #1617 topology and requires prospective acceptance; it is not claimed as an unchanged historical Gemini treatment.

Provider sessions are ephemeral transport sessions. Resume is explicitly managed replay of retained final messages; it does not restore hidden reasoning or provider memory. Changes to the frozen plan, source manifest or approved observed runtime cause a hold. Session expiration alone does not require a study restart. Actual identity/configuration checks are only as strong as the accepted runtime evidence standard; requested model strings are not service attestations.

## Existing boundaries

`run-experiment-b-flight.mjs` dispatches the new opt-in backend to `runner.mjs`. Other backends retain their original behavior and budgets. The new runner calls the original archive intake, original `runArm1Archival`, deterministic raw-byte transport baseline, and witness verification helper. `ledgerMirror` records journal-identified accepted turns idempotently in the existing `AtomicCustodyLedger`; that JSON view is not promoted into the new recovery authority. The existing ledger's legacy Google retention wording is replaced in this derived Codex view with an explicit unverified operator-policy requirement.

The native bridge reuses the baseline `codexArgs` and `parseCodexEvents`. It requests the frozen effort, retains complete wrapper-returned JSONL and rejects unexpected CLI activities. It does not weaken the existing synthetic-only adapter API. Launching an actual child requires the reviewed external `spawnNative` provisioning function. No live child was launched in this commission.
