# Lineage Assay Protocol v1

## Question

For each Em-side work or bounded cluster, what relation—if any—can be earned relative to TD613, SRC, another Em-side work, or an external scientific witness?

## Stage 0 — custody and blind inventory

Before theory matching:

1. hash every source file;
2. inventory file types, titles, dates, authorship strings, citations, formulas, figures, datasets, and code references;
3. record duplicates and near-duplicates without merging them;
4. build a section/formula/citation map;
5. preserve unreadable or unparseable objects as typed negative states.

This stage minimizes expectation leakage from the phrase “TD613 lineage.”

## Stage 1 — brutal anatomy

Decompose each work into:

```text
problem statement
objects/entities
variables
operators/transformations
boundary conditions
method
source data
causal claims
formal claims
empirical claims
examples
counterexamples
limitations
predictions
falsifiers
citations/intellectual dependencies
```

Separate what the paper **names** from what its formal or empirical machinery actually **does**.

## Stage 2 — motif assay

Extract recurring metaphors, narrative structures, iconography, spatial language, temporal language, ritual language, compression/containment language, observer language, boundary language, and graph/topology imagery.

Then run a null check: could the motif arise generically in the field? Common vocabulary receives low lineage weight absent a more specific structural relation.

## Stage 3 — convergence/divergence

Compare pairs on independent dimensions:

```text
problem
ontology
formal structure
mechanism
method
predictions
empirical target
failure modes
normative/governance commitments
```

Convergence on one dimension never erases divergence on another.

## Stage 4 — genealogical assay

Seek source-witnessed lineage before inferred lineage:

```text
explicit citation or acknowledgment
> shared distinctive formal object with plausible transmission path
> shared distinctive mechanism with chronology and dependency support
> independent convergence with incompatible transmission history
> generic thematic resemblance
```

Record `INDEPENDENTLY_REDISCOVERS` separately from `DERIVES_FROM`.

## Stage 5 — topology

Build a multiplex graph with typed edges. Identify:

- articulation points;
- bridge works;
- recurrent cycles within one projection;
- cross-projection noncommutation;
- clusters that disappear when generic motifs are removed;
- relations that survive adversarial edge deletion;
- unresolved components.

Do not infer historical cycles from conceptual cycles.

## Stage 6 — emergence test

An emergent architecture candidate requires more than a collage of similarities. Require:

1. at least two independently grounded parent structures;
2. a composition rule;
3. a property, invariant, prediction, or failure mode not supplied by either parent alone;
4. a route to falsification or disconfirmation;
5. a minimal subgraph showing which relations are indispensable.

If deleting one weak analogy collapses the candidate, classify it as `FRAGILE_COMPOSITE`, not emergence.

## Stage 7 — external scientific confrontation

For claims touching current applied science, compare against primary literature, standards, datasets, source code, benchmarks, vendor documentation, and reproduced experiments current to the assay cutoff.

Record publication status and evidence type. `2026` is a date, not a credibility score.

## Stage 8 — red-team pass

For every high-value result, construct the strongest competing explanation:

- common field vocabulary;
- convergent evolution;
- shared upstream source;
- retrospective fitting;
- extraction artifact;
- chronology error;
- platform framing artifact;
- researcher expectation leakage.

A result survives only to the level not defeated by the best available alternative.

## Output packet

Each finding returns:

```text
finding_id
entities
relation/proposition
projection
evidence chain
claim ceiling
alternative models
disconfirmers
negative-state notes
external witnesses
next highest-information test
```

Speculation is permitted at full voltage. Promotion remains earned.
