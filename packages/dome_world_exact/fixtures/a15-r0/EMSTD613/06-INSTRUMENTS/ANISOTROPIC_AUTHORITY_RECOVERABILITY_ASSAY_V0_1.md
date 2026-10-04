# EMSTD613 · Anisotropic Authority & Recoverability Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

Fixture: `A15-R0 / EMSTD613`

## 0. Research question

Can two bounded layered systems preserve the same declared observation geometry and substrate/dependency geometry while differing only in authority geometry, such that only one preserves future lawful recoverability under the same declared failure?

The assay tests the candidate separation:

```text
observation geometry != substrate geometry != authority geometry
```

and the bounded candidate mechanism:

```text
higher representational/adaptive capacity
!= higher consequential authority in every deficit jurisdiction
```

No general theorem is presumed.

## 1. Source-derived candidate

The candidate is motivated by cross-domain EMSTD613 observations in which a high-capacity adaptive layer is prevented from remaining sovereign when its own operating assumptions become unreliable.

Observed candidate forms include:

- predictive wearable / swarm control with a lower-complexity direct hardware override;
- semantic LLM operation with a telemetry-aware hypervisor able to interrupt generation;
- agent governance in which execution rights are enforced outside model state and may monotonically attenuate downstream;
- memory systems in which working representations may compress while archival or higher-fidelity state remains the recovery authority;
- audio systems in which a richer UI/predictive layer remains subordinate to the hardware clock for temporal truth.

These are archive observations/candidates, not proof of one shared universal mechanism.

## 2. Negative control already observed

The chiptune DSP architecture supplies a hostile control:

```text
bounded stabilization present = true
authority-layer separation present = false
independent veto / override jurisdiction present = false
```

This controls against the trivial explanation:

```text
any feedback/stability mechanism == authority anisotropy
```

That equivalence is rejected for this assay.

## 3. Candidate state variables

For each layer `L_i` declare:

```text
K_i  representational/adaptive capacity
O_i  observation aperture
U_i  admissible action set
C_i  custody/recovery scope
J_i  deficit jurisdiction
A_i  consequential authority vector
```

Authority is vector-valued rather than scalar:

```text
A_i = (
  observe,
  propose,
  veto,
  interrupt,
  mutate,
  release,
  custody,
  exit,
  close
)
```

No scalar crown may collapse these rights.

## 4. Future lawful recoverability

Define the bounded research quantity `R_plus` as the declared preservation of enough trustworthy state, substrate viability, custody, and authority structure for a future valid continuation or audit to remain possible without falsifying prior route history.

For this assay only, `R_plus` is operationalized through four Boolean components:

```text
R_state       protected pre-failure state remains recoverable
R_substrate   protected substrate remains inside declared viability bounds
R_route       the actual intervention/route remains replayable
R_authority   no layer silently acquires undeclared authority during recovery
```

A fixture preserves future lawful recoverability iff:

```text
R_plus = R_state && R_substrate && R_route && R_authority
```

This Boolean fixture definition is deliberately local. It is not a universal recoverability metric.

## 5. Three geometries

### Observation geometry `G_O`

Who can observe which failure-relevant variables?

### Substrate geometry `G_S`

Which processes depend on which common substrate/resource/clock/memory plane?

### Authority geometry `G_A`

Which layer may propose, veto, interrupt, mutate, release, retain custody, or close under each declared deficit class?

The assay must hold `G_O` and `G_S` fixed while varying only `G_A`.

## 6. Synthetic paired fixture

Two systems share identical layers:

```text
L_semantic   high-capacity adaptive controller
L_guard      lower-capacity deterministic guard
L_archive    recovery/custody store
L_human      closure authority
```

Identical observation geometry:

```text
L_semantic observes task/semantic state but not the protected failure sensor z_f
L_guard observes z_f and a bounded execution-state summary
L_archive observes no live state; preserves exact pre-failure checkpoint + route receipts
L_human receives all bounded receipts but does not participate in automatic control
```

Identical substrate geometry:

```text
L_semantic depends on protected substrate S
L_guard is minimally dependent on S and can still issue HALT
L_archive is outside the live execution loop
L_human is outside the live execution loop
```

Declared failure:

```text
F := z_f >= tau_f
```

At `F`, continued semantic execution for one additional step causes irreversible loss of one protected checkpoint or substrate-viability bound.

### Fixture A · MONOTONIC-CAPACITY AUTHORITY

```text
L_semantic retains execution/mutation authority at F
L_guard may warn but cannot veto/interrupt
L_archive cannot force checkpoint preservation
L_human closes only after the run
```

Expected:

```text
R_state = false OR R_substrate = false
R_route may remain true
R_authority = true
R_plus = false
```

### Fixture B · DEFICIT-INDEXED AUTHORITY INVERSION

```text
L_semantic retains semantic proposal authority
L_guard has local veto/interrupt authority only for F-jurisdiction
L_archive has recovery custody but no live execution authority
L_human remains sole closure/promotion authority
```

At `F`:

```text
L_guard interrupts before the destructive step
L_archive preserves the last valid checkpoint and intervention receipt
L_semantic may resume only after the failure predicate clears or a human-authorized route changes
```

Expected:

```text
R_state = true
R_substrate = true
R_route = true
R_authority = true
R_plus = true
```

## 7. Required isolation

The pair is invalid if any of these differ between A and B:

```text
sensor set
sensor reliability
failure threshold
substrate capacity
controller policy before F
archive contents before F
human availability
failure timing
```

Only authority geometry may differ.

## 8. Pedagogue role

Pedagogue asks whether the proposed pair actually distinguishes:

```text
fallback
vs
local authority inversion
```

Required questions:

1. Is a distinct layer granted a non-compensable right under a named deficit jurisdiction?
2. Can the higher-capacity layer override that right?
3. Is the right local to the deficit rather than a global sovereignty transfer?
4. Does the intervention preserve a declared recoverability invariant?
5. Does a hostile same-domain control preserve recoverability without authority inversion?

Pedagogue may route the questions; it may not promote the candidate mechanism.

## 9. Aperture role

Aperture treats the latent mechanism space as containing at least:

```text
M1 ordinary fallback/stabilization
M2 authority inversion
M3 generic redundancy
M4 archive-only recoverability
```

The paired fixture is informative only if varying `G_A` while holding `G_O` and `G_S` fixed changes `R_plus`.

If both fixtures preserve `R_plus`, the observation does not identify authority inversion as necessary.

If neither preserves `R_plus`, the proposed authority geometry is insufficient or the failure declaration is malformed.

If only Fixture B preserves `R_plus`, the result contracts the local alternative set but still does not establish universality.

Required postures:

```text
missing failure-sensor reliability -> ABSTAIN
invalid threshold / impossible state -> REJECT
different G_O or G_S across pair -> REJECT AS CONFOUNDED
no recoverability difference -> ASK NOTHING / NULL RESULT
B-only recoverability -> SUPPORTED BOUNDED SEPARATION CANDIDATE
```

## 10. AIA consequence

Current AIA projections preserve bounded authority equally across routes. This assay does not authorize changing that law.

It tests a separate research question:

```text
shared bounded authority
!= necessarily identical local jurisdiction
```

A future candidate could represent route-local non-transferable prerogatives while preserving:

```text
authority_may_cross = false
human_closure_required = true
automatic_release = false
automatic_redesign = false
```

Example research-only authority vector:

```text
EXPERIENTIAL  -> exit/refusal strong; mutation none
CUSTODIAL     -> custody/recovery strong; release none
AUDIT         -> observe/abstain strong; mutation none
IMPLEMENTATION-> synthetic manipulation strong; human-case closure none
```

This is a research possibility, not an implementation instruction.

## 11. Required anti-equivalences

```text
more information != more authority
higher capacity != broader jurisdiction
fallback != veto
warning != interrupt authority
archive possession != live execution authority
local veto != global sovereignty
equal boundedness != identical jurisdiction
recoverability != current performance
restart != restoration
reconstruction != prior possession
proposal != execution
passing assay != production mutation
```

## 12. Disconfirmers

The candidate weakens or fails if:

- hostile controls preserve `R_plus` equally well without local authority inversion;
- the supposed authority effect disappears when observation geometry is truly held fixed;
- the effect is fully explained by ordinary redundancy rather than non-compensable jurisdiction;
- archive/checkpoint preservation alone explains the result;
- the lower-complexity layer requires hidden higher-capacity inference to know when to intervene;
- the authority boundary cannot be represented without silently widening global power;
- the result depends on a human/semantic interpretation unavailable at runtime;
- the source-derived cases do not survive work-identity sensitivity controls.

## 13. Claim ceiling

A passing assay may support only:

```text
G_O_G_S_G_A_LOCAL_SEPARATION_SUPPORTED_IN_AUTHORED_SYNTHETIC_FIXTURE
DEFICIT_INDEXED_AUTHORITY_INVERSION_CANDIDATE_SUPPORTED_LOCALLY
R_PLUS_PRESERVATION_DIFFERENCE_OBSERVED_IN_PAIRED_FIXTURE
```

It may not support:

```text
universal intelligent-systems theorem
universal safety theorem
proof of TD613 lineage
proof of Em derivation
production AIA redesign
autonomous authority reassignment
human authority reduction
live governance deployment
```

## 14. Breakpoint criterion

An earned research breakpoint requires all of:

```text
paired isolation witnessed
hostile fallback-only control witnessed
R_plus differs only under G_A variation
Pedagogue classification preserved
Aperture non-identifiability alternatives explicitly reduced
no authority widened in production code
no merge/release/promotion
```

Until then:

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
