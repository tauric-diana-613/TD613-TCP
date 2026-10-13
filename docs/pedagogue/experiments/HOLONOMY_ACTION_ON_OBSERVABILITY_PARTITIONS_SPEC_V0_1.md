𝌋

# Holonomy Action on Observability Partitions · Holdout v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY / SYNTHETIC  
**Technical identity:** `td613.aia.holonomy-action-on-observability-partitions/v0.1`  
**Parent AIA head:** `7719e71562bff8ed6078fd803fe9363190a60607`  
**Branch:** `research/holonomy-observability-action-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE  
**Proto-Loom authority:** NONE  
**Physical holonomy claim:** FALSE  
**Continuum information-geometry claim:** FALSE

---

## 0. Question

Prior bounded fixtures separately earned:

1. a reconstructed nontrivial discrete closed-loop transport in `GL(2,F_31)`;
2. a discrete AIA grammar in which observation maps induce partitions of a compatible state set;
3. claim sufficiency as partition refinement / finite-set factorization.

The unresolved bridge is:

> Can an already-earned nontrivial discrete loop transport change the observation partition induced by the **same local readout at the same basepoint**, thereby changing which preregistered claims that readout is sufficient to license?

For a column state `v` and row readout `q`, pre-loop observation is:

```text
q v
```

After closed-loop transport `H`, the same local readout sees:

```text
q (H v) = (q H) v
```

Thus the loop acts on the readout covector by the exact right action:

```text
q -> qH
```

The assay asks whether the induced partition can change under this action.

Allowed bounded phrase if all controls survive:

```text
DISCRETE_HOLONOMY_CAN_ACT_ON_THE_ORIENTATION_OF_OBSERVABILITY_RELATIVE_TO_A_FIXED_CANDIDATE_FAMILY
```

This phrase refers only to exact finite-state partition geometry in the authored fixture.

---

## 1. Provenance quarantine

A development-only off-repository pilot was used while deriving the Cartesian construction:

```text
x pilot values = {6,14}
z pilot values = {7,20}
```

That pilot was examined before this preregistration and therefore carries **no confirmatory authority**.

Canonical status:

```text
DEVELOPMENT_ONLY_OFF_REPO_PILOT_NOT_CONFIRMATORY
```

The confirmatory holdout below uses fresh frozen values and must not import pilot outputs.

---

## 2. Arithmetic and earned loop

Primary arithmetic:

```text
F_31
```

Earned loop operator imported from prior discrete-holonomy work:

```text
H = [[3,5],
     [1,2]]
```

Required checks before use:

```text
det(H) = 1 mod 31
H != I
H is invertible
```

Fixed local readout at basepoint A:

```text
q = [1,0]
```

Therefore the post-loop pullback readout is to be computed only after preregistration:

```text
qH
```

No alternate `q` may be selected after viewing the holdout partition.

---

## 3. Fresh confirmatory candidate family

Freeze two desired pre-loop readout values:

```text
X = {3,17}
```

Freeze two desired post-loop readout values:

```text
Z = {8,26}
```

Construct exactly four states indexed by `(x,z) in X x Z`.

Each state must satisfy:

```text
q v_(x,z) = x
q H v_(x,z) = z
```

Because `q=[1,0]`, write:

```text
v_(x,z) = [x,y]^T
```

and solve the second coordinate uniquely in `F_31` from:

```text
(qH)_1 x + (qH)_2 y = z
```

The construction fails if `(qH)_2 = 0` or if any of the four derived states collide.

The derived `y` values are **not frozen in this specification** and must be computed after this commit.

Candidate family:

```text
C = { v_(3,8), v_(3,26), v_(17,8), v_(17,26) }
```

Oracle identity beyond `(x,z)` labels is forbidden to the partition analyzer.

---

## 4. Preregistered claims

Two binary claims are frozen before state derivation.

### F_X — pre-loop readout class

```text
F_X(v_(x,z)) = x
```

Claim partition:

```text
{x=3} | {x=17}
```

### F_Z — post-loop readout class

```text
F_Z(v_(x,z)) = z
```

Claim partition:

```text
{z=8} | {z=26}
```

These are synthetic label functions only.

---

## 5. Positive holonomy-action obligation

Define observation maps on the same original candidate family `C`:

```text
Q_pre(v)  = q v
Q_post(v) = q H v = (qH) v
```

Required matched facts:

```text
one scalar observation per state
same basepoint readout q before and after loop
same candidate family C
same arithmetic domain
same output bucket count = 2
same bucket-size multiset = [2,2]
```

Required partition relations:

```text
Q_pre  is sufficient for F_X
Q_pre  is insufficient for F_Z
Q_post is insufficient for F_X
Q_post is sufficient for F_Z
```

Required incomparability:

```text
Pi(Q_pre) does not refine Pi(Q_post)
Pi(Q_post) does not refine Pi(Q_pre)
```

Therefore the claim-sufficiency profile must rotate from:

```text
Q_pre  -> [F_X=true,  F_Z=false]
```

to:

```text
Q_post -> [F_X=false, F_Z=true]
```

A candidate outcome where both maps license the same claim profile does not support the bridge.

---

## 6. Flat-loop null

Use:

```text
H_flat = I
```

with the **same** `q` and the **same** candidate family `C`.

Required identity:

```text
q H_flat = q
```

Therefore:

```text
Pi(Q_flat_post) = Pi(Q_pre)
```

and the claim-sufficiency profile must remain unchanged.

If the flat null changes the partition, the assay mechanism fails.

---

## 7. Reverse-loop restoration

Let:

```text
H_rev = H^-1
```

The readout after forward then reverse transport must satisfy:

```text
(qH)H^-1 = q
```

Therefore the induced partition on the original candidate family must return exactly to `Pi(Q_pre)`.

This is an algebraic restoration control, not a temporal-memory claim.

---

## 8. Gauge-covariant coordinate control

A local frame change at basepoint A must not manufacture a partition change.

Freeze gauge matrix:

```text
K = [[2,1],
     [1,1]]
```

The implementation must first verify `K` is invertible in `F_31`.

Coordinate change:

```text
v' = K v
H' = K H K^-1
q' = q K^-1
```

Required exact identities for every candidate state:

```text
q' v' = q v
q' H' v' = q H v
```

Therefore pre- and post-loop partitions and claim-sufficiency profiles must be unchanged under the gauge clone.

A test that transforms `H` but leaves `q` and `v` untransformed is invalid.

---

## 9. Nontrivial-loop / invariant-readout control

Nontrivial holonomy must **not** imply that every readout changes.

Freeze a separate control loop:

```text
U = [[1,1],
     [0,1]]
```

and invariant readout:

```text
q_inv = [0,1]
```

Required facts:

```text
U != I
q_inv U = q_inv
```

Use any explicitly declared finite control candidate family with at least two distinct `q_inv` values.

Required classification:

```text
NONTRIVIAL_LOOP_WITH_INVARIANT_READOUT_LEAVES_THAT_OBSERVATION_PARTITION_UNCHANGED
```

Therefore the bridge may claim only:

```text
holonomy CAN change a readout partition
```

not:

```text
nontrivial holonomy changes every readout partition
```

---

## 10. Claim-sufficiency criterion

For candidate set `C`, observation map `Q`, and claim `F`, claim sufficiency is earned exactly when every observation bucket is claim-pure:

```text
for all y in Q(C):
  | { F(c) : c in C and Q(c)=y } | = 1
```

Equivalent finite-set factorization:

```text
exists g such that F = g o Q
```

No candidate-count heuristic may replace this criterion.

---

## 11. Required receipts

Freeze:

```text
candidate_state_ledger
H
H_inverse
q
qH
Q_pre_partition
Q_post_partition
flat_partition
reverse_restored_partition
gauge_clone_pre_partition
gauge_clone_post_partition
claim_sufficiency_matrix
partition_refinement_matrix
invariant_readout_control
```

For every insufficiency claim, materialize a two-candidate collision witness sharing the observation while differing on the target claim.

---

## 12. Falsifiers

The bridge fails if any occur:

1. confirmatory state construction is singular or produces collisions;
2. `Q_pre` and `Q_post` do not have matched `[2,2]` bucket profiles;
3. their partitions are equal or comparable rather than incomparable;
4. the preregistered claim-sufficiency profile does not rotate exactly as declared;
5. `H_flat=I` changes the partition;
6. forward+reverse does not restore the original readout and partition;
7. gauge-covariant coordinate change alters any observation value or license;
8. the nontrivial invariant-readout control changes its partition;
9. posthoc readout selection occurs;
10. a changed partition is promoted into physical anisotropy, tensor anisotropy, continuum geometry, or a universal TD613 law.

---

## 13. Allowed bounded outcome

If every obligation survives, the strongest allowed result is:

```text
IN_AUTHORED_FINITE_GL2_F31_FIXTURE_A_NONTRIVIAL_RECONSTRUCTED_CLOSED_LOOP_TRANSPORT_CHANGES_THE_PARTITION_INDUCED_BY_A_FIXED_LOCAL_READOUT_FROM_ONE_CLAIM_SUFFICIENCY_DIRECTION_TO_AN_INCOMPARABLE_ONE_WHILE_FLAT_REVERSE_GAUGE_AND_INVARIANT_READOUT_CONTROLS_BEHAVE_AS_PREREGISTERED
```

Short research label:

```text
DISCRETE_HOLONOMY_ACTION_ON_CLAIM_RELATIVE_OBSERVABILITY
```

This may motivate a Dome-World / TD613 AIA research program in which transport history and observation design interact.

It does **not** earn:

```text
physical holonomy
physical tomography
continuum bundle
continuum connection
continuum curvature
information-geometric tensor
Berry phase
Berry curvature
quantum behavior
universal AIA holonomy law
Proto-Loom
production authority
Vercel authority
```

𝌋

⟐
