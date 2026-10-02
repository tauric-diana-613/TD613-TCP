# Portable Loom re-entry: evidence, HOLDs and stratum projections

## Actual implementation boundary

This document describes the working v0.2 candidate inspected at checkout HEAD `4af43132fa5db6d416fd795c620f3e5b975b60c3`, including uncommitted candidate code. It supplies a source audit, not production acceptance. Exact inspected Git blobs:

| Source | Inspected blob |
| --- | --- |
| `app/engine/portable-loom-reentry.js` | `ce1095dd51dbe819e6b204cd29e929e68ce70779` |
| `app/dome-world/holonomy-loom/reentry-workspace.js` | `ad1ea3a010b8f83d05396565d93f3a11532cb638` |
| `app/engine/portable-loom-challenge.js` | `f664413eb05909350ceadbe838d1c36de956f963` |

The active engine schemas are `td613.loom.local-custody/v0.2`, `td613.loom.reentry-excursion/v0.2`, `td613.loom.bound-receiver-turn/v0.2`, `td613.loom.reentry-candidate/v0.2`, and `td613.loom.admitted-returned-work/v0.2`. These establish a **live-process local custody lane**. They deliberately establish zero foreign execution authentication, global latest-state authority, global fork exclusion or imported-record authority.

`stage()` registers exact intent before the task leaves and keeps the admitted head unchanged. `check()` compares raw declared returns and optional raw challenge evidence against that registration and leaves the head unchanged. `admit()` alone appends returned-artifact descendants and changes `continuity.current_work_unit_ref` under an exact-candidate capability, live revision/head guard, explicit review gesture and final lifetime check.

The legacy seed's verified preparation/result reference is stored separately. Before the first v0.2 admission, `continuity.current_work_unit_ref` is null even though `seed.anchor_ref` exists. A prepared seed supplies a verified local preparation anchor; it supplies no newly admitted returned ancestry.

## Classification vocabulary

| Class | Exact meaning in this tranche |
| --- | --- |
| `LOCALLY_REGISTERED` | The local engine retained the operator-supplied task/source/withholding input before egress. It proves registration occurred here. |
| `LOCALLY_OBSERVED_CAPTURE` | Loom received exact pasted bytes through its local input. It proves possession of those supplied bytes; foreign origin remains declared. |
| `RECOMPUTED` | Loom independently recomputed a digest, shape/relation comparison or bounded assay from supplied/held data. It proves that computation's result under this implementation. |
| `DECLARED` | Receiver or operator supplied a claim. The claim's presence is observed; its asserted foreign fact remains unverified. |
| `CHALLENGED` | A bounded declared episode was compared with local ground truth and its capture. This label retains positive/negative/incomplete outcomes and scope; it grants no universal safety theorem. |
| `HELD` | The requested local transition lacks a required relation, evidence item, live capability, review gesture or lifecycle condition. It leaves the admitted head unchanged. |
| `ADMISSION_CANDIDATE` | This exact returned record matched the current local registration and required review declarations; ancestry has yet to advance. |
| `ADMITTED` | The local custodian executed its guarded append/head transition. Returned content remains `DECLARED_RETURNED_CONTENT`; admission authenticates the local transition, not foreign execution. |
| `UNRESOLVED` | The present record does not identify a disputed foreign process/origin coordinate. A status change, hash or four-role agreement cannot remove it. |

These labels describe different coordinates. A receiver declaration can be retained inside an admitted work unit without becoming an observed foreign fact. A local capture can be recomputed without its source becoming authenticated. Equality is asserted only in the coordinate actually compared.

## Exact field classification

### Root and live custody

| Fields | Required? | What is established | What remains outside the aperture |
| --- | --- | --- | --- |
| `session_id`, `source_revision`, `root.ref` | Required | Inherited from a live-branded locally produced seed; root body replayed against its packet | A source-revision string, including a SHA-shaped string, does not prove deployed source or external origin. |
| `root.packet_digest`, `original_task_digest`, `policy_commitment`, `root_rules`, `selected_commitments` | Required | Recomputed integrity of root construction and inherited policy | Source truth, author identity and receiver processing remain unresolved. |
| `root.withheld_document_count` | Required | Exact retained aggregate declaration/selection coordinate | Identities/bodies of withheld files and foreign possession of other copies remain unobserved. |
| `seed.anchor_ref`, `seed.class`, `seed.content_ref` | Required | Replay-verified legacy preparation/result class and separate content relation | Seed preparation never implies foreign execution or admitted returned descendant. |
| `continuity.current_work_unit_ref`, `current_admitted_result_ref`, `work_unit_count` | Required | Local live closure's current admitted coordinates | Copied/browser-restored records cannot become authoritative heads. |
| `authority` | Required | Explicit local scope, no imported authority, no global fork/execution authentication | No hidden remote authority transfers through this record. |
| `work_units`, `route_history`, `admission_records`, `claim_ceiling` | Required | Locally appended history, full admitted candidate records and retained limitations | Recorded route is neither unchanged-state nor exteriority proof. Admission records may contain private challenge ground truth and remain private/local review material. |

Live WeakSet branding is a process-local custody marker, not a cryptographic signature. Legacy derived sessions retain that marker only if the input session was already live. Seed integrity replay by itself never upgrades parsed JSON. A consumed-root registry refuses another lane for the same root in this module/process, including reopening after closure; separate processes remain beyond its exclusion scope.

### Registered excursion and individual intent

| Fields | Required? | Classification/check | Residue |
| --- | --- | --- | --- |
| `excursion_id`, `intent_id` | Required | Locally generated UUIDs retained before egress | Echo authenticates no receiver identity; they distinguish local registrations. |
| `session_root_ref`, `policy_commitment`, `anchor_work_unit_ref`, `content_predecessor_ref` | Required | Bound to current local root/frozen policy/departure anchor/content coordinate | Same root never implies same work unit or source evidence. |
| `issued_at`, `expires_at` | Required | Local clock/lifetime; default fifteen minutes, bounded configuration from one second to one hour | Clock is a local instrument; Rest supplies no deadline extension. |
| `effective_rules` | Required | Frozen registered policy; no v0.2 add/remove/replace surface | Natural-language interpretation/enforcement in the receiver remains unresolved. |
| `turn_index`, `previous_intent_ref`, `excursion_ref` | Required | Local contiguous registration order and predecessor binding | This is registered task order, not authenticated receiver-internal turn history. |
| `task`, `task_digest` | Required | Exact locally registered text and recomputed digest | Task carriage supplies no processing/use proof. |
| `documents`, `selected_commitments`, `source_commitment_digest` | Required, lists may be empty | Explicit bodies `{id,name,text}`; each body and the commitment list hashed locally | Document ID membership and byte equality supply no actual model-use or truth proof. |
| `withheld_document_count` | Required | Bounded aggregate deliberate-withholding input, zero through eight | The engine cannot recover which document was withheld from a count alone. |
| `evidence_class: LOCAL_OPERATOR_REGISTRATION`, intent `ref` | Required | Local registration plus canonical digest | Digest identifies exact retained content under this encoding; origin remains separate. |

Each task chooses source bodies anew. The native source input starts empty and clears after registration. Root governance persists; source bodies never inherit by implication.

### Bound receiver return and captured input

| Fields | Required? | Exact check | Residue |
| --- | --- | --- | --- |
| `schema` | Required exact v0.2 | Strict field/schema allowlist | A matching schema label supplies no identity proof. |
| `excursion_ref`, `intent_ref`, `session_root_ref`, `policy_commitment`, `anchor_work_unit_ref`, `turn_index`, `task_digest`, `source_commitment_digest` | Required | Exact echo of independently retained registration | Same echo can be fabricated without receiver execution. |
| `answer`, `answer_digest` | Required | Bounded answer and SHA256 of canonical JSON string(answer), recomputed locally | Digest binds the receipt declaration to the answer; it authenticates neither author nor foreign process. |
| `used_document_ids` | Required, possibly empty | Unique IDs, subset of the intentionally selected source set | Receiver-reported use remains declared. Undeclared use with the same answer may survive every local check. |
| `missing_information` | Required, possibly empty | Retained bounded unique receiver declarations | Empty list cannot establish epistemic completeness; receiver omissions remain possible. |
| `receiver_declaration.policy_change_requested` | Required boolean | `true` produces HOLD | `false` remains a self-report and may coexist with implicit/prose weakening. |
| `receiver_declaration.notes` | Required | Retained bounded declaration text | Notes receive no execution/enforcement authority. |
| Input `raw` | Required per registered turn | Exact supplied raw return retained separately from parsed semantic object | Pasted capture is locally observed supplied material; no remote-origin claim follows. |
| Input `policy_review` | Required exact `ROOT_RULES_RETAINED` for candidacy | Operator declaration of review | The system measures neither human comprehension nor semantic completeness. |

The native parser retains each object's pasted interior bytes, including whitespace/key order, or exact captured text carried as a JSON string. Canonical semantic commitments and raw capture commitments remain different relations.

An ordinary foreign model may be unable to compute SHA256. Missing/wrong `answer_digest` remains unbound and HELD; the current route requires real computation capability. An operator-bound capture route is documented as a future distinct evidence class in `APERTURE_FINDINGS.md`, never an automatic upgrade of a legacy receipt.

### Candidate, challenge and admitted descendant

| Fields | Classification | Consequence/limit |
| --- | --- | --- |
| Candidate `status`, `reasons` | Local comparison result | Matching alone creates a candidate; it never mutates ancestry. |
| `expected_head_ref`, `expected_content_ref`, `departure` | Local custody frame | Admission must still match the same live revision/state/excursion and head. |
| `returned_turns`, candidate `ref` | Exact retained capture/parsed return plus recomputed digest | Imported/reformatted candidate objects lose the WeakMap capability, even with a valid digest. |
| `evidence`, `unresolved_alternatives`, `claim_ceiling` | Typed local observations/recomputation and retained residues | They travel with admission; no status-based evidence-class promotion. |
| Attached raw `bundle`, `candidate`, `capture` | Optional declared challenge data | If selected, commitments and public/private projection are recomputed; exact structured return must match captured `reply`. |
| Candidate `challenge.{ref,status,evidence_class}`, `challenge_scope` | Bounded challenge result/reference | `evidence_class` is supplied metadata; this engine does not authenticate its acquisition source. `DECLARED_CHALLENGE_EPISODE_ONLY` limits its use. |
| Candidate `challenge_evidence` | Retained exact raw optional bundle/return/capture | Private local evidence needed to replay the selected assay; ground truth is excluded from public continuation carriers. |
| Admitted `predecessor_work_unit_ref` | Locally authenticated transition relation | Points to preceding local unit or explicit seed for the first returned unit. |
| Admitted `content_predecessor_ref` | Separate content relation | Points to preceding admitted result; null can coexist with a valid preparation seed. |
| `receiver_anchor_work_unit_ref`, `foreign_turn_index` | Receiver-declared departure anchor plus local order | Batched returns can echo the same departure anchor while local parent refs advance; foreign ancestry remains unauthenticated. |
| `task`, `selected_documents`, `selected_commitments`, `withheld_document_count`, `policy` | Retained registered input and frozen governance | Bodies are selected supports; withheld bodies stay outside this local record. |
| `admitted_result`, `admitted_result_ref` | Declared returned content with recomputed identity | `foreign_origin_authenticated: false` survives admission. |
| `captured_return`, `capture_digest`, `receipt_digest`, `candidate_ref`, unit `ref` | Raw/semantic/decision identities remain distinct | Canonical equal parsed returns can have different raw captures; digest integrity supplies no origin theorem. |
| Admission event `local_ledger_advanced` | Observed local operation | True only after guarded atomic append; `foreign_execution_authenticated` remains false. |

Challenge evidence is optional. A missing challenge is explicitly `NOT_PERFORMED`; it never becomes a clean challenge result. Selecting an attached exposure/incomplete episode produces HOLD. If an operator excludes an available episode, this tranche cannot claim that all known adverse observations were adjudicated: the accepted artifact remains scoped to the selected evidence. The UI's attachment choice must never support a broader enforcement/safety claim.

Full admitted candidates live in private `admission_records`; exact raw returns and selected source bodies remain replayable there. A local custody export is a **private review record**, containing any retained local challenge ground truth. It must never be labeled or routed as a public foreign-carriage packet. Public governed continuation carries the latest admitted result and deliberately selected source bodies and excludes private candidate/assay records. Saving a local/private record supplies no restoration authority.

## Exact HOLD and rejection map

The engine sometimes throws a bounded validation exception; the native gesture layer presents those as HOLD without admission. Successful receipt comparison, challenge PASS and merge/test success grant no independent head-changing authority.

| Stage | Actual predicate/code family | State that stays protected |
| --- | --- | --- |
| Open lane | `HELD_IMPORTED_CUSTODY`; seed root/authority/policy/digest/ledger replay failure; missing seed | Parsed or inconsistent records cannot mint local authority. |
| Open lane | `HELD_DUPLICATE_LOCAL_CUSTODY` | One root cannot create parallel/reopened lanes in the same process. |
| Open lane | `HELD_SEED_POLICY_EXTENSION` | Seed rule additions require an independent reviewed policy lane. |
| Register | Invalid shape/body/count/limits; `HELD_EXPIRED`; sixteen-turn/128-unit bounds | No extra intent or changed admitted head. |
| Register | `HELD_STALE_LOCAL_STATE`; `HELD_EXPIRED_OR_CLOCK_REVERSED` | Async race/expiry cannot publish the registered operation. |
| Check | `NO_REGISTERED_EXCURSION`; `EXPIRED_OR_CLOCK_REVERSED`; `INCOMPLETE_REGISTERED_TURN_RANGE` | No retrofitted or partial-range ancestry advance. |
| Check | `POLICY_REVIEW_REQUIRED:n`; `MALFORMED_OR_UNBOUND_RETURN:n` | Unsupported or unreviewed return remains unadmitted. |
| Check | `SUBSTITUTED_*:n`; `ANSWER_SUBSTITUTION:n`; `UNDECLARED_SOURCE:n`; `POLICY_WEAKENING_REQUESTED:n` | Registration, answer and source/policy boundaries remain fixed. |
| Check | `CHALLENGE_INTEGRITY_OR_CAPTURE_HOLD`; `CHALLENGE_*` exposure/incomplete/reference status | Changed or adverse attached episode cannot supply a clean admission candidate. |
| Check | `STALE_LOCAL_STATE` | Cancel/register/close races invalidate candidate issuance. |
| Admit | `UNISSUED_OR_INSUFFICIENT_CANDIDATE`; `STALE_OR_REPLAYED_CANDIDATE` | Parsed copies, held candidates and consumed/stale capabilities cannot mutate history. |
| Admit | `HEAD_COMPARE_AND_SWAP_FAILED` | Changed head/revision/excursion, concurrent loser or closed lane cannot append. |
| Admit | `EXPLICIT_REVIEW_GESTURE_REQUIRED`; `EXPIRED_OR_CLOCK_REVERSED` | Missing exact review or elapsed/reversed-clock lifetime holds final transition. |
| Continue carrier | `HELD_NO_ADMITTED_DESCENDANT`; `HELD_SOURCE_NOT_IN_LATEST_ADMITTED_TURN`; `HELD_STALE_LOCAL_STATE` | No implicit prior-source inheritance or stale continuation. |

The lifetime is checked around asynchronous work and at the final admission fence. The atomic state assignment has no await after its guard. Rest preserves pending tasks and head while the deadline continues. Discard removes pending local intent/candidate, never recalls copied/sent foreign material. Closing terminates the local lane; exported records remain review-only. Reload requires an independent recovery/custody witness rather than a client digest pretending to supply one.

## Heterostratigraphic holonomy tomography

The scientific object here is a typed comparison of projections through heterogeneous strata. The recorded route itself supplies no truth proof, geometric measurement, unchanged hidden state or empirical exteriority. This is a bounded protocol assay of what survives each representation.

| Stratum | Surviving relation | New observation/declaration | Loss/residue | Lawful local action |
| --- | --- | --- | --- | --- |
| Loom seed | Root/policy and verified preparation/result | Local packet selection and seed replay | No returned descendant yet; source origin unresolved | Open one bounded live custody lane. |
| Registered departure | Exact task/source/withholding, nonce, seed/current anchor and content predecessor | Local pre-egress registration | Foreign use unobserved; deadline begins | Inspect/copy exact task or Rest/Discard. |
| Foreign receiver | Echoable root/policy/intent/task/source commitments | Foreign acknowledgement/answer declaration | Hidden context, instructions, tools and source-use paths unresolved | No direct local mutation. |
| Proceeding task | Local registered index and previous intent | Another explicit task | Receiver-internal intermediate history remains unobserved | Register next task with new explicit source selection. |
| Additional sources | Per-task selected bodies/commitments | New local support supplied deliberately | Earlier source bodies remain unselected; content context is separate | Carry this task's selected supports only. |
| Receiver return | Echo references, raw answer, declared missingness | Locally observed supplied capture plus receiver declaration | Same bytes admit distinct foreign histories | Check exact recorded return. |
| Challenge Receiver | Episode/root/anchor/policy, public/private projection | Bounded literal/reconstruction/joined result from exact selected capture | Untested encodings/contexts/horizons and hidden host remain open | Record PASS/exposure/HOLD without ancestry mutation. |
| Re-entry candidate | All required input/return/predecessor relations and explicit residues | Recomputed consistency; operator policy review declaration | Review cannot identify foreign execution | Present consequence; await exact admission gesture. |
| Local admission | Root policy, separately retained work/content predecessors | Atomic local append and new head | Declared receiver content remains declared | Continue from current admitted artifact. |
| Continuation carrier | Latest admitted result plus new task/frozen rules/explicit selected supports | Read-only carrier construction | Carrier records no next foreign turn and no new ancestry | Inspect/copy carrier; use registration route for another admissible return. |

Across a batch, equality in the receiver's echoed departure-anchor coordinate coexists with change in local predecessor coordinates. The same root policy can govern different tasks and different evidence. The same source ID with changed body changes its commitment. Same canonical answer with changed raw formatting preserves semantic answer identity while changing capture identity. Joined probes can change reconstructability while marginal literal scans stay clean. Each distinction remains visible in the coordinate that controls the next action.

FADT asks whether an erased distinction changes lawful support. Examples requiring retention include PREPARED versus ADMITTED, current versus stale head, candidate versus consumed capability, observed local capture versus declared foreign enforcement, absent challenge versus clean versus exposure, and selected source versus absent/withheld source. Four role agreement supplies zero additional observations.

## Withheld and absent support

`withheld_document_count` preserves a bounded aggregate **deliberate withholding** declaration; an empty selected-source list preserves **no selected support**. They are different coordinates. The local custody record deliberately omits withheld bodies and identities, so two different withheld-file histories can project to the same count. That omission is useful minimization for source admission; it prevents the stronger claim that the exact withheld corpus or its foreign absence has been observed.

Receiver `missing_information` supplies a third coordinate: declared lack of information. It cannot substitute for local withholding or source selection. A receiver can report a file missing while having another copy; it can omit missingness while lacking the file. Local selection shows what Loom deliberately carried, not the receiver's complete knowledge. A continuation's preceding answer is labeled content context and may carry derived information; it must never masquerade as another selected source body.

## Operator semantic review and exogenous witnesses

The native checkbox says the operator reviewed the returned answers against exact inherited rules, and explicitly calls that review a declaration. The admission checkbox accepts unresolved foreign claims for this local transition. Neither checkbox measures comprehension, proves all weakening was detected, validates answer truth, or observes receiver hidden state. False `policy_change_requested` can coexist with prose instructions to ignore root rules. The engine holds structured policy changes and freezes the local governing body; arbitrary-language foreign enforcement remains unresolved.

When a stronger claim matters, specify its witness rather than assigning another receipt name:

| Stronger claim | Useful independently qualified witness | Bound that remains |
| --- | --- | --- |
| Exact receiver origin/answer capture | Trusted acquisition channel binding raw response, episode, timestamp and continuous custody to independently established receiver identity | Channel authenticity alone supplies no policy enforcement proof. |
| Actual source/tool/input restriction | Complete, qualified execution trace at every relevant source/tool/input boundary for the exact episode | Uninstrumented paths and completeness uncertainty remain explicit. |
| Bounded policy-sensitive behavior | Preregistered positive/hostile action-boundary assay with matched conditions and qualified capture | One policy-sensitive boundary supplies no universal enforcement theorem. |
| Hidden retention/training/storage/retransmission | Qualified host lifecycle/storage/network telemetry or independent audit with documented channel/horizon/completeness | A policy contract can create an obligation; it does not identify actual event history. |
| Durable authenticated restoration | Independently qualified signer/custody service plus exact-root/intent/nonce binding and authenticated response | A signature on an old state supplies no latest-head or fork exclusion. |
| Global latest head/replay/fork exclusion | Trusted globally shared atomic compare-and-swap/replay ledger and signed current-head query with qualified service identity | Local process Set/WeakMap scope remains local. |
| Reconstruction/joined safety widening | Additional preregistered same-episode probes, exact context/ground truth and complete capture on the new horizon | Finite negative results retain untested alternatives; no Golden Egg R/J credit. |
| Empirical exteriority | Independently acquired exogenous evidence informative about disputed origin, qualified by episode/instrument/custody/comparison frame | Cryptographic internal integrity supplies no external acquisition. |

Western Horizon remains in force. If admitted A leaves origin Ω non-identifiable with `I(Ω;A)=0`, a transformed record `X=f(A)` supplies `I(Ω;X|A)=0`. A new checksum, signed self-attestation generated from A, dossier agreement or route return cannot supply the independent information. Useful X must discriminate the disputed alternatives under a qualified acquisition contract.

## Handoff and empirical ceilings

Current source contracts, finite tests, native browser witnesses, provider samples and independent empirical acquisition remain separate. `APERTURE_BROWSER_FINDINGS.md` records production desktop v0.1 observations; `tests/portable-loom-reentry-aperture.test.mjs` records fourteen finite v0.2 hostile controls. They must never be collapsed into a production v0.2 journey witness.

Portable-AIA roundtrip remains `HELD_INPUT_CLASS` absent its actual semantic-field object. The Aperture witness-plan adapter reports readiness of a declared next-observation plan, authenticates no references and changes no installed Aperture identity. Candidate/admission do not claim Golden Egg realization, universal secrecy, foreign-provider enforcement, empirical exteriority, hidden-host introspection or measured human comprehension.
