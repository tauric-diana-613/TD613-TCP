# EMSTD613 · Authority Hysteresis & Route-Memory Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Candidate

The previous assay separates observation, substrate, and authority geometry. This assay asks whether authority restoration after a failure must itself preserve route history.

Candidate law:

```text
capacity restored
!= authority restored

failure cleared
!= prior authority automatically reinstated

same operational endpoint
!= same authority route
```

This is a candidate extension of Cistern route memory into deficit-indexed authority dynamics. It does not modify Cistern Law or AIA.

## 1. Motivation from EMSTD613

Observed source structures include:

- monotonic capability attenuation in delegated agent warrants: downstream rights may shrink but not locally expand;
- non-compensable veto rights that cannot be averaged away by a higher-capacity collective;
- algedonic interruption that bypasses the semantic layer when the semantic layer lacks the relevant failure sensor;
- memory hysteresis where restoring resource capacity does not recreate information already discarded;
- recovery architectures that preserve an external checkpoint or archival state rather than treating a resumed working surface as proof of full restoration.

The shared candidate is not generic hysteresis. It is asymmetric restoration of permission after a route-changing failure event.

## 2. TD613 comparison surface

Existing Cistern Law already preserves:

```text
SAME_ENDPOINT != SAME_ROUTE
SAME_ROUTE_SHAPE != SAME_AUTHORITY
```

and requires human-latched actuation, receipts, bounded intent, and durable replay state for consequential routes.

Current repository search did not identify an explicit generic law named authority restoration / reauthorization / authority hysteresis. Absence from search is not proof of conceptual absence elsewhere in the corpus.

## 3. State

For a layer `L` at time `t`, define a bounded authority vector:

```text
A_t(L) = (
  propose,
  veto,
  interrupt,
  mutate,
  release,
  custody,
  close
)
```

Define:

```text
F_t       declared failure predicate
K_t       current capacity/viability state
Q_t       route-history state
R_plus_t  future lawful recoverability state
```

A failure transition may attenuate authority:

```text
A_before --F--> A_held
```

The central question is whether:

```text
not F
```

is sufficient to permit:

```text
A_held -> A_before
```

The candidate says no for consequential rights.

## 4. Authority hysteresis

Define two thresholds/events:

```text
tau_hold     condition that attenuates or suspends authority
tau_restore  independently witnessed condition that permits reauthorization
```

with:

```text
tau_restore != logical negation of tau_hold
```

for any consequential right whose unsafe exercise could destroy route/custody/recovery evidence.

Authority hysteresis exists in this local fixture when restoration requires additional route evidence after the original failure clears.

## 5. Paired synthetic fixture

Identical initial system:

```text
L_semantic = high-capacity adaptive layer
L_guard    = failure-sensor / interrupt layer
L_archive  = checkpoint + route receipt custody
L_human    = closure / reauthorization authority
```

Failure:

```text
F becomes true
L_guard interrupts
A_semantic.mutate := false
checkpoint C_0 retained
hold receipt H_0 retained
```

Then the failure sensor returns below threshold.

### Fixture R0 · SNAPBACK

```text
not F -> A_semantic.mutate := true automatically
```

No replay of the held transition is required. No human or separate reauthorization receipt is required.

### Fixture R1 · HYSTERETIC REAUTHORIZATION

```text
not F -> system remains HELD
```

Restoration additionally requires:

```text
failure-clear receipt
checkpoint integrity receipt
route-memory comparison
no unresolved authority widening
explicit reauthorization event for consequential rights
```

Only then:

```text
A_semantic.mutate := true
```

Human closure remains separate from runtime reauthorization unless the fixture explicitly declares the human as the reauthorizing authority.

## 6. Hostile sequence test

Run the same two failure episodes in opposite order:

```text
Route P:
F_sensor -> HOLD -> clear -> F_custody -> HOLD -> restore

Route Q:
F_custody -> HOLD -> clear -> F_sensor -> HOLD -> restore
```

The assay must preserve the exact transition sequence.

If P and Q end at the same current capacity and same nominal authority vector but carry different unresolved receipts or restoration prerequisites, then endpoint equality cannot erase authority history.

Do not call this holonomy. At most it is a route-order dependence candidate until a separately authorized formal-holonomy assay establishes the relevant mathematical structure.

## 7. Recoverability criterion

A restoration is lawful in this fixture only if:

```text
pre_hold_checkpoint_recoverable = true
hold_reason_preserved = true
failure_clear_witnessed = true
route_history_replayable = true
restoration_authority_declared = true
no_undeclared_right_reappears = true
```

A snapback restoration fails if any consequential right reappears solely because `F=false`.

## 8. Pedagogue questions

Pedagogue must ask:

1. Which right was attenuated?
2. Which deficit gave the guard jurisdiction to attenuate it?
3. What exact event is allowed to restore that right?
4. Does restoration erase or preserve the history of why authority was lost?
5. Can a system arrive at the same endpoint through a route that never earned restoration?
6. Is the restoration burden proportionate to the consequence of the right being restored?

Pedagogue does not choose the restoration authority.

## 9. Aperture audit

Aperture distinguishes at least:

```text
M0 ordinary threshold reset
M1 state hysteresis only
M2 authority hysteresis
M3 route-memory artifact with no authority effect
```

Required observation:

Hold current capacity, sensor state, substrate state, and nominal endpoint fixed while varying whether restoration history is required.

If present observations cannot distinguish M2 from M3, Aperture must ABSTAIN rather than promote authority hysteresis.

## 10. Cistern compatibility

This assay adopts but does not alter Cistern principles:

```text
SAME_ENDPOINT != SAME_ROUTE
SAME_ROUTE_SHAPE != SAME_AUTHORITY
```

Candidate extension:

```text
SAME_CURRENT_STATE != SAME_RESTORATION_AUTHORITY
```

and:

```text
RESTORED_CAPACITY != RESTORED_PERMISSION
```

A future Cistern integration would require separate review; this file grants none.

## 11. Required anti-equivalences

```text
failure cleared != authority restored
capacity restored != state restored
state restored != route restored
route restored != permission restored
permission restored != human closure
warning cleared != hold released
same endpoint != same restoration history
hysteresis != punishment
attenuation != permanent revocation
```

## 12. Disconfirmers

The candidate weakens or fails if:

- snapback and hysteretic restoration preserve `R_plus` equally under all hostile fixtures;
- restoration history adds burden without changing any recoverability or safety state;
- the only observed asymmetry is ordinary physical state hysteresis;
- a lower-complexity guard silently gains global authority rather than local deficit jurisdiction;
- the route-memory distinction cannot affect any consequential permission;
- restoration requires no additional evidence beyond the failure sensor in every relevant source case.

## 13. Claim ceiling

A passing synthetic assay may support only:

```text
AUTHORITY_RESTORATION_HYSTERESIS_SUPPORTED_IN_BOUNDED_FIXTURE
SAME_CURRENT_STATE_NOT_SUFFICIENT_FOR_SAME_AUTHORITY_IN_BOUNDED_FIXTURE
ROUTE_MEMORY_RELEVANT_TO_REAUTHORIZATION_CANDIDATE
```

It may not support:

```text
universal governance theorem
production Cistern mutation
production AIA mutation
automatic human-lock requirements
external security certification
holonomy claim
```

## 14. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
