# EMSTD613 · Deficit-Indexed Authority Poset Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Correction to the prior candidate

The phrase `authority inversion` is useful for a local two-layer handoff but can falsely imply a global ladder.

The stronger candidate is:

```text
authority is partially ordered by capability/jurisdiction,
not totally ordered by intelligence, information, or station height
```

A layer may dominate another for one consequential right while remaining subordinate or incomparable for another.

## 1. Source motivation

EMSTD613 autonomous-agent governance describes:

- non-compensable objection rights;
- hard veto rules that weighted scalar aggregation must not average away;
- monotonic capability attenuation across delegation chains;
- external enforcement whose execution jurisdiction does not imply semantic authorship or global policy ownership.

TD613/AIA already separates route surfaces, keeps human closure distinct, and forbids authority crossing. Aperture already rejects one scalar crown across heterogeneous deficit classes.

The candidate is therefore a cross-architecture relation, not an assertion of derivation.

## 2. Authority rights

Let the bounded right set be:

```text
R = {
  observe,
  propose,
  abstain,
  veto,
  interrupt,
  mutate_synthetic,
  mutate_live,
  release,
  custody,
  exit,
  close
}
```

For layer `L_i` under deficit `d`, define:

```text
A_d(L_i) subseteq R
```

The ordinary subset relation gives a local partial order only where rights are comparable:

```text
L_i <=_d L_j iff A_d(L_i) subseteq A_d(L_j)
```

Many pairs should remain incomparable.

## 3. Incomparability example

Under a declared reconstruction deficit:

```text
A_d(Aperture) = {observe, propose, abstain}
A_d(Human)    = {veto, release, close}
```

Neither set contains the other.

Therefore:

```text
Aperture || Human
```

with `||` meaning incomparable in this local authority poset.

This is more precise than saying Human is simply 'higher' or Aperture is simply 'lower'.

## 4. Deficit re-indexing

For a different deficit, local rights may change:

```text
A_thermal(Guard)     = {observe, interrupt}
A_thermal(Semantic)  = {propose}

A_semantic(Guard)    = {}
A_semantic(Semantic) = {observe, propose}
```

Thus the authority relation is indexed by the failure/deficit class:

```text
<=_d
```

rather than one universal ordering `<=`.

## 5. Non-compensable veto

A veto right is non-compensable when no number or weight of non-veto approvals can synthesize it away.

For proposal set `P` and validator `V`:

```text
veto_V(P) = true
```

must not become:

```text
allow(P) = true
```

solely because a scalar aggregate of other agents exceeds a threshold.

This is a structural right, not a score contribution.

## 6. Monotonic attenuation

For delegated capability path:

```text
L0 -> L1 -> L2 -> ... -> Ln
```

require local delegation:

```text
A(L_{k+1}) subseteq A(L_k)
```

for inherited delegable rights unless an independently authorized source grants a new right.

A downstream agent may not create a missing right by deleting restrictions.

## 7. Hostile total-order control

Construct two systems with identical right assignments.

### P0 · total-order renderer

Forces all layers into one scalar or rank:

```text
L1 < L2 < L3 < L4
```

and resolves conflicts by rank.

### P1 · local poset renderer

Preserves rights as sets and leaves incomparable layers incomparable.

Test cases must include:

- high-observation / no-release layer vs low-observation / release layer;
- high-semantic-capacity layer vs low-capacity interrupt guard;
- custodian vs auditor;
- specialist veto vs majority approval;
- implementation/synthetic-mutation rights vs live-mutation rights.

## 8. Failure criterion for total ordering

P0 fails when any forced rank implies an undeclared right transfer, including:

```text
observability -> release
semantic capacity -> interrupt
custody -> interpretation
implementation access -> live mutation
majority score -> override non-compensable veto
```

## 9. Pedagogue role

Pedagogue asks:

1. Which right is actually in dispute?
2. Is the conflict local to one deficit class?
3. Are the compared layers genuinely comparable?
4. Does forcing a rank erase a meaningful non-equivalence?
5. Does the proposed structure increase operator burden without clarifying consequence?

## 10. Aperture role

Aperture asks whether the current observations distinguish:

```text
M0 global authority ladder
M1 static capability sets
M2 deficit-indexed authority poset
M3 mere naming differences with identical rights
```

A finding of different titles/stations without different rights is not evidence for M2.

## 11. AIA research consequence

Current AIA route law correctly states:

```text
No AIA route gains station authority. Only the human closes.
```

This assay does not challenge that law.

It asks whether a future bounded representation should distinguish:

```text
global station authority
```

from:

```text
route-local non-transferable rights
```

while preserving:

```text
authority_may_cross = false
human_closure_required = true
```

## 12. Required anti-equivalences

```text
more rights != more intelligence
more information != broader authority
incomparability != ambiguity
veto != vote weight
custody != closure
proposal != execution
synthetic mutation != live mutation
local jurisdiction != global sovereignty
delegation != authority creation
```

## 13. Claim ceiling

A passing bounded assay may support only:

```text
TOTAL_ORDER_INSUFFICIENT_FOR_DECLARED_AUTHORITY_ASSIGNMENTS_IN_FIXTURE
DEFICIT_INDEXED_AUTHORITY_POSET_CANDIDATE_SUPPORTED_LOCALLY
NON_COMPENSABLE_RIGHT_REPRESENTATION_REQUIRED_IN_FIXTURE
```

It may not support:

```text
universal governance theorem
production AIA authority redesign
automatic rights allocation
political or legal authority claims
human authority reduction
```

## 14. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
