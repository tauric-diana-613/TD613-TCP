# Eclipse–Omega Retrieval-Observability / Semantic-Redundancy Assay v0.6

**Date:** 2026-09-11  
**State:** SYNTHETIC CONTROL / FOUNDATIONAL-PAPER FOLLOW-THROUGH / ZERO NOVELTY PROMOTION  
**Parent:** `2026-09-11-ECLIPSE-OMEGA-FOUNDATIONAL-PAPER-SIEVE-V0_5.md`

## 0. Question

The foundational paper proposes:

```text
RetrievalObsDef(q) ↑  ⇒  SemRed(q) ↑
```

The v0.5 sieve correctly demoted that arrow from theorem to hypothesis. This chamber asks the next lawful question:

> Is semantic-redundancy inflation forced by increasing retrieval observability deficit, or can the relation change sign under a different admissible selection policy?

This is a synthetic assay. It does not claim to measure a deployed LLM, an external platform, or a hidden retrieval stack.

## 1. Conventional names first

The useful technical neighborhoods are ordinary:

- top-k / budgeted retrieval;
- support or coverage loss;
- average pairwise cosine similarity;
- relevance-only ranking;
- diversity-aware selection / maximal-marginal-relevance-style selection;
- policy-conditioned selection effects.

The TD613 label `RetrievalObsDef` is retained only as a project-local shorthand after an operational definition is declared.

```text
PROJECT_LABEL != FIELD_NOVELTY
SEMANTIC_REDUNDANCY != INDEPENDENT_CONFIRMATION
CAPACITY_PRESSURE != REDUNDANCY_CAUSATION
```

## 2. Synthetic corpus

The controlled universe has four relevant items across three support classes:

```text
a1 -> class A -> vector [1,0,0] -> relevance 1.00
a2 -> class A -> vector [1,0,0] -> relevance 0.99
b1 -> class B -> vector [0,1,0] -> relevance 0.90
c1 -> class C -> vector [0,0,1] -> relevance 0.80
```

The vectors are orthonormal one-hot controls. Pairwise cosine is therefore exactly `1` for same-class items and `0` for different-class items.

Define support coverage:

\[
Coverage(C)=\frac{|\{class(d):d\in C\}|}{3}
\]

and the project-local observability deficit for this assay:

\[
RetrievalObsDef(C)=1-Coverage(C).
\]

Define semantic redundancy as average pairwise cosine:

\[
SemRed(C)=\frac{2}{|C|(|C|-1)}
\sum_{i<j}\cos(v_i,v_j),
\]

with `SemRed(C)=0` for fewer than two items.

This is deliberately modest. `RetrievalObsDef` here means **support-class coverage loss relative to the declared eligible support universe**. It does not mean hidden-model observability in general.

## 3. Control A — relevance-only truncation produces the paper's predicted direction

At budget `k=4`, relevance order returns:

```text
[a1, a2, b1, c1]
```

All three classes survive:

```text
RetrievalObsDef = 0
SemRed = 1/6
```

At budget `k=2`, relevance-only truncation returns:

```text
[a1, a2]
```

Only class A survives:

```text
RetrievalObsDef = 2/3
SemRed = 1
```

So in this fixture:

```text
deficit ↑
redundancy ↑
```

That result is real **inside this declared synthetic policy**. It demonstrates that the foundational intuition can occur.

It does not show that the relation is necessary.

## 4. Hostile Control B — diversity-aware selection reverses the redundancy direction

Use a deterministic diversity-aware selector:

1. take the highest-relevance item;
2. repeatedly choose the remaining item maximizing

```text
relevance - lambda * max_similarity_to_selected
```

with `lambda = 0.5`;
3. break ties lexically by id.

At `k=4`, all four items necessarily survive, so:

```text
RetrievalObsDef = 0
SemRed = 1/6
```

At `k=2`, the selector returns:

```text
[a1, b1]
```

because the duplicate A candidate is penalized by similarity to `a1`.

Now:

```text
RetrievalObsDef = 1/3
SemRed = 0
```

Therefore the same move to a smaller budget gives:

```text
deficit ↑
redundancy ↓
```

This is a constructive counterexample to universal monotonicity.

```text
RETRIEVAL_OBSERVABILITY_DEFICIT_UP != SEMANTIC_REDUNDANCY_UP_AS_UNIVERSAL_LAW
```

## 5. What survives

The paper's strongest version fails; the useful research program survives.

Earned in this fixture:

```text
REDUNDANCY_INFLATION_CAN_OCCUR_UNDER_RELEVANCE_ONLY_CAPACITY_TRUNCATION
DIVERSITY_AWARE_SELECTION_CAN_BREAK_OR_REVERSE_THAT_RELATION
```

The corrected research question becomes:

> Under which corpus geometries, ranking rules, diversity penalties, support distributions, and capacity budgets does support loss covary with semantic redundancy?

That is more interesting than the original arrow because it exposes the mechanism to intervention.

## 6. Aperture consequence

Aperture should not treat rising redundancy as a generic readout of reduced observability.

It may treat redundancy as a diagnostic coordinate **only after** binding:

- the eligible support universe;
- the retrieval policy;
- the capacity/budget intervention;
- the similarity representation;
- the diversity policy;
- the exact stage where candidates were lost.

A high redundancy score can reflect corpus duplication, relevance ranking, query specificity, embedding geometry, or selection policy. It does not uniquely identify containment, suppression, or capacity pressure.

```text
REDUNDANCY_SIGNAL != HIDDEN_CAUSE
TERMINAL_SIMILARITY != STAGE_LOCALIZATION
```

## 7. Relation to the foundational paper

This chamber neither buries nor coronates Eclipse–Omega.

The paper correctly noticed that a narrow answer surface can become self-reinforcing when near-neighbor evidence occupies scarce context. The overclaim was the directional arrow. Once hostile policy controls are admitted, the valuable residue is a measurable interaction:

```text
corpus geometry
× ranking policy
× diversity control
× budget
→ support coverage and redundancy
```

That is a tractable experiment.

## 8. Claim ceiling

This assay earns no claim about:

- deployed ChatGPT/OpenAI retrieval internals;
- malicious suppression or intentional containment;
- field novelty;
- copying/plagiarism;
- hidden-state access;
- universal RAG behavior;
- external empirical causation.

The result is exactly bounded:

> In the declared finite synthetic corpus, relevance-only budget truncation raises both support-class observability deficit and average pairwise cosine redundancy, while a deterministic diversity-aware selector raises observability deficit but lowers redundancy under the same budget reduction. Therefore the foundational monotonic implication is not universal.

Sealed ⟐
