𝌋

# Task-Conditioned Calibration Ecology · Kernel-Cover Theorem Candidate v0.1

**Status:** PREREGISTERED / DERIVATIONAL / RESEARCH-ONLY  
**Technical identity:** `td613.aia.task-conditioned-calibration-ecology-kernel-cover/v0.1`  
**Parent partition-only tomography receipt:** `25e424f8d0edbd59dcacf2d1bbe2e65d5a51b24b`  
**Branch:** `research/task-conditioned-calibration-ecology-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Question

The parent assay used a globally kernel-complete 33-state calibration ecology:

```text
ZERO + one representative of every projective state direction
```

and thereby decoded every projective readout direction in `P^1(F_31)` from unlabeled partition membership.

That ecology answers a global calibration obligation.

This chamber asks a task-conditioned question:

> If the tomography task only requires a declared finite family of readout directions, what calibration ecology is sufficient for the zero-bucket kernel decoder, and what global coverage is sacrificed by specializing to that task?

---

## 1. Decoder class

This theorem is restricted to the already-declared decoder:

1. the ecology contains named `ZERO=[0,0]`;
2. the partition is unlabeled except for candidate identity;
3. the decoder reads the partition block containing `ZERO`;
4. exactly one named nonzero representative of the target readout kernel is required in that block;
5. the recovered projective readout is the annihilator of that kernel representative.

No claim of minimality outside this decoder class is permitted.

---

## 2. General construction

Let `R` be any finite nonempty family of nonzero projective readout directions in `P^1(F_31)`.

Define the distinct projective kernel set:

```text
K(R) = { ker(r) : r in R }
```

Choose exactly one named canonical nonzero state representative `d_k` for each `k in K(R)`.

Define task-conditioned ecology:

```text
E(R) = { ZERO } union { d_k : k in K(R) }
```

Therefore:

```text
|E(R)| = 1 + |K(R)|
```

For every `r in R`, its ZERO bucket must be:

```text
{ ZERO, d_ker(r) }
```

and the zero-bucket decoder must recover `r` projectively.

---

## 3. Minimality within the declared decoder class

Within this exact decoder contract:

- removing `ZERO` makes the distinguished zero bucket unavailable;
- removing `d_ker(r)` for any target `r` leaves ZERO alone for that target;
- substituting a representative of a different projective direction does not lie in `ker(r)` and therefore cannot replace the missing target kernel witness.

Thus every ecology supporting all target directions under this decoder must contain at least:

```text
1 + |K(R)|
```

states.

The constructed `E(R)` meets that lower bound.

Allowed theorem label:

```text
KERNEL_COVER_ECOLOGY_IS_CARDINALITY_MINIMAL_WITHIN_DECLARED_ZERO_BUCKET_DECODER_CLASS
```

Not allowed:

```text
universally minimal observation ecology
```

---

## 4. Current holonomy-tomography task instance

Inherited four target post-loop projective readout directions:

```text
R_H = {
  [1,7],
  [1,5],
  [1,13],
  [1,9]
}
```

The implementation must derive, rather than hard-code, each canonical kernel representative.

If all four kernels are distinct, required:

```text
|K(R_H)| = 4
|E(R_H)| = 5
```

The task ecology must decode all four inherited directions exactly and support the same three-correspondence projective loop reconstruction plus held-out fourth prediction as the 33-state global ecology.

---

## 5. Global-coverage sacrifice

Enumerate all 32 projective readout directions in `P^1(F_31)`.

For each direction outside `R_H`, apply it to `E(R_H)` and run the same decoder.

A non-target direction is decodable **iff** its projective kernel happens to belong to `K(R_H)`.

Because projective readout direction and projective kernel direction are in one-to-one correspondence in two dimensions, if the four target directions are distinct then exactly four of the 32 directions should decode.

Required global metrics:

```text
decodable_direction_count = 4
undecodable_direction_count = 28
global_coverage_fraction = 4/32 = 1/8
```

This is an intentional task-specialization cost.

Canonical separation:

```text
task sufficiency
!=
global calibration coverage
```

---

## 6. Leave-one-kernel-out hostile controls

For each target direction `r_i`, remove only its kernel representative from `E(R_H)`.

Required:

```text
r_i decoder status = KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY
```

while every other target whose kernel representative remains must still decode correctly.

This proves the role of each calibration state is locally attributable rather than merely correlated with total ecology size.

---

## 7. Matched-size wrong-ecology control

Construct a five-state ecology containing:

```text
ZERO
+ exactly three correct target-kernel representatives
+ one projective direction not in K(R_H)
```

using a deterministic choice: replace the kernel representative for the lexicographically last target direction with the lexicographically first canonical projective state direction outside `K(R_H)`.

The ecology has the same state count `5` as `E(R_H)`.

Required:

```text
three retained targets decode
one displaced target fails
```

Therefore:

```text
same ecology cardinality
!=
same task adequacy
```

---

## 8. Reconstruction obligation

Using only unlabeled partitions on `E(R_H)`:

1. recover all four post-loop projective readout directions;
2. use the first three to reconstruct the loop's `PGL(2,F_31)` class;
3. predict the held-out fourth direction;
4. compare the reconstructed class to the hidden oracle only afterward.

The smaller ecology must therefore preserve the declared task result while intentionally abandoning global readout coverage.

---

## 9. Falsifiers

The task-conditioned theorem fails if any occur:

1. distinct target directions produce fewer than four distinct kernels without the implementation reporting that collapse;
2. `E(R_H)` contains a state not justified by ZERO or a target kernel;
3. any target direction fails to decode on `E(R_H)`;
4. a leave-one-out target still decodes using a missing kernel witness under the declared decoder;
5. the matched-size wrong ecology retains all four target decodes;
6. global decodable direction count exceeds the kernel coverage without an explicit reason;
7. projective loop reconstruction or held-out prediction fails;
8. cardinality minimality is promoted beyond the declared zero-bucket decoder class.

---

## 10. Allowed bounded outcome

If all obligations survive:

```text
FOR_THE_DECLARED_ZERO_BUCKET_DECODER_A_TASK_CONDITIONED_CALIBRATION_ECOLOGY_CONTAINING_ZERO_PLUS_ONE_REPRESENTATIVE_PER_DISTINCT_TARGET_KERNEL_IS_CARDINALITY_MINIMAL_FOR_THAT_TARGET_FAMILY_AND_PRESERVES_PARTITION_ONLY_PROJECTIVE_HOLONOMY_TOMOGRAPHY_WHILE_INTENTIONALLY_SACRIFICING_OUT_OF_TASK_READOUT_COVERAGE
```

Short research label:

```text
TASK_CONDITIONED_TOMOGRAPHIC_ECOLOGY_DESIGN
```

Architectural relation:

```text
probe specialization and ecology specialization are dual design levers for declared inferential obligations
```

This relation remains synthetic and task-conditioned. No universal optimality, physical tomography, Proto-Loom, production, or Vercel authority follows.

𝌋

⟐
