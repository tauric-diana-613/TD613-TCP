𝌋

# Holonomy Observability · Projective Readout Orbit Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.holonomy-observability-projective-orbit/v0.1`  
**Parent bridge receipt:** `2965888b679478f3a84c88db931ada7e4c011b6e`  
**Branch:** `research/holonomy-observability-orbit-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Question

The parent holdout established one exact transition:

```text
q -> qH
```

for an already-earned nontrivial loop `H`, and showed that the two readouts induce incomparable claim-sufficiency partitions on the same four-state candidate family.

One transition does not establish an orbit structure.

This assay asks:

> What exact orbit does repeated closed-loop transport induce on the projective direction of the fixed local readout, and how does that projective orbit map onto partitions and claim-sufficiency profiles of the already-frozen candidate family?

The assay keeps three objects distinct:

```text
projective readout direction
!=
partition induced on finite candidate family
!=
claim-sufficiency profile of that partition
```

---

## 1. Frozen inherited objects

Arithmetic:

```text
F_31
```

Loop:

```text
H = [[3,5],[1,2]]
```

Initial readout:

```text
q_0 = [1,0]
```

Candidate family, inherited without mutation:

```text
V_3_8   = [3,6]
V_3_26  = [3,22]
V_17_8  = [17,10]
V_17_26 = [17,26]
```

Frozen claims:

```text
F_X = x label in {3,17}
F_Z = z label in {8,26}
```

No new candidate states or claim functions may be selected after viewing the orbit.

---

## 2. Readout action

For integer `k >= 0`:

```text
q_k = q_0 H^k
```

Each `q_k` is a nonzero row covector because `H` is invertible.

The same local scalar readout after `k` loop traversals is therefore evaluated on the original candidate state as:

```text
Q_k(v) = q_k v
```

---

## 3. Projective normalization

Scalar multiples of a nonzero readout define the same projective direction.

Canonical normalization in `P^1(F_31)`:

```text
if q=[a,b] and a != 0:
  normalize(q) = [1, b/a]
else:
  normalize(q) = [0,1]
```

with division in `F_31`.

Enumerate:

```text
normalize(q_0), normalize(q_1), ...
```

until the first repeated normalized direction.

Because `P^1(F_31)` contains 32 directions, failure to encounter a recurrence within 33 states falsifies the enumerator.

Freeze:

```text
projective_orbit_length
first_repeat_index
repeated_direction
```

The orbit length may **not** be promoted into the order of `H` in `GL(2,F_31)` or the order of the full holonomy image. A projective readout can have a nontrivial stabilizer.

---

## 4. Finite-candidate partition sequence

For every projective-orbit step before recurrence, compile the partition of the inherited four-state family induced by:

```text
Q_k(v) = q_k v
```

Partition equality ignores scalar output labels and compares only candidate membership in buckets.

Freeze:

```text
partition_signature_k
bucket_count_k
bucket_size_multiset_k
```

Also freeze:

```text
unique_partition_count
partition_recurrences
```

A projectively new `q_k` may induce a previously seen partition on this small candidate family.

Required separation:

```text
projective_direction_recurrence
!=
finite_candidate_partition_recurrence
```

unless the data happen to coincide.

---

## 5. Claim-sufficiency profile sequence

For each partition `Pi_k`, evaluate exact finite-set claim sufficiency for:

```text
F_X
F_Z
```

using bucket purity / factorization only.

Freeze profile:

```text
S_k = [ sufficient(F_X | Pi_k), sufficient(F_Z | Pi_k) ]
```

and:

```text
unique_claim_profile_count
claim_profile_recurrences
```

A changed projective direction need not change the claim profile.

---

## 6. Flat-loop null

For:

```text
H_flat = I
```

with the same initial `q_0`, candidate family, and claims:

```text
projective_orbit_length = 1
unique_partition_count = 1
unique_claim_profile_count = 1
```

must hold.

---

## 7. Nontrivial invariant-readout null

Use inherited control:

```text
U = [[1,1],[0,1]]
q_inv = [0,1]
```

with:

```text
U != I
q_inv U = q_inv
```

Required:

```text
projective_orbit_length = 1
```

Therefore:

```text
nontrivial loop
!=
nontrivial orbit for every readout
```

---

## 8. Reverse-action control

Let:

```text
H_rev = H^-1
```

Starting at any enumerated projective direction `normalize(q_k)`, one reverse action must return the prior projective direction:

```text
normalize(q_k H^-1) = normalize(q_(k-1))
```

with indices interpreted cyclically after the orbit closes.

This verifies that the enumerated projective dynamics reflect an invertible group action rather than a lossy state transition.

---

## 9. Gauge-covariant orbit control

Use inherited basepoint frame change:

```text
K = [[2,1],[1,1]]
```

with:

```text
v' = K v
H' = K H K^-1
q'_0 = q_0 K^-1
```

For every enumerated `k` and every candidate:

```text
q'_0 (H')^k v' = q_0 H^k v
```

must hold exactly.

The canonical projective coordinates of `q'_k` may differ because the coordinate frame changed. The **observation-value sequence, partition sequence, and claim-sufficiency sequence** must remain identical.

---

## 10. Falsifiers

The assay fails or materially weakens if any occur:

1. projective recurrence fails within the finite 32-direction space;
2. a purported projective recurrence compares raw covectors rather than normalized directions;
3. reverse action fails to traverse the orbit backward;
4. flat or invariant-readout controls produce orbit length greater than one;
5. gauge-covariant clone changes any candidate observation value at any step;
6. finite-candidate partition recurrence is promoted into projective recurrence without checking the covectors;
7. projective orbit length is called the order of the holonomy group without a stabilizer analysis;
8. any result is promoted into physical rotation, Berry phase, continuum parallel transport, or universal TD613 AIA dynamics.

---

## 11. Allowed bounded outcomes

If the projective orbit has length greater than one and all controls survive, the assay may earn:

```text
EARNED_DISCRETE_LOOP_INDUCES_A_NONTRIVIAL_FINITE_PROJECTIVE_ORBIT_ON_LOCAL_READOUT_DIRECTIONS
```

If multiple claim-sufficiency profiles occur along that orbit, it may additionally earn:

```text
HOLONOMY_OBSERVABILITY_ORBIT_TRAVERSES_MULTIPLE_CLAIM_RELATIVE_OBSERVABILITY_REGIMES_ON_FROZEN_CANDIDATE_FAMILY
```

Neither phrase implies a continuum bundle, physical holonomy, information-geometric tensor, or universal observability dynamics.

𝌋

⟐
