# EMSTD613 · Authority Provenance Geometry Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Rupture

Current TD613 machinery separately preserves:

```text
claim provenance
observation geometry
route memory
substrate/custody boundaries
human closure
```

The missing object tested here is the provenance of permission itself.

Candidate fourth geometry:

```text
G_P = authority-provenance geometry
```

It asks:

> By what exact receipted path did a right become valid here, for this actor/layer, over this object, under this deficit, for this duration, and through what attenuation/restoration history?

This is distinct from:

```text
G_O = observation geometry
G_S = substrate/dependency geometry
G_A = current authority topology
```

Candidate separation:

```text
G_O != G_S != G_A != G_P
```

## 1. Why current authority vectors are insufficient

A current authority vector can be identical for two systems while the rights have incompatible histories.

Example:

```text
A_now(X) = {propose, mutate}
A_now(Y) = {propose, mutate}
```

but:

```text
X.mutate arose from declared human delegation with bounded scope and unexpired receipt
Y.mutate reappeared through automatic snapback after a prior HOLD
```

Current-state equality therefore does not establish permission equivalence.

```text
SAME_AUTHORITY_VECTOR != SAME_AUTHORITY_PROVENANCE
```

## 2. Authority edge object

Represent each consequential right as a provenance-bearing edge:

```text
AuthorityEdge = (
  right,
  grantor,
  grantee,
  governed_object,
  deficit_jurisdiction,
  basis,
  scope,
  issued_at,
  expires_at,
  parent_edge,
  attenuation_chain,
  hold_history,
  restoration_receipt,
  revocation_state,
  replay_status
)
```

No field independently proves legitimacy. The tuple preserves the route needed for audit.

## 3. Four independent questions

For any action candidate `u`:

```text
OBSERVATION: can this layer see enough to characterize u?
SUBSTRATE: what system/object would u touch?
AUTHORITY: does the layer presently possess the right class required by u?
AUTHORITY_PROVENANCE: did that right arrive through an admissible, still-valid route?
```

A yes in the first three may coexist with a no in the fourth.

## 4. Paired counterfactual

Hold fixed:

```text
observation geometry
substrate geometry
current authority vector
action candidate
current sensor state
human identity
```

Vary only authority provenance.

### P0 · EARNED EDGE

```text
human -> bounded delegation receipt -> layer
no intervening revoke
scope includes action
expiry valid
```

### P1 · ORPHANED EDGE

```text
historical right existed
HOLD occurred
failure cleared
right silently reappears in current vector
no restoration receipt
```

### P2 · OVERBROAD DESCENDANT

```text
parent right = read
child right = read + mutate
```

No admissible widening edge exists.

### P3 · STALE EDGE

```text
delegation receipt exists
expiry passed or governed object changed
current vector still exposes right
```

Required distinction:

```text
P0 may remain admissible
P1/P2/P3 must not inherit legitimacy from current-vector equality
```

## 5. Interaction with monotonic attenuation

EMSTD613 source material on delegated capability chains supplies a hostile structural constraint:

```text
downstream derivation may narrow rights
!=
downstream derivation may silently widen rights
```

Thus a provenance graph can contain monotone attenuation edges without implying that every authority relation must be globally monotone.

Local reauthorization may widen a held vector only through a distinct admissible grant/restoration edge.

## 6. Authority debt

Define an `authority_debt` state when a consequential right is represented in the current operational vector but lacks a complete admissible provenance path.

```text
authority_debt(right) = true
```

if any required provenance element is unresolved, expired, revoked, orphaned, or scope-incompatible.

Authority debt does not infer malice or compromise. It records a missing legitimacy route.

Candidate law:

```text
CURRENT_PERMISSION + AUTHORITY_DEBT
!=
LAWFULLY_EXERCISABLE_PERMISSION
```

## 7. Pedagogue role

Pedagogue asks:

1. What right is being exercised?
2. What consequence does that right permit?
3. Which prior event granted or restored it?
4. Does the route include silent widening, expired scope, or snapback?
5. Would a simpler current-state model erase a meaningful authority distinction?
6. What harmless fixture can separate provenance-bearing permission from orphaned permission?

Pedagogue may not invent the missing grant edge.

## 8. Aperture role

Aperture audits whether the declared observations can distinguish:

```text
M0 same current authority + same provenance
M1 same current authority + different provenance
M2 different current authority + same provenance family
M3 provenance unresolved
```

If no observation exposes the permission history, Aperture must classify provenance identifiability as unresolved rather than treating present authority as sufficient evidence.

## 9. Cistern relation

Cistern already preserves:

```text
SAME_ENDPOINT != SAME_ROUTE
SAME_ROUTE_SHAPE != SAME_AUTHORITY
```

Candidate extension:

```text
SAME_AUTHORITY != SAME_AUTHORITY_ROUTE
```

Payload-route receipts and authority-route receipts are distinct objects even when both participate in one consequential transition.

## 10. Safe Harbor relation

Safe Harbor preserves the provenance of authorship/custody claims so recognition or resemblance cannot silently become authorship.

This assay asks for the analogous non-collapse on permission:

```text
recognized capability != earned capability
present capability != receipted capability
```

No genealogy claim between these mechanisms is implied by the analogy.

## 11. Failure modes exposed by G_P

A current authority topology without authority provenance can miss:

```text
snapback privilege resurrection
delegation scope creep
stale authority after object/route change
revoked-right reappearance
cross-route right laundering
right inheritance without grantor jurisdiction
permission replay after intended one-shot use
```

These are mechanism classes, not assertions about current TD613 production behavior.

## 12. Disconfirmers

The fourth-geometry candidate weakens if:

- every consequential permission is already fully reconstructed from existing Cistern/AIA receipts without any new state;
- provenance differences never alter admissibility, recoverability, or replay outcome;
- current authority vectors plus existing route memory uniquely determine every grant/attenuation/restoration history;
- the proposed object merely renames custody provenance without distinguishing permission lineage.

## 13. Claim ceiling

A bounded passing assay may support only:

```text
AUTHORITY_PROVENANCE_DISTINGUISHABLE_FROM_CURRENT_AUTHORITY_IN_FIXTURE
CURRENT_PERMISSION_NOT_SUFFICIENT_FOR_PERMISSION_ROUTE_IDENTITY_IN_FIXTURE
AUTHORITY_DEBT_REPRESENTATION_CANDIDATE
FOURTH_GEOMETRY_CANDIDATE_FOR_DOME_WORLD
```

It may not support:

```text
production vulnerability
security compromise
universal authorization theorem
automatic AIA/Cistern mutation
identity or motive inference
```

## 14. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
