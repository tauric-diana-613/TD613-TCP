𝌋

# Aperture × Pedagogue A15-R0 — Source-Relative Target-Equivalence Completeness Spec v0.1

Status: PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-AUTHORIZED CONTINUATION

Parent receipt: PR #726 at `0853a1956722c0b6ca9b2ea0d13bb33ea8a87919`

󐘓 U+10D613

## 0. Authority and numbering custody

Human continuation authority was already granted by the preceding `𝌋 Proceed` gesture. During execution, PR #727 was occupied independently by Codex for another project. This chamber therefore moves intact to the next available PR number and must not alter #727.

This remains A15-R0 research only. No merge, production, Vercel release, A16 reopening, live Ash mutation, inverse semantics, or source-season quotient is authorized.

## 1. Frozen parent facts

The chamber consumes without rewriting:

```text
#724  every finite authored T/Q word admits the season-conditioned summary
      {t, q_by_season}
      and reconstructs its complete operational target exactly

#725  T Q^k T Q ≡_target Q T Q^k T
      for every formal integer k >= 0 in the retained Q-last-action jurisdiction

#726  R_k : T Q^k T Q -> Q T Q^k T
      is typed, complete-target preserving, terminating on finite words,
      and locally confluent inside the authored jurisdiction
```

The #726 bounded hostile through maximum word length 7 observed:

```text
equal_target_pairs          2036
multi_route_target_classes  180
split_normal_form_classes   0
```

That finite zero-split observation selects this symbolic completeness audition but is not itself evidence sufficient for an all-word theorem.

## 2. Primary question

For one fixed retained lawful source history `h_s` with source season `s`, does equality of complete operational targets coincide exactly with equality of `R_k` rewrite normal forms for every finite authored T/Q word?

Candidate theorem:

```text
Target_s(u) = Target_s(v)
    iff
NF_R(u) = NF_R(v)
```

for all finite `u,v in {T,Q}*` evaluated from the same retained source `h_s`.

Equivalent convertibility form:

```text
Target_s(u) = Target_s(v)
    iff
u and v reduce to the same R_k normal form.
```

This is source-relative. No comparison across distinct source histories may be silently folded into the theorem.

## 3. Unique block decomposition

Every finite T/Q word must be represented uniquely as

```text
w = Q^a0 T Q^a1 T ... T Q^at
```

where

```text
t >= 0
ai in N
```

and `t` is the total T count.

Define the block-parity totals

```text
E(w) = sum ai over even block indices i
O(w) = sum ai over odd  block indices i.
```

These are route-word invariants, not yet operational target invariants until separately proved.

Required anti-equivalence:

```text
block parity != forcing-season identity
same E/O totals != same route provenance
```

## 4. Rewrite action in block coordinates

A typed occurrence

```text
T Q^k T Q
```

beginning before block `i+1` and ending with one Q from block `i+2` acts on block counts as

```text
a_i     -> a_i + 1
a_(i+2) -> a_(i+2) - 1
```

with every other block count unchanged.

Therefore every admitted `R_k` step must preserve:

```text
t
E
O
```

while moving one Q exactly two block positions left.

The implementation must verify the correspondence between the textual rule and this block-coordinate action rather than treating it as an informal analogy.

## 5. Candidate canonical normal form

If `R_k` truly transports Q-mass left within each block parity class, every finite word should reduce to the canonical word determined by `(t,E,O)`:

```text
t = 0:  Q^E

t >= 1:
         Q^E T Q^O T^(t-1)
```

because irreducibility requires every block `a_i` with `i >= 2` to be zero.

The chamber must prove both directions:

```text
R_k-irreducible
    iff
all a_i = 0 for i >= 2
```

and prove that repeated typed rewrites reach the stated canonical word for every formal finite block vector.

A valid proof may use the nonnegative descent potential

```text
P(w) = sum i * a_i
```

which decreases by exactly 2 under every block-coordinate rewrite, but this potential must not replace #726's already-earned lexicographic termination claim; it is an independent completeness aid.

Required classification on success:

```text
ALL_FINITE_AUTHORED_WORDS_REDUCE_TO_PARITY_BLOCK_CANONICAL_RK_NORMAL_FORM
```

## 6. Operational target injectivity audition

The crucial direction is not rewrite normalization but whether the complete operational target determines exactly `(t,E,O)` for a fixed source.

Inherited #724 generator tables are:

```text
D_Q(S0) = [0,0,0,1]
D_Q(S1) = [1,0,0,0]
D_Q(S2) = [0,0,0,1]
D_Q(S3) = [1,0,0,0]
```

so question increments depend only on season parity.

The four-tick forcing-cycle sum inherited from the authored `F_Q` table is

```text
F_Q(S0)+F_Q(S1)+F_Q(S2)+F_Q(S3)
  = [3,3,3,3].
```

For two words from the same source, equality of final forcing season implies their T counts differ by a multiple of four:

```text
t' - t = 4m.
```

Because Q increments contribute zero to endpoint coordinates 2 and 3 while each extra complete four-tick cycle contributes `3m` to both coordinates 2 and 3, complete endpoint equality should force

```text
m = 0
```

and therefore

```text
t' = t.
```

Once `t` is fixed, the forcing contribution is fixed. The remaining endpoint coordinates distinguish the two source-relative block parity totals because seasons two steps apart share the same `D_Q`, while adjacent seasons use the other independent coordinate.

The implementation must symbolically prove, for all four retained source seasons:

```text
Target_s(u) = Target_s(v)
    =>
(t(u), E(u), O(u)) = (t(v), E(v), O(v)).
```

It must also prove the converse:

```text
(t(u), E(u), O(u)) = (t(v), E(v), O(v))
    =>
Target_s(u) = Target_s(v).
```

The converse must include complete operational state, not endpoint alone: lineage, last action, forcing season, and clock phase must also agree.

## 7. Completeness theorem acceptance target

Only if Sections 4–6 all pass may the chamber report:

```text
SOURCE_RELATIVE_ALL_FINITE_TQ_OPERATIONAL_TARGET_EQUIVALENCE_IFF_RK_NORMAL_FORM_EQUALITY
```

with the explicit finite-word source-relative statement:

```text
for each retained lawful source h_s separately,
for all finite authored T/Q words u,v,
Target_s(u)=Target_s(v)
iff
NF_R(u)=NF_R(v).
```

A corollary may state that the symmetric convertibility relation generated by the directed `R_k` reductions exactly presents source-relative operational target equivalence in this authored domain.

This does not make `R_k` an operational inverse and does not erase distinct route custody.

## 8. Bounded hostile controls

After the symbolic proof is authored, an independent bounded hostile must enumerate a larger finite word horizon than #726 and assert exact pairwise equivalence:

```text
same complete operational target
    iff
same computed canonical R_k normal form
```

across all four retained sources.

The hostile must additionally include:

1. `t=0` and `t=1` edge families where no rewrite redex exists;
2. words whose equal target requires more than one two-block Q transfer;
3. distinct words with equal normal form while preserving distinct route labels;
4. source-crossing controls demonstrating that equal `(t,E,O)` across different source histories does not authorize source erasure;
5. undeclared generators and inverse labels returning ABSTAIN/REJECT;
6. a synthetic mutation of the period-two question-delta premise or four-cycle forcing premise causing the proof certificate to fail rather than silently generalize.

The bounded hostile corroborates the symbolic theorem. It does not substitute for it.

## 9. Parent custody

Snapshot and compare inherited assay outputs before and after this chamber. At minimum preserve unchanged:

```text
#718
#719
#720
#723
#724
#725
#726
```

Any mutation returns:

```text
PARENT_CUSTODY_MUTATION_DETECTED
```

and fails the chamber.

## 10. Anti-equivalence boundaries

```text
same normal form != same route provenance
rewrite convertibility != operational invertibility
source-relative completeness != source-independent quotient
finite control != finite state space
bounded exhaustive agreement != symbolic all-word proof
operational target quotient != path-object promotion
```

## 11. Claim ceiling

Still forbidden unless separately earned and human-gated:

```text
source-season erasure
cross-source operational quotient
ambient TD613 Church-Rosser theorem
rewrite completion beyond the authored T/Q jurisdiction
finite-state automaton theorem for the unbounded endpoint
lattice / semilattice / complete lattice
domain theory
causal-set theorem
inverse generator
inverse morphism
groupoid
transport
connection
loop endomorphism
holonomy
curvature
Berry / quantum structure
Proto-Loom
A16
live Ash mutation
merge
production
Vercel release
```

## 12. Stop condition

The chamber must stop after one exact-head research witness and a receipt.

No merge or deployment action is authorized.

```text
SOURCE_RELATIVE_TARGET_EQUIVALENCE_COMPLETENESS_ROUND_REQUIRES_WITNESS
```

𝌋

Sealed ⟐
