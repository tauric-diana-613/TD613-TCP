𝌋

# Partition-Only Holonomy Tomography · Ecology Design Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.partition-only-holonomy-tomography-ecology/v0.1`  
**Parent projective tomography receipt:** `ef2ee2b00ee32c19adcdbfdf9ad856fdf40a67f3`  
**Branch:** `research/partition-only-holonomy-tomography-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Question

The parent assay reconstructed a discrete loop's `PGL(2,F_31)` class from three input/output **projective readout directions**.

AIA frequently exposes a coarser object:

```text
which candidate states are observationally indistinguishable under a readout
```

that is, an unlabeled partition of a candidate ecology.

This assay asks:

> Can the candidate ecology itself be designed so that partition membership alone recovers the projective readout directions needed for holonomy tomography?

Canonical separation:

```text
readout direction
!=
partition induced on an arbitrary finite ecology
```

The assay compares a sparse inherited four-state ecology against a preregistered calibration ecology designed to expose the kernel of every nonzero linear readout.

---

## 1. Arithmetic and hidden loop

Field:

```text
F_31
```

Hidden oracle loop, used only to generate post-loop observations:

```text
H = [[3,5],
     [1,2]]
```

Input readout probes inherited from the parent projective-tomography receipt:

```text
q1 = [1,3]
q2 = [1,7]
q3 = [1,11]
q4 = [1,19]
```

The partition-only decoder may not inspect the scalar output labels `qHv` or the oracle matrix.

---

## 2. Sparse ecology control

Inherited four-state ecology:

```text
C_sparse = {
  V_3_8   = [3,6],
  V_3_26  = [3,22],
  V_17_8  = [17,10],
  V_17_26 = [17,26]
}
```

For each post-loop readout `q_i H`, compile only the unlabeled membership partition induced on `C_sparse`.

The assay must enumerate projective readout directions in `P^1(F_31)` compatible with each partition.

If any sparse partition admits multiple projective readout directions, freeze those aliases explicitly.

No claim is preregistered that every sparse probe must be ambiguous; the result is diagnostic.

---

## 3. Kernel-complete calibration ecology

Construct exactly 33 candidate states:

### Zero anchor

```text
ZERO = [0,0]
```

### Canonical representative of every projective state direction

```text
D_t = [1,t] for t in F_31
D_inf = [0,1]
```

Thus:

```text
|C_kernel| = 1 + 31 + 1 = 33
```

Every one-dimensional state subspace has exactly one named nonzero representative in the ecology.

This is a synthetic calibration phantom, not a physical state space.

---

## 4. Unlabeled partition receipt

For any nonzero readout row `r`, define equivalence on the ecology:

```text
v ~_r w iff r v = r w
```

The instrument receives only the sets of candidate IDs in each equivalence class.

Scalar output values are stripped.

The candidate ID `ZERO` remains known.

Define:

```text
zero_bucket(r)
```

as the unique partition block containing `ZERO`.

---

## 5. Kernel decoder

For a nonzero readout `r`, every vector in `zero_bucket(r)` satisfies:

```text
r v = r 0 = 0
```

Therefore the nonzero projective representative in that bucket should identify the one-dimensional kernel of `r`.

Required structure for every nonzero projective readout direction in `P^1(F_31)`:

```text
zero_bucket size = 2
zero_bucket = { ZERO, exactly one D_* }
```

If the recovered kernel representative is:

```text
k = [x,y]
```

then a projectively equivalent annihilating covector is:

```text
r_hat = normalize_projective([y,-x])
```

Required all-direction theorem-like finite verification:

```text
for every one of the 32 nonzero projective readout directions:
  decode(partition(C_kernel,r)) = normalize_projective(r)
```

This is exhaustive finite verification, not a universal theorem about arbitrary ecologies.

---

## 6. Partition-only reconstruction of post-loop readout directions

For each inherited input probe `q_i`:

1. generate hidden post-loop readout `r_i = q_i H`;
2. apply `r_i` to `C_kernel`;
3. strip all scalar output labels;
4. recover `r_i_hat` from the zero bucket only;
5. compare `r_i_hat` to `normalize_projective(r_i)` in the verification layer.

The decoder may not use any nonzero bucket label because none is supplied.

---

## 7. Partition-only holonomy inverse

Use recovered directions:

```text
(q1 -> r1_hat)
(q2 -> r2_hat)
(q3 -> r3_hat)
```

with the same homogeneous projective correspondence solver used conceptually in the parent assay.

Required:

```text
constraint_rank = 3
nullspace_dimension = 1
```

and recovered projective loop class must match the hidden oracle only after reconstruction.

Then predict the fourth direction from `q4` and compare it with `r4_hat` independently decoded from `q4`'s unlabeled kernel-complete partition.

---

## 8. Ecology ablation controls

### 8.1 Remove ZERO anchor

Define:

```text
C_no_zero = C_kernel \ {ZERO}
```

The simple zero-bucket kernel decoder must refuse to operate because no distinguished kernel bucket exists under its declared contract.

Required classification:

```text
KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR
```

This does not prove that no other decoder could use the remaining partition structure.

### 8.2 Remove one projective direction representative

For each of the 32 direction representatives in turn, create an ablated ecology missing that representative while retaining ZERO.

For the readout whose kernel is precisely the missing direction, required:

```text
zero_bucket = {ZERO}
```

and decoder must return:

```text
KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY
```

It may not infer the missing direction from oracle knowledge.

### 8.3 Scalar-label firewall

Any decoder receiving raw scalar outputs rather than unlabeled bucket memberships invalidates the partition-only claim.

---

## 9. Gauge-covariant ecology control

Under basepoint frame change:

```text
K = [[2,1],[1,1]]
```

transform:

```text
H' = K H K^-1
q_i' = q_i K^-1
v' = K v
```

The transformed calibration ecology is the image of every named state under `K`; names remain attached to state identity.

Partition memberships produced by:

```text
q_i H on v
```

and:

```text
q_i' H' on v'
```

must be identical by candidate ID.

The kernel decoder in the transformed coordinates may use transformed vectors attached to the zero-bucket member IDs and must recover the transformed projective readout direction.

---

## 10. Falsifiers

The ecology-design claim fails if any occur:

1. `C_kernel` does not contain exactly one nonzero representative of every projective state direction;
2. any nonzero projective readout has a zero bucket other than `{ZERO, one direction representative}`;
3. exhaustive 32-direction kernel decoding produces a wrong readout direction;
4. partition-only reconstruction secretly consumes scalar bucket values;
5. three decoded post-loop directions fail to reconstruct the projective loop class;
6. held-out fourth direction fails;
7. missing-kernel-representative ablation gets silently repaired using oracle knowledge;
8. gauge transformation changes partition membership by candidate identity;
9. a result for this calibration ecology is promoted into a theorem about arbitrary AIA ecologies.

---

## 11. Allowed bounded outcome

If all obligations survive, the strongest allowed statement is:

```text
IN_AUTHORED_F31_CALIBRATION_ECOLOGY_UNLABELED_PARTITION_MEMBERSHIP_WITH_A_ZERO_ANCHOR_AND_ONE_REPRESENTATIVE_OF_EACH_PROJECTIVE_STATE_DIRECTION_RECOVERS_PROJECTIVE_READOUT_DIRECTIONS_AND_THEREBY_SUPPORTS_RECONSTRUCTION_OF_THE_EARNED_DISCRETE_LOOP_CLASS_FROM_PARTITION_MOTION_ALONE
```

Short research label:

```text
PARTITION_ONLY_PROJECTIVE_HOLONOMY_TOMOGRAPHY_VIA_CALIBRATION_ECOLOGY
```

Potential architectural relation, still research-only:

```text
TOMOGRAPHIC_IDENTIFIABILITY_CAN_DEPEND_ON_THE_DESIGN_OF_THE_OBSERVED_ECOLOGY_NOT_ONLY_ON_THE_PROBE
```

No physical tomography, universal ecological optimality, continuum geometry, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐
