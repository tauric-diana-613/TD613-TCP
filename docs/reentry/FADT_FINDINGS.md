# Portable Loom re-entry: FADT findings

Status: bounded finite admissibility audit; implementation recommendations.
Research lane: PR #1406, interactive #737 scope, 2026-10-02 UTC.
Inspected branch coordinate: `3ef1ba86701843f7fde2fec29ede2bab038d934b`.
The inspected code, local fixture runs, browser evidence, and production receipts
remain separate evidence classes. This document makes no production-browser claim.

## Jurisdiction and lineage

FADT asks whether lawful action support descends through the representation the
product retains. It cannot supply the support law, authenticate a receipt,
measure a human's understanding, or establish receiver enforcement. Its input
supports here are an explicitly declared finite model.

Read sources: [AGENTS](../../AGENTS.md), [Dollhouse](../../DOLLHOUSE.md),
[FADT](../../FADT.md), [Dollhouse shortcuts](../../dollhouse/README.md),
[source lineage](../../dollhouse/lineage/README.md), and the full pinned
[original specification](../../dollhouse/lineage/originals/fadt-752-aperture_pedagogue_finite_admissibility_descent_theorem_spec_v0_1.md.source.md)
and [earned receipt](../../dollhouse/lineage/originals/fadt-752-aperture_pedagogue_finite_admissibility_descent_theorem_receipt_v0_1.md.source.md).
The theorem research remains historically unmerged; this downstream bounded
adapter cannot rewrite that status or its authority-bearing run coordinate.

The installed operational law is
`app/engine/dollhouse-continuity-audit.js::runFadtStageAudit`, which groups
explicitly occupied declared states by retained coordinates and invokes
`app/engine/dollhouse-atlas-fadt.js::runFadtAgent`.

For each occupied fibre F:

- U is the union of antecedent lawful supports.
- I is their intersection.
- Gamma is U minus I.
- Exact descent requires Gamma empty, equivalently constant support on F.

When Gamma remains, choosing U admits an action unlawful in at least one erased
history; choosing I loses an action lawful in at least one history. Neither
operation reconstructs the erased distinction. FADT supplies no preference
among tight surviving rules and no support for unoccupied states.

## The decisive counterexample already exists

The legacy `verifyPortableLoomReceiverTurnReceipt` consumes a receiver receipt,
root/policy/anchor references, expected task, and allowed source IDs. It returns
declared consistency and leaves `local_ledger_advanced: false`.

The receipt schema contains no returned answer or answer commitment. Therefore
two foreign histories can have the same receipt and byte-identical local
revalidation result while their separately captured answers differ:

| Antecedent history | Surviving receipt projection | Declared next lawful support |
| --- | --- | --- |
| Exact bounded captured answer | Same receipt/ref | Prepare a bounded candidate; rest/inspect |
| Captured private-literal exposure | Same receipt/ref | Retain head and explain HOLD; rest/inspect |

The test recomputes different answer digests, obtains identical legacy receipt
verification records, and shows the receipt-only quotient has a nonempty gap.
This demonstrates an information boundary in the actual inherited verifier;
the lawful action supports remain the declared finite model. It neither claims
a real private-data exposure nor proves universal receiver behavior.

**Receipt match cannot be the representation on which admission is defined.**
The smallest repair is a separately bound candidate plus a separate admission
law; widening the meaning of `DECLARED_TURN_MATCH` would erase the boundary.

## Retain the distinctions that control the action

The hostile finite battery keeps fifteen action-relevant coordinates and permits
presentation erasure. Its supports distinguish `ADMIT_AND_ADVANCE_LOCAL_HEAD`
from `RETAIN_HEAD_AND_EXPLAIN_HOLD`. Each pair differs in one coordinate, and
erasing that coordinate merges unequal supports into one occupied fibre.

| Retained coordinate | Pair requiring different actions |
| --- | --- |
| Stage | Admission candidate versus already admitted/consumed |
| Evidence class | Local capture plus recomputed bindings versus receiver declaration alone |
| Session root | Expected session versus valid-looking different session |
| Root policy | Preserved root versus undeclared relaxation |
| Current admitted head | Prepared-against head versus head moved before admission |
| Exact task digest | Operator task versus substituted task |
| Exact source commitments | Intentionally admitted bytes versus same-ID substituted bytes |
| Exact answer digest | Captured answer versus substituted answer |
| Candidate commitment | Recomputed exact candidate versus stale/substituted candidate |
| Work-unit predecessor | Current local admitted head versus foreign-declared parent |
| Content predecessor | Explicit foreign content parent versus collapsed work-unit parent |
| Turn consumption/order | Unconsumed ordered range versus replayed range |
| Operator intent | Admit returned work versus check-only intent |
| Exact-candidate gesture | Notice followed by gesture for this candidate versus another candidate |
| Capture boundary | Required visible channels captured versus a missing required channel |

The retained projection separates all hostile pairs in the supplied finite set.
Two eligible records with different desktop/mobile presentation labels remain
in one exact occupied fibre. This makes the positive witness stronger than
retaining an arbitrary unique state identifier. Reordering states, supports,
and retained coordinates preserves the exact report.

This is finite, model-relative sufficiency. It grants no universal schema
sufficiency, source authentication, human-comprehension finding, or real action
authority. The existing stage adapter caps conditioning at sixteen coordinates;
it is a research auditor, not the schema for the full candidate object.

## Challenge erasure has its own obstruction

Separate pairs keep the literal result clean while varying standalone
reconstruction, joined reconstruction, required-channel capture, or exact
challenge binding. Erasing any of those coordinates produces HOLD.

In particular, clean marginal probes and literal exclusion cannot erase an
observed joined-only reconstruction. A valid-looking clean challenge from
another session cannot substitute for this candidate's bounded episode.
An output capture excludes neither hidden retention nor unobserved channels.

The candidate should retain independently recomputable challenge references,
episode scope, capture-channel completeness, literal results, standalone
results, and joining results where required by its admission law. A single
`challenge_passed` boolean destroys these distinctions. If a challenge is
optional under a declared admission law, retain `NOT_PERFORMED` explicitly;
absence cannot silently become success or failure.

## Evidence and state form different coordinates

`DECLARED`, `OBSERVED`, `RECOMPUTED`, and `CHALLENGED` identify different evidence
relations. `HELD`, `ADMISSIBLE`, and `ADMITTED` identify different action stages.
They must not be compressed into one generic confidence or `verified` field.
The fixture's evidence labels remain caller declarations to FADT; the role
does not authenticate those labels by reading them.

Use per-field evidence attribution and per-operation state. A declaration may
remain a declaration inside an admitted local descendant. Admission creates a
local custody fact about exact carried bytes and a locally reviewed policy
boundary. It cannot retroactively turn receiver prose into Loom observation.

Likewise, a withheld body, an unsupplied body, and a body absent because capture
failed can share the visible surface `no-source-body` while supporting three
different next actions. The battery exhibits that gap separately.

## Conditions on the implementation

1. Preparation, check, and challenge must be pure with respect to the v0.2
   admitted-head register. Only explicit local admission may mutate it.
2. Recompute the candidate's exact payload commitment and bindings at admission.
   A previously passing check cannot authorize bytes edited afterward.
3. Compare-and-swap against the current admitted head at the mutation boundary.
   Retain replay/consumed-turn state and make duplicate admission inert or held.
4. Bind notice and gesture to the exact candidate and head. A gesture for A
   cannot authorize B; a gesture to check cannot authorize admission.
5. Keep content predecessor and work-unit predecessor separately typed and
   independently bound. A foreign content path may span several turns while
   local admission creates one descendant. Retain the range and intervening
   declarations; never fabricate local admission of intermediate turns.
6. Retain exact task, exact answer, explicit source IDs and commitments, root
   policy, route history, declared missingness, capture scope, challenge scope,
   unresolved alternatives, and evidence attribution. Digests bind retained
   bytes; they do not authenticate foreign history or external origin.
7. Natural-language policy-relaxation detection remains a bounded check.
   Root-policy commitments must remain unchanged; semantic enforcement in the
   receiver and universal prose detection remain unresolved.

The inherited v0.1 `createPortableLoomWorkUnit` advances its prepared-unit head
before result admission. The separate v0.2 re-entry lane must identify this as
a seed/prepared coordinate rather than assert it already has the meaning of
an admitted descendant head. This document does not demand changing legacy
prepared-unit behavior; it demands keeping those meanings distinct.

## Remaining HOLDs and claim ceilings

FADT cannot decide whether an unseen foreign history actually used an undeclared
source, weakened a policy internally, retained private data, or retransmitted
it through an uncaptured channel. Identical retained records can remain
compatible with those different hidden histories. Another computation of the
same admitted record supplies no exogenous witness.

The local admission law must therefore use a bounded conclusion such as:
`exact carried returned work locally admitted under the preserved root`, with
its receiver declarations and unresolved alternatives still visible.

Retain at least:

- `REVALIDATION != ADMISSION`
- `ADMISSION != PROOF_OF_FOREIGN_ENFORCEMENT`
- `ANCESTRY_ADVANCE != EXTERIORITY_PROOF`
- `ROUTE_RETURN != STATE_IDENTITY`
- `SESSION_CONTINUITY != CONTENT_CONTINUITY`
- `DOLLHOUSE_ROLE_AGREEMENT != EVIDENCE_MULTIPLICATION`

No FADT finding here closes Aperture's exteriority boundary, Atlas's foreign
custody uncertainty, or Pedagogue's actual browser consequence witness.

## Replay command

```bash
node --test tests/portable-loom-reentry-fadt.test.mjs
```

The test file invokes existing finite stage audit and inherited portable-session
functions. It executes no provider, network, production, or admission operation.
Its local synthetic inherited-result preparation is a bounded fixture only.
All positive stage reports retain `support_authenticated: false`,
`stage_admission_verified: false`, and `actions_executed: false`.

⟐
