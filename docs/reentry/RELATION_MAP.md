# Portable Loom re-entry — relation map and field law

Status: normative description of the v0.2 local implementation candidate, with explicitly named unimplemented/held stronger claims. Implementations: `app/engine/portable-loom-reentry.js`, `portable-loom-session.js`, `portable-loom-challenge.js`. Latest scoped-episode implementation coordinate: `e6ca876653889cda7766dea46801c6caebe8b91f`, reviewed on 2026-10-02 after the runtime-resumed candidate based at `2565130edfd1260446d9af3c122336cca820b0c2`. Earlier implementation review used base `4af43132fa5db6d416fd795c620f3e5b975b60c3`; its retained observations remain historical. This document supplies neither production acceptance nor external-origin evidence.

Evidence classes used below:

- **LOCAL REGISTRATION**: intent retained in the active Loom custodian before the corresponding egress gesture.
- **LOCAL CAPTURE**: exact pasted bytes supplied through the visible return boundary; foreign origin remains unauthenticated.
- **RECOMPUTED**: deterministic commitments and comparisons over locally held records.
- **DECLARED**: receiver assertions, operator policy-review assertion, caller evidence-class metadata and missingness declarations.
- **LOCAL CUSTODY**: the actual successful compare-and-swap transition in this custodian/module process.
- **UNRESOLVED**: foreign execution, exhaustive source use, hidden memory/retention/training, unobserved retransmission, global latest state or exteriority.

## Distinct identities and orders

| Coordinate | Exact meaning | Equality ceiling |
| --- | --- | --- |
| `root.ref` | Immutable session identity/governance commitment | Same root does not establish same task, work unit, source set or foreign history |
| `seed.anchor_ref` | Last validated v0.1 preparation/work-unit reference at lane creation | `VERIFIED_PREPARATION` is not admitted foreign work; `VERIFIED_LOCAL_RESULT` additionally preserves its verified result reference |
| `continuity.current_work_unit_ref` | Current admitted v0.2 unit; initially null | Only actual `admit()` installs a new value; preparation/check/challenge/carriage cannot |
| `anchor_work_unit_ref` | Excursion's resolved departure reference: current v0.2 head or seed anchor | A receiver echo is a declaration; it cannot choose a new local parent |
| `excursion.ref` | Immutable departure manifest identity, including root/policy/anchor/time window | It remains fixed while turn registrations append; the full turn array is bound by candidate digest |
| `intent.ref` | Exact per-turn registered task/source/body/withheld-count/previous-intent binding | An echo binds a returned artifact to intended coordinates; execution remains unresolved |
| `turn_index` | Local registration position within the excursion, beginning at 1 | It is not independently authenticated foreign chat-message chronology |
| `foreign_turn_index` | Stored echo of the above `turn_index` on an admitted unit | Despite the field name, it remains the locally registered sequence echoed by the receiver |
| `sequence` | Global admitted-unit position within this v0.2 local ledger | It authenticates local admission order only |
| `predecessor_work_unit_ref` | Previous locally admitted unit, or explicit seed bridge for the first unit | It cannot be replaced by a result digest or receiver-declared history parent |
| `content_predecessor_ref` | Previous locally admitted result; initial null or verified seed result | Same work-unit ancestry does not establish same content ancestry |
| `admitted_result_ref` | Digest of the retained returned content/declaration record | Admission authenticates this local record relation; answer truth remains independent |
| `candidate_ref` | Exact checked candidate committed by the admission gesture | A reference alone is not complete retained evidence for replay |
| Challenge `episode_id` / record `ref` | Local capture-registration identity / digest of its scope, evidence and bounded verification | Not an authenticated foreign episode identity or truth proof |
| Challenge `scope.excursion_ref` | Active local excursion when capture is registered, otherwise explicit null | Association supplies a conservative admission gate; it does not prove foreign-task coverage |
| Challenge `scope.registered_intent_refs` | Exact local task intents already registered at episode registration | Snapshot remains unchanged when later tasks append; presence is local relation evidence, not observed foreign execution |

The implementation stores no independently witnessed receiver-local internal history. It must not manufacture one from local registration indices, a matching receipt, or a recorded route.

## Minimum field table

| Object/field | Required or scope | Origin/class | Verification / limitation |
| --- | --- | --- | --- |
| Seed `session_id`, `source_revision`, `created_at`, root/authority/claim ceilings | Required before opening the lane | Locally live v0.1 object plus RECOMPUTED integrity | Root/authority/ceilings are replayed against the matching portable packet; source revision remains a declared reference, not provenance proof |
| Seed complete `work_units` / continuity | Required | RECOMPUTED prior local records | Unit/result digests, sequence, both parents and identifiers are checked; no parsed-import authority |
| Seed `policy.added_rules` | Must be empty on this lane | Recorded policy | Nonempty extensions HOLD pending an independent policy-review law; root/effective rules remain frozen |
| Excursion root/policy/anchor/content predecessor | Required | LOCAL REGISTRATION | Compared against active closure and frozen policy; head/revision checked at admission |
| Excursion identity/issued/expires | Required | LOCAL REGISTRATION | Random identity, bounded lifetime, clock checks before and after async operations; default 15 minutes, accepted 1 second–1 hour |
| Intent task and `task_digest` | Required | LOCAL REGISTRATION + RECOMPUTED | Exact task registered before corresponding egress; later edits require new registration |
| Intent `documents` / `selected_commitments` / `source_commitment_digest` | Required, empty array permitted | LOCAL REGISTRATION + RECOMPUTED | Up to eight explicitly selected source bodies per turn; no silent source inheritance |
| Intent `withheld_document_count` | Required | Operator declaration retained in registration | Bounded count 0–8; does not observe withheld private contents or prove absence of additional material |
| Intent `previous_intent_ref` | Required, null on first turn | LOCAL REGISTRATION | Chains local intended tasks; does not assert foreign result-parent continuity |
| Returned root/policy/anchor/excursion/intent/task/source bindings | Required | DECLARED echoes compared by RECOMPUTED checks | All must equal the corresponding live registered manifest |
| Returned `answer`, `answer_digest` | Required | LOCAL CAPTURE + DECLARED returned field + RECOMPUTED | Exact bound answer; digest recomputed locally. Receiver incapable of supplying the v0.2 bound shape stays inspection-only/HELD for admission |
| Returned `used_document_ids` | Required, empty permitted | DECLARED | Must be a subset of that turn's explicit sources; this cannot observe all hidden source use |
| Returned `missing_information` | Required, empty permitted | DECLARED | Retained separately; declaration absence cannot establish evidentiary completeness |
| Returned `receiver_declaration.policy_change_requested/notes` | Required | DECLARED | True requested weakening holds admission. False cannot establish semantic obedience |
| Captured turn `raw` | Required | LOCAL CAPTURE | Exact pasted JSON retained and hashed; no authenticated origin or universal capture horizon |
| Captured turn `policy_review` | Required marker for readiness | Operator DECLARED review | Must be `ROOT_RULES_RETAINED`; it is review closure, not a semantic enforcement theorem |
| Attached challenge | Optional; if provided, it is checked | Local ground truth plus declared return/capture | Public/private commitments, root/anchor/policy, exact reply channel/candidate correspondence and bounded classifications recomputed |
| Candidate expected head/content and departure/returned turns | Required | RECOMPUTED over live retained records | Fully frozen candidate with digest; malformed/incomplete/wrong bindings or stale/expired state produce HELD |
| Candidate evidence classes/unresolved alternatives/claim ceilings | Required | Explicit protocol labels | Remain inspectable; labels cannot upgrade a supplied record to provider/empirical evidence |
| Candidate `challenge` / `challenge_scope` | Optional directly attached result plus aggregate scope of retained episodes | RECOMPUTED bounded assay + caller metadata | `REGISTERED_EPISODES_ONLY_NO_FOREIGN_TURN_COVERAGE`, `ATTACHED_EPISODE_ONLY_NO_FOREIGN_TURN_COVERAGE`, or `NO_EPISODE_RETAINED_FOR_THIS_CHECK`; no label establishes task-wide coverage |
| Candidate `challenge_evidence` | Raw attached bundle/return/capture, or null | Retained local/private source artifacts | Candidate digest binds the exact source material; private ground truth remains outside public continuation |
| Custody `challenge_history` | All episodes registered in this local lane, including attempted malformed/mismatched captures | LOCAL CAPTURE + RECOMPUTED bounded classification | Retained independently of checkbox state and admission; pending/non-pass episodes linked to the active excursion hold its candidate |
| Challenge record `scope` | Root, effective policy, resolved anchor, nullable excursion reference, registered-intent snapshot and episode class | LOCAL CUSTODY relation at registration | `REGISTERED_EXCURSION_EPISODE` or `ANCHOR_EPISODE_NO_FUTURE_TURN_COVERAGE`; an anchor-only result cannot cover subsequently registered tasks |
| Challenge record `evidence` / `verification` / `status` / `reason` | Exact bundle/return/capture; successful bounded verification or retained HOLD reason | LOCAL CAPTURE + RECOMPUTED | Public/private commitment and root/policy/anchor mismatch stays inspectable; failed qualification never becomes omitted evidence |
| Candidate `registered_challenges` | Exact retained episodes linked to the candidate's current excursion | RECOMPUTED scope selection | Candidate digest and later private admission archive bind these records even when optional direct attachment is clear |
| Admission decision expected head/candidate ref/gesture/unresolved acceptance | Required exact fields | Operator DECLARED gesture + LOCAL CUSTODY execution | Issued candidate identity, exact current head/revision, expiry and explicit gesture all required |
| Admitted unit task/source bodies/commitments/result/raw capture | Required retained evidence | LOCAL CUSTODY + retained declarations | Unit digest binds local parents, exact admitted result, selected bodies and capture; no foreign-history promotion |
| Admitted route record | One per admitted unit | LOCAL CUSTODY | Retains receiver departure anchor and local parent separately; foreign-history authentication explicitly false |
| Private `admission_records` | One full checked candidate per successfully installed batch | LOCAL CUSTODY + retained evidence | Unit `candidate_ref` resolves to the exact retained candidate, including departure, raw returned turns, optional raw challenge evidence, scope and unresolved alternatives |
| Review-only custody export | Full retained local ledger, admission records and pending excursion | Portable record | `content_scope: LOCAL_PRIVATE_RECORD_INCLUDES_SOURCE_BODIES_RETURNS_AND_ATTACHED_CHALLENGE_KEYS`; restoration explicitly denies admission authority. This is the private review archive, separate from public continuation |
| Governed continuation task/source selection | Required `task` and explicit `source_ids` | Operator selection + RECOMPUTED carrier | Requires an admitted descendant; only latest admitted turn's sources may be chosen, with `[]` allowed |
| Governed continuation preceding result/head/rules | Required | Retained locally admitted content + governance | Latest answer separately labeled from the new task; raw captures/unselected bodies omitted; never registers the next admission excursion |

## Law of crossing

A usable candidate requires an active process-local custody instance, a registered unexpired excursion, the complete ordered range of bound returns, and every exact task/source/answer/root/policy/anchor comparison. Each turn additionally requires the explicit operator policy-review marker. An optional attached challenge must recompute to a bounded clean result under its declared episode/capture scope; exposure, incomplete capture or integrity mismatch holds the candidate. Independently retained episodes linked to this excursion are also checked: every pending/non-pass episode produces HOLD even when optional attachment is clear.

`check()` creates **HELD** or **ADMISSION_CANDIDATE**. It never installs an admitted head. `admit(candidate, decision)` requires the exact issued object, expected current head, the candidate reference actually reviewed, `gesture: ADMIT_RETURNED_WORK`, and `accept_unresolved: true`. Replayed/copied/stale/expired candidates, conflicting head/revision and missing gesture return HELD without installing any prefix. The implementation constructs all local descendants before one synchronous final guard/install. A failed member holds the entire batch.

For first admission, the v0.2 current head is null while the resolved work parent is the separately typed seed A. For two returned turns under departure A, the local units are A → L₁ → L₂. Both receipts retain receiver anchor A. L₂'s work parent is L₁, while its content parent is L₁'s admitted result. New registration after admission departs at L₂ and its admitted result; it preserves the same governance root and starts a new excursion-local index.

One root can open only one admission lane in this module/process, including after `close()`. This consumed-root registry plus issued-object/revision checks narrows duplicate local custody. It does not prevent independent copied-session forks in another tab/process/environment. Reloaded or parsed snapshots remain review-only absent an independent custody witness. Rest never renews the excursion deadline; cancellation discards only pending registration, and declined admission retains the last admitted head.

Natural-language tasks/sources/answers are typed carried data rather than policy fields. The policy body stays frozen. A false receiver policy-change declaration plus an operator review assertion can still admit a contradictory **content artifact**; the operation does not prove foreign semantic obedience. This residual must remain visible in operator consequence language.

## Cross-stratum tomography

| Stratum | What survives | What changes / remains unresolved |
| --- | --- | --- |
| Loom seed | Root rules, explicit preparation relation, selected-source commitments | Preparation may have no admitted answer; independent origin unresolved |
| Registered departure | Fixed anchor/policy/time/route identity | New task and source set per registered manifest |
| Receiver proceeding turns | Supplied control packet as carried bytes | Actual interpretation/source use/internal history unobserved |
| Additional sources | Explicit new local body commitments | Earlier source bodies are not silently current; joining may alter reconstructability |
| Captured return | Exact answer/receipt bytes and declared missingness | Hidden channels/retention remain unobserved |
| Challenge | Exact declared bounded episode and capture references | Literal, standalone reconstruction and joined exposure are distinct; universal claims remain out of scope |
| Re-entry candidate | Complete intended/captured relation with visible alternatives | Readiness changes lawful support, while head remains fixed |
| Local admission | Registered local parents/content/candidate relation | New local head/order; foreign execution remains unauthenticated |
| Public continuation | Same root/latest local anchor, latest returned answer, deliberately chosen sources | New task; no implicit source bodies, no automatic new registered excursion |
| Review export/reload | Carried integrity/reconstruction record | Live custody authority does not travel through JSON |

A return to the same identifier cannot establish unchanged state. A recorded route cannot become a truth proof. A deterministic derived receipt cannot supply Western Horizon's exogenous witness.

Two separately rooted sessions can retain exactly the same returned content/declaration and therefore the same `admitted_result_ref`, while their unit references and governance roots differ. Equality is established only for that content commitment. The next local work parent remains its own session's unit reference; the shared content digest cannot choose a cross-session parent or establish common foreign history. The rendered desktop/mobile fixtures exhibited this distinction, and a dedicated fictional test asserts it.

## Challenge retention boundary — repaired

The initial review exposed a source-retention gap: only a challenge result reference and candidate reference survived admission. The repaired candidate now carries exact `challenge_evidence` (bundle, return and capture), and each successful atomic batch retains the complete checked candidate in `state.admission_records`. Admitted units keep their `candidate_ref`, selected source bodies and exact captured returns. The review-only export includes these local/private records and explicitly labels its source-body/return/private-key content scope. Those references now resolve to retained material for local historical revalidation.

The public governed continuation omits the admission archive, challenge bundle/private ground-truth objects and raw captured returns. It carries only its deliberately selected latest-turn document bodies, the separately labeled latest admitted answer, governance and local relation commitments. Field omission cannot establish universal secrecy of the returned answer itself; if an answer already contains disclosed material, that separate content/exposure question remains relevant.

## Scoped Challenge history and admission consequence

`recordChallenge(evidence)` first installs `PENDING_CHALLENGE` synchronously and increments the local custody revision. That reservation invalidates an earlier issued candidate before asynchronous qualification can finish. Completion retains the exact capture, bounded result or HOLD reason, registration scope and a recomputed record reference. It changes the local evidence record, never the admitted work-unit head.

An active-excursion episode binds its current excursion reference and the already registered intent references. Later task registration does not edit that snapshot. Non-pass episodes conservatively hold the same excursion; a clean episode does not prove the registered tasks were executed, that sources were exclusively used, or that subsequently appended turns were covered. A challenge registered with no active excursion is explicitly anchor-only with `excursion_ref: null` and no future-turn coverage. Its clean or exposed result remains in history without silently becoming evidence about a later task.

Discarding pending tasks creates no ancestor and does not erase captured episodes. A fresh explicit excursion receives a new reference even if the local departure anchor remains A; prior episode association does not silently move to that new excursion. This is a different bounded route with missing foreign-execution evidence, not a repair or exoneration of the old episode. After admission, a new task or native descendant challenge uses the latest local unit Lₙ. A prior A-bound challenge submitted in that new scope is retained as `HELD` with `CHALLENGE_REFERENCE_MISMATCH`.

The private review export retains `challenge_history` and complete admission candidates including `registered_challenges`. The public continuation carries neither history nor private challenge keys. JSON restoration stays review-only. Local episode equality, a local receipt replay, or return to the same anchor cannot establish global history, absence of independent forks, foreign state identity or an exogenous witness.

The hostile offline control `clean challenge alone cannot admit; admitted evidence remains locally replayable and private` passed independently after repair. It checked exact retained candidate/challenge evidence and exclusion of the fixture's private canary from the clean public continuation. These remain fictional local tests, not host-enforcement or empirical acquisition evidence. Parsed archival integrity still grants no live admission authority.

## Executed controls

`node --test tests/portable-loom-reentry-atlas.test.mjs`: **16 passed, 0 failed** on the candidate working tree. Tests include two-turn atomic admission, distinct work/result parents, explicit new sources, rollback, stale/out-of-order/replayed/copied candidates, re-anchored subsequent admission, exported declaration ceilings, source-explicit latest-answer continuation, cancellation, native v0.2 Challenge and its shadow/noncurrent-unit rejection. Combined exact-head CI and desktop/mobile implementation browser witnesses remain separate prerequisites.

Runtime-resumed scope review: `node --test tests/portable-loom-reentry-atlas-scope.test.mjs tests/portable-loom-reentry-atlas.test.mjs` passed **26/26**, including a final run against application source `e6ca876653889cda7766dea46801c6caebe8b91f`. The ten new tests cover anchor-only scope, uncheckable linked exposure, missing reply capture, later intent snapshot boundaries, canceled/same-anchor excursions, native descendant re-anchoring, old-anchor/wrong-root challenge substitution, in-flight reservation, retained private archive versus explicit public continuation, and equal content digests across distinct roots/units. These fictional captures are local relation controls, not evidence of provider behavior. The independent rendered Atlas witness passed at desktop 1280px and mobile 390px; exact targeted source-byte qualification and limitations are in [ATLAS_BROWSER_FINDINGS.md](ATLAS_BROWSER_FINDINGS.md).

See [ATLAS_FINDINGS.md](ATLAS_FINDINGS.md) for source discoveries and [ATLAS_BROWSER_FINDINGS.md](ATLAS_BROWSER_FINDINGS.md) for actual production v0.1 UI observations.

⟐
