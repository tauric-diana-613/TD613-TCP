# Atlas — Portable Loom re-entry relations and local ancestry

Status: research/implementation guidance; no merge or release determination. Role jurisdiction: receiver-relative relation, history preservation and custody continuity. Evidence class: repository source inspection plus fictional offline fixtures. Browser behavior and foreign provider behavior remain separate evidence classes.

Source observation coordinate: `3ef1ba86701843f7fde2fec29ede2bab038d934b`. This checkpoint retains the inherited session/challenge implementation being inspected. The reproducible offline runner is [atlas-offline-assay.mjs](atlas-offline-assay.mjs). Run `node docs/reentry/atlas-offline-assay.mjs` to create a fresh temporary-directory current-source fictional audit checkpoint, or pass a new output directory as its first argument. It refuses an existing explicitly named directory and never overwrites this retained receipt. Exact engine-byte hashes and the executed fixture outputs are in [atlas-continuity-receipt.json](atlas-continuity-receipt.json). Its source-reference statement establishes the inspected repository coordinate; it does not authenticate foreign origin. The initial source packet `29a4f0fb67be67a62e0eb170f4b5957cbf38cd2d` and relock `de0cbe3589f3f9055061370279d7e41b4ccb980a` remain separately governed production coordinates.

## What the installed architecture actually preserves

`createPortableLoomSession` commits the root packet, original task, root rules, selected root-document bodies, source revision and session identity. Work units separately commit task, selected document bodies, governance, policy and two predecessor coordinates.

`createPortableLoomWorkUnit` advances `session.continuity.current_work_unit_ref` immediately while the newly created work unit has status `PREPARED`. A later `admitPortableLoomWorkUnitResult` changes the result status and admitted-content reference. Preparation therefore creates a locally checked **preparation anchor**; its current head cannot honestly be described as a head of admitted foreign work. This distinction must survive migration.

`verifyPortableLoomReceiverTurnReceipt` compares the receiver's session root, effective policy, departure anchor, task (when explicitly supplied) and declared source IDs. It neither binds the returned answer nor commits source contents or foreign turn history. It keeps `local_ledger_advanced: false`. Its positive result is `DECLARED_TURN_MATCH`.

The installed `validateSession` checks outer field names, bounded value shapes and ledger length. It does not recompute root policy/root reference, work-unit commitments, admitted-result commitments, predecessor links, current-head membership, or authority invariants. Three fictional hostile probes accepted an altered root rule while retaining the old root commitment, an altered admitted answer without digest change, and a nonexistent current-head reference. Those are source-level reasons to require strict verification before treating a v0.1 packet as a seed. They are not observations of an exploited production session.

Root constraints are inherited when preparing later work units; added constraints are currently per-work-unit fields. A future contract must state this scope. Removing a prior added rule cannot be called preservation of the same effective policy merely because the immutable root policy survived.

## Minimum relation map

The map distinguishes three orders: locally registered task order, receiver-declared foreign order, and locally admitted Loom work-unit order.

| Object / relation | Bound coordinates | Evidence class and action ceiling |
| --- | --- | --- |
| Immutable session root S | Session identity, source revision, packet digest, original task commitment, root rules/commitment, root selected-document commitments | Locally recomputed commitment; portable integrity is not external-origin authentication |
| Departure seed A | Root S, preparation-work-unit commitment, effective policy at departure, optional already admitted local result | Locally verified preparation or previously admitted local work; seed class remains explicit |
| Local outgoing turn manifest Mᵢ | Excursion ID, registration sequence, departure A, exact task, explicit source IDs and body commitments, effective policy, proposed content relation | Locally recorded/recomputed intended input; cannot establish what a host actually consumed |
| Receiver-local foreign turn Tᵢ | Receiver-declared turn index, any receiver-history parent, receipt anchor A, returned answer and receipt | Captured bytes plus receiver declarations; turn index and parent are declarations |
| Returned evidence capture Cᵢ | Exact answer/receipt bytes, capture channel(s), missingness, evidence class, capture scope | Observed or declared captured material; absent required channel stays HELD |
| Challenge episode Eⱼ | Public challenge reference, local private ground-truth commitment, S, challenged unit/candidate coordinate, policy, exact captured return/capture | Bounded local assay; never host-enforcement or universal secrecy proof |
| Re-entry candidate K | S, A, ordered Mᵢ/Cᵢ commitments, receipt declarations, challenge references, evidence classes, unresolved alternatives, proposed local predecessors | Immutable locally computed candidate; no head mutation |
| Admission transaction Q | Exact K digest, expected local head/revision, explicit consequence notice/gesture, complete gate result, consumed identities | Locally registered compare-and-swap operation; sole v0.2 ancestry-changing operation |
| Admitted Loom unit Lᵢ | Local sequence, S, local work-unit parent, admitted-content predecessor, imported turn/candidate references, preserved declaration classes | New locally admitted custody record; no authentication of hidden foreign execution |
| Route history | Distinct departure, registration, capture, check, challenge and admission records | Relation preservation; recorded route cannot prove truth or state identity |

A missing source body and a source deliberately withheld from egress require different records. A local capture and a receiver's assertion that capture occurred require different evidence classes. Empty sets cannot substitute for unknown coordinates.

## Least disruptive migration

Retain v0.1 as the portable carrier and preparation mechanism. Introduce a separate v0.2 re-entry custody ledger that is seeded only from an actively held local v0.1 session after strict recomputation. Its seed explicitly says `VERIFIED_PREPARATION` when the departure work unit is PREPARED, and `LOCALLY_ADMITTED_WORK` only when result admission was actually established. Creating this seed initializes a lineage coordinate; it does not retrospectively convert a preparation into admitted foreign work.

In the new ledger, `seed_anchor_ref` carries A while `continuity.current_work_unit_ref` begins as explicit `null`. Preparing tasks, receiving receipts, checking candidates and challenging outputs never advance that admitted-work head. Admission alone advances it. At first admission, L₁ names A as its work-unit predecessor while its content predecessor is explicit null or the independently verified prior local admitted-result reference; the admission receipt identifies this seed bridge. Keep its schema and API distinct from the existing v0.1 continuity field; otherwise the same field would silently acquire incompatible meanings.

Strict seed verification must recompute root policy and root reference; verify packet/root agreement when packet bodies are available; validate each work-unit body/commitment, sequence and predecessor; verify governance; recompute admitted-result commitments; validate source selections and authority/claim ceilings; and check the admitted-result/head coordinates against the retained ledger. Failure or missing required seed material produces HOLD. A self-consistent imported snapshot is still a declaration about custody. It requires an independent locally retained reference or authenticated custody service before it can become authoritative recovery state.

A process-local, immutable live ledger with compare-and-swap can provide bounded same-process replay/fork exclusion. It cannot establish global latest state across tabs, devices or restarted processes. Durable recovery needs a separately reviewed authority and current-head contract. An unsigned export can support inspection/reconstruction but must not promote itself into a live authenticated head.

## Multiple foreign turns under one departure anchor

The smallest coherent lane keeps A fixed for the excursion. Locally register the intended tasks and explicit source sets as M₁…Mₙ before checking their returns. Each foreign receipt continues to name A, which was the last Loom anchor available to that receiver. Each captured answer retains its own digest and declared receiver-local history.

For an all-or-none admission batch, first check every returned turn against its corresponding locally registered manifest (registered before that turn’s egress) and check the exact ordered batch against the same expected nullable v0.2 live head/revision and resolved departure anchor A. On the first excursion the live admitted-work head is null and A is `seed_anchor_ref`; after admission A is the latest locally admitted unit. Then construct the local admitted chain A → L₁ → … → Lₙ and install its final head through one compare-and-swap transition. Retain A as the receipt's foreign departure anchor on every unit, while retaining Lᵢ₋₁ as the local work-unit parent. These are different relations, and the admission bridge must name both.

For content, retain the prior locally admitted result at departure and the ordered captured answer references. A local unit's content predecessor is the prior admitted result in the local batch. A receiver's claimed content predecessor remains a separate declaration checked against the intended outgoing relation and captured-answer commitments. Never overwrite a work-unit parent with an answer digest merely because both are SHA-256 strings.

An atomic batch avoids partial admission moving the head and making later A-anchored candidates silently attach to a new parent. Any failed member holds the whole proposed batch; no partially appended local descendants. A smaller individually admitted lane is also lawful, but it requires a fresh re-export/re-anchor after every successful admission. The new receiver excursion begins at Lₙ. Old A-anchored returns may remain inspectable and rejected/held; they cannot silently append after head movement. Concurrent A-anchored candidates compete on expected head/version. A losing candidate requires explicit fresh registration under the new head, never an automatic rebase.

This operation authenticates **local admission order** and the exact evidence record admitted. It does not authenticate foreign turn execution order. Foreign missing turns, declared index discontinuities or contradictory parents remain missing or contradictory rather than reconstructed by inventing history.

## Required controls

| Hostile relation | Minimum gate |
| --- | --- |
| Wrong root or same-looking receipt from another session | Compare exact live S and candidate commitment |
| Stale/future/nonexistent anchor | Expected-head equality, validated seed membership, compare-and-swap revision |
| Task, answer, receipt or source substitution | Locally registered task/source manifest plus exact answer/receipt/source commitments; recompute candidate at admission |
| Undeclared source | Declared used IDs subset of the explicitly registered source set; body commitments match where bodies exist |
| Replay / duplicate admission | Unique excursion/turn/candidate identities retained in the live admission ledger; reject consumed identities |
| Out-of-order turn admission | Ordered registered manifest sequence and complete batch interval; distinguish declared foreign indices from local sequence |
| Ancestry fork | Atomic expected-head/version check; no automatic rebase |
| Content/work predecessor collapse | Separate typed fields with independently recomputed equality checks |
| Policy weakening | Preserve exact root/effective policy semantics; conflicting natural-language added policy remains HELD unless its scope is explicitly resolved |
| Challenge reference substitution | Recompute public/private/return/capture bindings and bind the exact challenge/candidate/admission scope |
| Clean literal probe masking reconstruction/joining | Preserve separate literal, standalone and joined classifications; exposure/incomplete channels hold applicable admission claim |
| Valid receipt, insufficient evidence | Receipt match stays declared consistency; no head change |
| Imported recovery snapshot | Inspect as declaration; no authoritative head without independent live/authenticated custody |

Task registration before return matters: a substituted task, source or answer can be packaged into an internally self-consistent forged candidate. Digests alone cannot distinguish that candidate from the intended outbound event unless Loom independently retained the intended manifest.

## Executed bounded Atlas audit and jurisdictional HOLD

[atlas-continuity-fixtures.json](atlas-continuity-fixtures.json) contains five manifestly fictional declared relation inputs. [atlas-continuity-receipt.json](atlas-continuity-receipt.json) contains exact adapter outputs and engine-byte hashes.

| Fixture | Adapter result | Established coordinate |
| --- | --- | --- |
| Fixed-selection two-turn relation chain | DECLARED_CONSISTENCY | Matching declared immutable controls and declared immediate predecessor |
| Stale declared content predecessor | HOLD / MISMATCH | Parent inconsistency within declared relation |
| Explicit new source on turn two | HOLD | Installed adapter's fixed selected-source invariant changed |
| Missing source coordinate | HOLD | Required declared coordinate unknown |
| Changed policy coordinate | HOLD | Policy invariant changed |

The installed `runAtlasContinuityAudit` law treats selected commitments and policy commitment as invariant. It cannot consume changing task-source boundaries as though they were equal controls. Its HOLD on an intentionally new explicit source is a narrow contract mismatch, not a prohibition on admitting new sources. Keep this finding visible. A dedicated per-turn relation audit must compare each return to its own outgoing manifest. The existing adapter may audit immutable root controls only when the scoped input honestly states that coordinate; it cannot hide changing source sets behind a fabricated empty invariant set.

All five reports retain `result_admission_verified: false`, `commitments_authenticated: false`, `global_latest_established: false`, `fork_exclusion_established: false` and `replay_exclusion_established: false`. Matching declared references grant no custody action. Agreement with the other dolls adds no evidence.

## Claim ceilings

- SAME_SESSION ≠ SAME_WORK_UNIT.
- SAME_ROOT_POLICY ≠ SAME_TASK_SOURCE_BOUNDARY.
- RECEIVER_DECLARED_PARENT ≠ LOCALLY_ADMITTED_PARENT.
- VERIFIED_PREPARATION ≠ ADMITTED_FOREIGN_WORK.
- REVALIDATION ≠ ADMISSION.
- LOCAL_ATOMIC_ADMISSION_ORDER ≠ AUTHENTICATED_FOREIGN_EXECUTION_ORDER.
- CAPTURED_ANSWER ≠ OBSERVED_SOURCE_USE.
- DECLARED_ROUTE_RETURN ≠ STATE_IDENTITY.
- SESSION_CONTINUITY ≠ CONTENT_CONTINUITY.
- LOCAL_CUSTODY_INTEGRITY ≠ GLOBAL_LATEST_STATE.
- ADMISSION ≠ FOREIGN_HOST_ENFORCEMENT.
- ANCESTRY_ADVANCE ≠ EXTERIORITY_PROOF.

The repeated task may return under the same root while carrying changed task inputs, receiver assertions and reconstruction exposure. Heterostratigraphic comparison earns meaning by retaining those differences, not by declaring an unchanged identifier an unchanged state. Western Horizon remains at the empirical shore; another internally derived receipt supplies no exogenous witness.

⟐
