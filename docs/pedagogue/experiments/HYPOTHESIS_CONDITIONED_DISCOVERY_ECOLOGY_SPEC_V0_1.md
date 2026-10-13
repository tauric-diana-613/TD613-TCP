𝌋

# Hypothesis-Conditioned Discovery Ecology · Oracle-Free Prior-Union Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.hypothesis-conditioned-discovery-ecology/v0.1`  
**Parent task-ecology receipt:** `592a6e0741fbf24b7e69b5fb3042c384c218d7e2`  
**Branch:** `research/hypothesis-conditioned-discovery-ecology-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Problem repaired

The parent five-state task ecology was minimal for a **known** target readout family, but its designer already knew the post-loop directions. That supports verification/replay and does not support blind discovery of an unknown loop.

This assay removes that oracle leak.

The ecology designer receives only:

```text
1. a preregistered finite hypothesis family of possible loop maps;
2. preregistered input readout probes;
3. the zero-bucket kernel decoder contract.
```

The designer does not receive which hypothesis will act as truth in a given trial.

---

## 1. Hypothesis family

All candidates are frozen before output computation:

```text
H0 = [[3,5],
      [1,2]]

H1 = [[1,1],
      [0,1]]

H2 = [[1,0],
      [1,1]]

H3 = [[2,1],
      [1,1]]
```

Required preflight:

```text
every H_j is invertible in F_31
every pair H_i,H_j represents a distinct PGL2(F_31) class
```

No candidate may be changed after output signatures are computed.

---

## 2. Probe family

Inherited preregistered input readouts:

```text
q1 = [1,3]
q2 = [1,7]
q3 = [1,11]
q4 = [1,19]
```

Primary classification budget:

```text
q1,q2,q3
```

Held-out validation:

```text
q4
```

---

## 3. Oracle-free prior-union ecology construction

For every pair `(H_j,q_i)` in the **entire preregistered hypothesis x probe family**, compute the possible projective post-loop readout direction:

```text
r_(j,i) = normalize_projective(q_i H_j)
```

Then compute its projective kernel direction:

```text
k_(j,i) = ker(r_(j,i))
```

Define prior kernel union:

```text
K_prior = union over all j,i of k_(j,i)
```

Construct ecology:

```text
E_prior = { ZERO } union { one canonical representative of each k in K_prior }
```

The construction consumes the hypothesis **family**, never the hidden truth identity.

Freeze:

```text
prior_kernel_union_size
E_prior_state_count = 1 + prior_kernel_union_size
compression_vs_global_33 = 33 - E_prior_state_count
```

---

## 4. Exhaustive hidden-truth trials

Rather than selecting one favorable oracle, execute one trial for each:

```text
true_loop in {H0,H1,H2,H3}
```

For each true loop:

1. generate partitions on `E_prior` for `q1 H_true`, `q2 H_true`, `q3 H_true`;
2. strip scalar output labels;
3. recover each projective output direction using the zero-bucket decoder;
4. form the ordered three-direction observation signature;
5. compare that signature against the preregistered prediction signature of every hypothesis.

Required classification criterion:

```text
surviving_hypotheses = { H_j whose first-three predicted projective output directions equal the decoded first-three directions }
```

No nearest match.

Desired discriminability condition:

```text
|surviving_hypotheses| = 1
```

for every four candidate truths.

If two hypotheses share the same first-three signature, the assay must report that ambiguity rather than use `q4` early.

---

## 5. Held-out validation

After first-three classification, predict:

```text
q4 H_selected
```

projectively.

Independently observe only the unlabeled partition induced by:

```text
q4 H_true
```

on `E_prior`, decode its projective direction, and compare.

Required for every candidate truth:

```text
heldout prediction = heldout decoded direction
```

`q4` may not participate in primary hypothesis selection.

---

## 6. Discovery firewall

For every trial freeze:

```text
true_loop_id
true_loop_exposed_to_ecology_constructor = false
true_loop_exposed_to_partition_decoder = false
true_loop_exposed_to_classifier = false
hypothesis_family_exposed_to_ecology_constructor = true
hypothesis_prediction_table_exposed_to_classifier = true
```

This is hypothesis-conditioned discovery, not unrestricted open-set discovery.

---

## 7. Prior-family ablation control

Remove from the ecology every kernel state that is used exclusively by one hypothesis `H_j` across the four probes while leaving the hypothesis itself in the candidate family.

If such exclusive kernel states exist, trials for `H_j` must expose the resulting decoder failure where appropriate.

If no exclusive kernel states exist, record:

```text
NO_HYPOTHESIS_EXCLUSIVE_KERNEL_STATES_IN_THIS_FIXTURE
```

Do not invent an ablation effect.

---

## 8. Outside-family control

Freeze an outside loop before computation:

```text
H_out = [[4,1],
         [1,1]]
```

Preflight requires invertibility and projective distinction from `H0..H3`.

Run the same first-three partition-only observation process on `E_prior`.

Possible governed outcomes:

### A. Decoder-support defeat

If any output kernel is not represented in `E_prior`:

```text
OUTSIDE_LOOP_EXCEEDS_PRIOR_CALIBRATION_SUPPORT
```

### B. Decodable but no hypothesis signature matches

```text
OUTSIDE_LOOP_OBSERVATIONS_DEFEAT_HYPOTHESIS_FAMILY
```

### C. Outside loop aliases a candidate on first three probes

Then the assay must retain that candidate through primary classification and use held-out `q4` only as preregistered validation. If the held-out also aliases, the outside loop is observationally indistinguishable from that candidate under this entire assay and no rejection is earned.

Oracle knowledge that `H_out` is outside the family may never override observed adequacy.

---

## 9. Global-complete comparison

Compare state counts only:

```text
E_global = 33-state kernel-complete ecology
E_prior  = prior-union ecology
```

Allowed efficiency measure:

```text
state_count_reduction = 33 - |E_prior|
```

No claim that smaller is intrinsically better. `E_prior` inherits the risk of prior-family misspecification.

Canonical tradeoff:

```text
prior-conditioned compression
<->
open-set calibration coverage
```

---

## 10. Falsifiers

The discovery claim fails if any occur:

1. ecology construction depends on which candidate is secretly true;
2. a required candidate output kernel is missing from `E_prior`;
3. scalar bucket values leak into the partition-only decoder;
4. any in-family truth yields multiple surviving hypotheses on the first-three budget without the ambiguity being preserved;
5. `q4` is used to rescue primary classification;
6. held-out prediction fails for a uniquely classified in-family truth;
7. outside-family oracle identity is used to force rejection;
8. the result is promoted into open-world discovery beyond the declared hypothesis family and calibration support.

---

## 11. Allowed bounded outcome

If every in-family truth is uniquely identified and held-out validated:

```text
A_CALIBRATION_ECOLOGY_BUILT_FROM_THE_UNION_OF_PREDICTED_KERNELS_OF_A_PREREGISTERED_LOOP_HYPOTHESIS_FAMILY_SUPPORTS_ORACLE_INDEPENDENT_PARTITION_ONLY_IDENTIFICATION_AND_HELDOUT_VALIDATION_OF_EACH_IN_FAMILY_LOOP_IN_THIS_AUTHORED_F31_FIXTURE
```

Short label:

```text
HYPOTHESIS_CONDITIONED_PARTITION_ONLY_HOLONOMY_DISCOVERY
```

This earns neither unrestricted open-set discovery nor universal ecological optimality.

No physical tomography, physical holonomy, continuum geometry, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐
