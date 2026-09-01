# A15-R0 · Atlas Marked-Overlap / Concurrency Separation · Burden v0.1

This burden is frozen before implementation.

## Rank/matroid construction
For each declared eight-element control:
- construct all 256 subset ranks;
- verify normalization;
- verify 256 rank bounds;
- exhaust all 65,536 ordered subset pairs for monotonicity candidate checks and all 65,536 for submodularity;
- require zero failures;
- verify every pair of declared circuit-hyperplanes intersects in at most one ground element.

## Polynomial collision
From all 256 ranks/control:
- derive exact corank-nullity coefficient map;
- derive exact Tutte coefficient map by integer substitution;
- require exact equality to the frozen common R and T on both controls.

## Marginal collision
Derive element-incidence degrees from the circuit-hyperplanes, not from expected labels. Require sorted degree multiset `[3,2,2,2,2,2,1,1]` on both controls.

## Pairwise relational collision
Construct overlap graph Gamma on the five circuit-hyperplanes, edge iff intersection is nonempty. Require:
- 8 edges each;
- sorted graph-degree profile `[4,4,3,3,2]` each;
- enumerate all `5! = 120` circuit-hyperplane permutations;
- count exactly 4 graph isomorphisms Gamma_A -> Gamma_B.

## Higher-order concurrency mark
Derive the unique ground element of incidence degree 3 and its incident circuit-hyperplane set C(M). Require:
- exactly one such ground element/control;
- lambda_A `[4,4,3]`, kappa_A 11;
- lambda_B `[4,4,2]`, kappa_B 10;
- among the exactly four overlap-graph isomorphisms, mark-preserving count exactly 0.

## Exhaustive ground nonisomorphism
Enumerate all `8! = 40,320` ground permutations. For every permutation compare the mapped five circuit-hyperplanes against the target family without early exit from the five membership comparisons. Require:
- 40,320 permutations;
- 201,600 mapped circuit-hyperplane membership comparisons;
- 0 isomorphism matches.

## Canonical receiver ladder
On the declared two-control universe require class counts:
- Tutte receiver: 1;
- Tutte + complete marginal degree multiset: 1;
- Tutte + marginal + abstract overlap-graph isomorphism class: 1;
- Tutte + marginal + marked-overlap concurrency profile lambda: 2;
- scalar kappa alone after the previous shared coordinates also separates: 2.

## Anti-overclaim
No claim that marked overlap graphs, lambda, or kappa are complete matroid invariants or universal classifiers. No physical-network, causal-concurrency, runtime, production, deployment, release, or promotion authority.

Sealed ⟐