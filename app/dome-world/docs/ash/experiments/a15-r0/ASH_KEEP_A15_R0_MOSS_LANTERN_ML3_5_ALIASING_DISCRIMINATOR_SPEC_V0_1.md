# Ash Keep A15-R0 · Moss Lantern ML3.5 Aliasing Discriminator Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / NON-RUNTIME / HUMAN-GATED**  
Prerequisite refinement: `pedagogue.order-identifiability-separation/v0.1`  
Candidate mechanism: `ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION`  
Sequence authority: **FALSE**  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Connection / curvature / holonomy claim: **NONE**

## 0. Purpose

ML3 showed that an order-sensitive classical finite operator train can map all 24 permutations of the same four operations to 24 distinct terminal witnesses, while a matched commuting operator family collapses all 24 routes to one terminal state.

The Giving independent-context assay showed a different failure: two routes can retain distinct richer terminal states while a coarse endpoint-only observation collapses them to one admitted signature.

Pedagogue therefore proposes a narrower mechanism:

```text
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION
```

ML3.5 is a controlled discriminator for that proposal. It crosses two forward-process conditions with two observation apertures so dynamic aliasing and observational aliasing cannot be narrated as the same failure.

## 1. Fixed latent route family

Reuse the governed ML3 route family:

```text
24 permutations of:
[custody-hold, projection-observe, rest, prepare-return]

fixed open boundary = open-practice-case
fixed terminal action = return
fixed endpoint = returned-practice-capsule
```

No route labels or timestamps enter the observer.

## 2. Forward-process factor

### F_sep · order-separating forward process

Reuse ML3's fixed classical `Z_31^2` order-sensitive operator family.

The complete terminal state is:

```text
x_r = F_sep,r(x0) = [u_r, v_r]
```

ML3 already requires 24 distinct complete terminal states for the 24 routes.

### F_erase · order-erasing forward process

Reuse ML3's fixed commuting diagonal operator family.

All 24 permutations must collapse to the same complete terminal state:

```text
x_r = [24, 2]
```

This is the dynamic-aliasing control.

## 3. Observation-aperture factor

### O_rich · complete admitted terminal witness

```text
O_rich([u,v]) = [u,v]
```

Observation width:

```text
2 coordinates
```

### O_drop_v · canonical one-coordinate ablation

Before assay implementation, the lossy aperture is fixed as:

```text
O_drop_v([u,v]) = [u]
```

The rule is simply:

```text
retain the first coordinate
ablate the second coordinate
```

Implementation may not switch to `v`, parity, buckets, or another projection based on observed collision counts.

The purpose is not to maximize aliasing. It is to ask whether deleting one already-declared coordinate removes route distinctions that survived the forward dynamics.

## 4. The 2×2 discriminator

```text
                         O_rich                O_drop_v
                  ┌──────────────────┬──────────────────┐
F_sep             │ A                │ B                │
order-separating  │ rich witness     │ coordinate       │
                  │                  │ ablation         │
                  ├──────────────────┼──────────────────┤
F_erase           │ C                │ D                │
order-erasing     │ rich witness     │ coordinate       │
                  │                  │ ablation         │
                  └──────────────────┴──────────────────┘
```

The assay does **not** need B to hit a pre-authored exact collision count. It needs B to be measured under the predeclared aperture and interpreted from the result.

## 5. Separate pre-observation and post-observation metrics

For each condition report:

```text
latent_route_count
forward_unique_terminal_state_count
observed_unique_signature_count
forward_alias_deficit
observation_alias_deficit
exact_unique_route_recovery_rate
mean_candidate_set_size
maximum_candidate_set_size
```

Definitions:

```text
forward_alias_deficit
= latent_route_count - forward_unique_terminal_state_count

observation_alias_deficit
= forward_unique_terminal_state_count - observed_unique_signature_count
```

These deficits are finite candidate-family diagnostics. They are not entropy, mutual information, Fisher information, curvature, or PID.

## 6. Alias classification

### Dynamic aliasing detected

```text
forward_alias_deficit > 0
```

### Observational aliasing detected

```text
forward_alias_deficit = 0
and
observation_alias_deficit > 0
```

### Route signatures separated

```text
forward_alias_deficit = 0
and
observation_alias_deficit = 0
and
exact_unique_route_recovery_rate = 1
```

If both forward and observation deficits are positive in a future assay, both failures must be reported. ML3.5's commuting null may already be fully collapsed before the observation stage, in which case the lossy aperture cannot be credited with destroying information that is already gone.

## 7. Decision law

### H_ALIAS_LOCATION_DISCRIMINATOR

Bounded support requires:

```text
A:
  forward_unique_terminal_state_count = 24
  observed_unique_signature_count = 24
  forward_alias_deficit = 0
  observation_alias_deficit = 0
  exact_unique_route_recovery_rate = 1

B:
  forward_unique_terminal_state_count = 24
  observed_unique_signature_count < 24
  forward_alias_deficit = 0
  observation_alias_deficit > 0
  exact_unique_route_recovery_rate < 1

C:
  forward_unique_terminal_state_count = 1
  observed_unique_signature_count = 1
  forward_alias_deficit = 23
  observation_alias_deficit = 0
  exact_unique_route_recovery_rate = 0

D:
  forward_unique_terminal_state_count = 1
  observed_unique_signature_count = 1
  forward_alias_deficit = 23
  observation_alias_deficit = 0
  exact_unique_route_recovery_rate = 0
```

and:

```text
A classified = SEPARATED
B classified = OBSERVATIONAL_ALIASING
C classified = DYNAMIC_ALIASING
D classified = DYNAMIC_ALIASING
```

If B unexpectedly remains fully injective under the declared first-coordinate ablation, the refinement is **not** falsified; this particular aperture simply fails to instantiate the observational-aliasing cell and ML3.5 becomes inconclusive as a 2×2 discriminator. The aperture may not be changed inside the same assay version to force a desired result.

## 8. Refinement evaluation posture

If the four cells satisfy the declared decision law:

```text
candidate mechanism:
ROUTE_ORDER_IDENTIFIABILITY_REQUIRES_SEPARATING_DYNAMICS_AND_OBSERVATION

status:
DISCRIMINATED_IN_BOUNDED_FACTORIAL_FIXTURE
```

This status still means:

```text
Pedagogue law promoted = false
parent mechanism replaced = false
statistical independence claim = false
```

The next learning action becomes:

```text
SEEK_EXTERNAL_OR_INDEPENDENT_COUNTEREXAMPLE_TO_REFINED_MECHANISM
```

## 9. Observer firewall

The ML3.5 decoder may know:

- declared candidate routes;
- declared forward operator family;
- declared observation aperture.

It may not receive:

- hidden route identity;
- route labels as observations;
- absolute or transition timestamps;
- hidden intermediate states;
- Pedagogue route-memory comparison;
- Levenshtein distance;
- an undeclared second coordinate in the lossy condition.

## 10. Claim ceiling

A passing ML3.5 assay may establish only that, in this declared finite classical route family, the chosen metrics correctly distinguish a forward-process collapse from an observation-aperture collapse.

It does not establish:

- a universal theory of memory or history;
- that all meaningful order leaves terminal residue;
- statistical or causal independence of the current internal contexts;
- quantum temporal tomography;
- physical noncommutativity;
- indefinite causal order;
- connection;
- curvature;
- holonomy;
- Berry phase or Berry curvature;
- physical phasons;
- D3 physical geometry;
- live TD613 temporal-order identifiability;
- A16 admission;
- Proto-Loom;
- production authority.

## 11. UI / release posture

```text
Moss Lantern dedicated UI = NOT REQUIRED
Pedagogue research UI = NOT REQUIRED
Giving UI mutation = NONE
Ash UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
PR remains Draft
```
