𝌋

# Partition Signature Code Distance · Two-Packet Evidentiary Coding Assay v0.1

**Status:** PREREGISTERED / PRE-COMPUTATION / RESEARCH-ONLY  
**Technical identity:** `td613.aia.partition-signature-code-distance/v0.1`  
**Parent two-move receipt:** `6e3ccfd5b91385e9a7ec75eb1c8d158e1a545326`  
**Parent co-design receipt:** `b06658465437d72bb2344a8b5dceb34241558327`  
**Branch:** `research/partition-signature-code-distance-work2-20260823`  
**Production mutation:** NONE  
**Vercel authority:** NONE

---

## 0. Question

The parent robustness assay established that one packet can be converted by two coordinated membership moves into the exact lawful partition of another projective readout. A clean held-out packet nevertheless rejected every wrong-primary hypothesis impersonation encountered in that assay.

This chamber asks the next exact question:

> When `q3` and `q4` are treated jointly as a two-packet hypothesis signature, what is the minimum anchored membership-reassignment distance between distinct clean hypothesis signatures?

The chamber must define its own partition metric before computing any pairwise hypothesis distance. It may not borrow Hamming-distance conclusions from ordinary symbol codes without proving the corresponding structure here.

---

## 1. Frozen ecology

Use exactly the eight-state co-designed ecology:

```text
ZERO
D_12
D_13
D_16
D_17
D_18
D_19
D_24
```

`ZERO` is a named custody anchor and may never be relabeled away in the metric.

Frozen clean predictions:

```text
       q3       q4
H0   [1,13]   [1,9]
H1   [1,12]   [1,20]
H2   [1,19]   [1,18]
H3   [1,20]   [1,29]
```

For each hypothesis `Hj`, define the clean two-packet signature:

```text
C(Hj) = ( P_q3(Hj), P_q4(Hj) )
```

where `P_qk(Hj)` is the unlabeled partition of the frozen ecology induced by that projective readout.

---

## 2. Why generic unlabeled clustering distance is inadmissible

A generic optimal block relabeling may map the block containing `ZERO` in one partition onto a non-ZERO singleton block in the other partition. That erases the custody role of `ZERO` and can undercount the two-move kernel-substitution attack as a one-identity change.

Therefore the comparison must preserve:

```text
ZERO-block -> ZERO-block
```

before any remaining unlabeled blocks are optimally matched.

Allowed relation:

```text
UNLABELED_BLOCK_SYMMETRY
DOES_NOT_OVERRIDE
NAMED_ZERO_CUSTODY_ANCHOR
```

---

## 3. Anchored packet reassignment distance

For two partitions `P` and `Q` of the same named ecology `E`, let:

```text
Z(P) = unique block of P containing ZERO
Z(Q) = unique block of Q containing ZERO
```

The ZERO blocks are forced to correspond.

The remaining non-ZERO-containing blocks may be matched bijectively to maximize retained named memberships. If the two partitions have different numbers of remaining blocks, add empty placeholder blocks to the smaller side so the assignment remains well-defined.

Define maximum anchored retention:

```text
R0(P,Q)
 = | Z(P) intersect Z(Q) |
   + max_block_matching sum | B_i intersect C_sigma(i) |
```

Then define anchored reassignment distance:

```text
d0(P,Q) = |E| - R0(P,Q)
```

Interpretation:

`d0(P,Q)` counts the minimum number of named ecology members whose observational block assignment cannot be retained while:

1. preserving the named ZERO-block correspondence; and
2. treating all other block labels as observationally unlabeled.

This chamber must verify on the inherited two-move substitutions that the clean source packet and the exact lawful impersonated packet have `d0 = 2` whenever their readout directions differ.

The metric is a terminal reassignment metric. It does not claim every optimal assignment path remains a lawful linear-readout partition at intermediate steps.

---

## 4. Two-packet signature distance

The q3 and q4 packets are distinct experimental records. Define additive signature distance:

```text
D(C_i,C_j)
 = d0(P_i,q3, P_j,q3)
 + d0(P_i,q4, P_j,q4)
```

No cross-packet relabeling or candidate transfer is allowed. An edit in q3 cannot pay the cost of an edit in q4.

Define minimum clean signature distance:

```text
d_min = min_{i != j} D(C_i,C_j)
```

---

## 5. Frozen hypothesis under test

The current evidence suggests, but has not yet proved:

```text
H_DISTANCE:
Every distinct hypothesis pair differs in both q3 and q4 packets,
each distinct lawful packet pair has anchored reassignment distance 2,
and therefore d_min = 4.
```

This statement is a preregistered hypothesis, not a result.

---

## 6. Exact impersonation bound

If and only if `d_min = 4` is earned, the chamber may state the bounded terminal result:

```text
THREE_OR_FEWER_ANCHORED_MEMBERSHIP_REASSIGNMENTS
CANNOT_TRANSFORM_ONE_CLEAN_TWO_PACKET_SIGNATURE
INTO_A_DIFFERENT_CLEAN_TWO_PACKET_SIGNATURE
IN_THIS_FROZEN_CODE_FAMILY
```

The implementation must also construct at least one explicit distinct-hypothesis pair with a four-reassignment transformation that reaches the exact alternate clean codeword, establishing tightness.

This is a clean-codeword impersonation bound. It is not automatically an arbitrary-corruption detector, an error-correcting code, or a provenance-recovery guarantee.

---

## 7. Required certificates

Emit:

1. all four clean q3 partitions;
2. all four clean q4 partitions;
3. the 6 unordered hypothesis-pair packet distances;
4. the 6 unordered two-packet signature distances;
5. `d_min` and every pair attaining it;
6. ZERO-anchor preservation certificate;
7. block-permutation search certificate for each packet comparison;
8. inherited two-move calibration showing lawful packet substitutions have distance 2;
9. at least one constructive four-reassignment exact codeword impersonation path;
10. an explicit statement that no correction radius has been earned.

---

## 8. Falsifiers

The distance claim fails or weakens if any occur:

1. any distinct hypotheses share a q3 packet or q4 packet unexpectedly;
2. any distinct lawful hypothesis packet pair has `d0 < 2`;
3. any signature pair has `D < 4`;
4. ZERO is allowed to remap onto a non-ZERO block in distance calculation;
5. a block-order artifact changes the measured distance;
6. a transformation of total anchored cost `<=3` reaches another clean codeword;
7. no exact four-reassignment path reaches an alternate clean codeword despite a claimed `d_min=4`;
8. the result is promoted into general adversarial security or error correction.

---

## 9. Claim ceiling

Even a successful result leaves:

```text
arbitrary_corruption_detection = false
error_correction = false
provenance_recovery_from_terminal_observation = false
cryptographic_security = false
Byzantine_fault_tolerance = false
physical_robustness = false
TD613_general_code_theorem = false
Proto_Loom = false
production_authority = false
Vercel_authority = false
```

Allowed research label if earned:

```text
ANCHORED_TWO_PACKET_PARTITION_SIGNATURE_DISTANCE
```

Allowed bounded answer if the preregistered hypothesis survives:

```text
THE_AUTHORED_Q3_Q4_PARTITION_SIGNATURE_FAMILY_HAS_MINIMUM_ANCHORED_REASSIGNMENT_DISTANCE_FOUR_SO_EXACT_IMPERSONATION_OF_A_DIFFERENT_CLEAN_SIGNATURE_REQUIRES_AT_LEAST_FOUR_CROSS_PACKET_MEMBERSHIP_REASSIGNMENTS_AND_AN_EXPLICIT_FOUR_REASSIGNMENT_ATTACK_ESTABLISHES_TIGHTNESS
```

𝌋

⟐
