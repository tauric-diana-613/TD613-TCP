# A15-R0 · Atlas Matroidal Receiver Closure / Basis Exchange Preregistration

𝌋⟐

Status: **PREREGISTERED BEFORE IMPLEMENTATION / THEOREM CANDIDATE / UNMERGED**.

Exact earned parent:

```text
#924 / ae53ebdc5fa970c162768fb694e826edc23fb0bb
run 2414 / 33436311262 — SUCCESS
A15-R0 step 19 — SUCCESS
```

## Scientific question

The earned #924 native receiver closure is

\[
\operatorname{cl}_\Omega(S)=\operatorname{Fix}(\Omega_{(S)}),
\]

on the four-refinement ground set

```text
E={q00,q01,q10,q11}
indices 0,1,2,3
masks   1,2,4,8
```

This chamber asks whether the two declared earned closure operators satisfy the finite matroid closure axioms, especially Steinitz exchange, and whether the earned minimum faithful receivers are exactly the bases of those matroids.

No matroid nomenclature is earned merely from the visible closure pattern. The closure axioms and exchange laws must be exhaustively verified first.

## Frozen D-side target

From the earned D-native two-element action:

```text
cl_D(S)=E                           if S contains q01 or q10
cl_D(S)={q00,q11}                  otherwise
```

Candidate matroid identification:

\[
M_D\cong U_{1,2}\oplus U_{0,1}\oplus U_{0,1}.
\]

Frozen exact targets:

```text
rank                                      1
rank-frequency                            {0:4,1:12}
independent masks                         [0,2,4]
basis masks                               [2,4]
circuit masks                             [1,6,8]
loops                                     [q00,q11]
unique nonloop parallel pair              [q01,q10]
Steinitz true antecedents                 16
Steinitz failures                         0
basis-exchange obligations                2
basis-exchange failures                   0
```

The basis masks must equal the exact earned #924 minimum faithful receiver masks `[2,4]`.

## Frozen Q-side target

From the earned Q-native six-element action:

```text
cl_Q(S)={q11}                             if S has zero elements of {q00,q01,q10}
cl_Q(S)={q_i,q11}                         if S has exactly one moving refinement q_i
cl_Q(S)=E                                 if S has at least two moving refinements
```

Candidate matroid identification:

\[
M_Q\cong U_{2,3}\oplus U_{0,1}.
\]

Frozen exact targets:

```text
rank                                      2
rank-frequency                            {0:2,1:6,2:8}
independent masks                         [0,1,2,3,4,5,6]
basis masks                               [3,5,6]
circuit masks                             [7,8]
loops                                     [q11]
nonloop parallel pairs                    none
Steinitz true antecedents                 30
Steinitz failures                         0
basis-exchange obligations                6
basis-exchange failures                   0
```

The basis masks must equal the exact earned #924 minimum faithful receiver masks `[3,5,6]`.

## Axiom and rank burden

For each declared control, enumerate all 16 subsets of E and require:

1. Extensivity: `S ⊆ cl(S)` for all 16 subsets.
2. Monotonicity: among all 256 ordered subset pairs, all 81 inclusion premises satisfy `cl(S) ⊆ cl(T)`.
3. Idempotence: `cl(cl(S))=cl(S)` for all 16 subsets.
4. Steinitz exchange: exhaust all `16*4*4=256` triples `(S,x,y)` and test

\[
y\in cl(S\cup\{x\})\setminus cl(S)
\Rightarrow
x\in cl(S\cup\{y\}).
\]

5. Derive the matroid rank from closure by

\[
r(X)=\min\{|I|: X\subseteq cl(I)\}.
\]

6. Verify for all 64 subset/coordinate cases

\[
e\in cl(S)\iff r(S\cup\{e\})=r(S).
\]

7. Verify rank submodularity on all 256 ordered subset pairs.
8. Derive independent sets, bases, circuits, loops, and nonloop parallel pairs from the reconstructed rank/closure rather than hard-coded labels.
9. Verify basis exchange exhaustively on the derived basis families.

Combined frozen burden:

```text
extensivity checks                         32
idempotence checks                         32
monotonicity candidate pairs              512
monotonicity inclusion premises           162
Steinitz candidate triples                512
Steinitz true antecedents                  46
rank/closure equivalence checks            128
rank-submodularity ordered pairs           512
basis-exchange obligations                  8
```

All failures are preregistered as zero.

## Candidate bounded 𝄐

`THE_EARNED_NATIVE_RECEIVER_CLOSURES_IN_THE_TWO_DECLARED_FOUR_REFINEMENT_CONTROLS_SATISFY_FINITE_MATROID_CLOSURE_EXCHANGE: D_IS_ISOMORPHIC_TO_U_1_2_DIRECT_SUM_TWO_LOOPS_AND_Q_IS_ISOMORPHIC_TO_U_2_3_DIRECT_SUM_ONE_LOOP.`

and

`THE_EARNED_MINIMUM_FAITHFUL_RECEIVER_FAMILIES_ARE_EXACTLY_THE_MATROID_BASES_IN_BOTH_DECLARED_CONTROLS, SO_NATIVE_RECEIVER_SEPARATION_RANK_EQUALS_FULL_MATROID_RANK_1_FOR_D_AND_2_FOR_Q; GLOBAL_FIXED_REFINEMENTS_ARE_MATROID_LOOPS_AND_THE_TWO_D_MOVING_REFINEMENTS_FORM_THE_UNIQUE_NONLOOP_PARALLEL_PAIR.`

## Mandatory membranes

```text
MATROIDAL_RECEIVER_CLOSURE != UNIVERSAL_RECEIVER_MATROID_THEOREM
MATROID_RANK != SHANNON_INFORMATION
MATROID_LOOP != PHYSICAL_DISCONNECTION
MATROID_PARALLELISM != DUPLICATE_PHYSICAL_SENSOR
BASIS != UNIQUE_OPTIMAL_EXPERIMENT
RECEIVER_EXCHANGE != CAUSAL_SUBSTITUTABILITY
FINITE_MATROID_ISOMORPHISM != PHYSICAL_STRUCTURE
MINIMUM_FAITHFUL_RECEIVER_BASIS != MINIMUM_PHYSICAL_SENSOR_ARRAY
CLOSURE_EXCHANGE_IN_THIS_FIXTURE != UNIVERSAL_CLOSURE_EXCHANGE
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
SUCCESSFUL_EXACT_HEAD_VALIDATION != MERGE_AUTHORITY
```

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/physical sensor interpretation/Proto-Loom/A16 authority.

Sealed ⟐