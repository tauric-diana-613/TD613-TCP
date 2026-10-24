# EMSTD613 · Cistern Permission-Ancestry Blindspot Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Source-witnessed asymmetry

Current `compileCisternLawReceipt()` admits a consequential route from:

```text
exact route match
+ required human witness observed
+ bounded intent
```

and records request/session/intent/egress digests plus replay posture.

It explicitly prevents observed context from granting release authority.

The current receipt does not contain a first-class authority-edge ancestry object with grantor, grantee, parent authority edge, attenuation chain, expiry chain, revocation history, or restoration parent.

This assay tests whether that omission can make two non-equivalent permission histories observationally identical to Cistern.

## 1. Paired fixture

Hold fixed:

```text
boundary
action
expectedRoute
observedRoute
human witness state
bounded intent
request digest
session digest
spent-intent digest
durable tombstone
egress digest
```

Vary only the authority ancestry behind the actor/layer presenting the route.

### C0 · VALID GRANT

```text
human grantor -> bounded consequential right -> current actor
scope matches action
unexpired
not revoked
```

### C1 · ORPHANED SNAPBACK

```text
same right existed historically
right entered HOLD
failure later cleared
current actor again presents identical current right
no restoration edge exists
```

### C2 · SILENT SCOPE WIDENING

```text
parent right = inspect
presented right = inspect + release
no widening grant exists
```

### C3 · STALE OBJECT BINDING

```text
grant valid for object O_0
route now acts on O_1
all other receipt fields identical
```

## 2. Blindspot criterion

If current Cistern receipt generation returns observationally equivalent admissibility/outcome for C0-C3 because authority ancestry is not part of the input contract, then:

```text
CISTERN_ROUTE_ADMISSIBILITY
!=
COMPLETE_PERMISSION_PROVENANCE_ADMISSIBILITY
```

This does not mean Cistern is defective in its declared purpose. It identifies a possible complementary layer.

## 3. Fourth-geometry relation

Let:

```text
G_A = present authority topology
G_P = authority-provenance geometry
```

This assay attempts to construct:

```text
G_A(C0) = G_A(C1)
G_A(C0) = G_A(C2)
G_A(C0) = G_A(C3)
```

at the present-vector surface while:

```text
G_P(C0) != G_P(C1) != G_P(C2) != G_P(C3)
```

If Cistern cannot distinguish these without an added authority-ancestry witness, `G_P` carries independent information.

## 4. Devastation test

The strongest falsifier is not a negative control elsewhere. It is current Cistern itself.

Attempt to prove that existing fields already entail authority ancestry:

```text
route.exact_route_match
witness.human_observed
witness.bounded_intent
session_digest
spent_intent_digest
durable_tombstone
```

If those fields uniquely determine the grant/attenuation/revocation/restoration path, the blindspot collapses.

If they do not, the asymmetry survives.

## 5. Candidate architecture if separation survives

Do not mutate Cistern yet.

Candidate separate object:

```text
AuthorityRouteReceipt
```

with minimally:

```text
authority_edge_id
right
grantor
grantee
governed_object
scope
parent_edge
attenuation_history
hold_history
restoration_parent
revocation_state
issued_at
expires_at
replay_state
```

Then a consequential transition could require two independent receipts:

```text
PayloadRouteReceipt
AuthorityRouteReceipt
```

Anti-collapse:

```text
valid payload route != valid authority route
valid authority route != valid payload route
```

## 6. Why two receipts matter

Payload route answers:

> Did the consequential information/action traverse the admitted path?

Authority route answers:

> Did the actor/layer possess this exact consequential right through an admissible still-live permission path?

Those are different forensic questions.

## 7. Claim ceiling

A passing assay may support only:

```text
CURRENT_CISTERN_CONTRACT_DOES_NOT_FIRST_CLASS_AUTHORITY_ANCESTRY
PAYLOAD_ROUTE_AND_PERMISSION_ROUTE_SEPARATION_CANDIDATE
AUTHORITY_ROUTE_RECEIPT_CANDIDATE
```

It may not support:

```text
production exploit
unauthorized access occurred
Cistern insecurity certification
mandatory architecture change
```

## 8. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
