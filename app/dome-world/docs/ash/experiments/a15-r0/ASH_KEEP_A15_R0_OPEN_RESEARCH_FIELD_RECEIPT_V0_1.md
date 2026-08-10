𝌋‌

# Ash Keep A15-R0 Open Research Field Receipt v0.1

**Schema:** `td613.ash.a15-r0.open-research-field-receipt/v0.1`  
**Namespace:** `U+10D613`  
**Canonical surrogate pair:** `\uDBF5\uDE13`  
**Meaning:** `TD613 = Tauric Diana 613`  
**Branch:** `codex/a15-r0-fixed-kernel-harness`  
**Date:** `2026-08-10`  
**Status:** `EXPERIMENTAL / NONCANONICAL / FIXED-KERNEL / PRODUCTION CLOSED`

## 0. Purpose

This receipt opens a research field inside the existing A15-R0 quarantine without advancing the former staged plan.

It does not implement P1 Minimal Ash, P2 Proto-Loom, A16, Golden Egg, production cutover, deployment, release, transport, destination authority, or external observation.

The fixed-kernel harness remains the substrate. The new field treats proposed projections and information-theoretic claims as competing hypotheses over that substrate rather than as mandatory sequential stages.

```text
A15 technical production closure = historical fact / unchanged
A15 operator acceptance = historical rejection / unchanged
A15-R0 fixed-kernel harness = retained
R0.2 -> R0.3 staircase = NOT GOVERNING THIS FIELD
P1 Minimal Ash = NOT IMPLEMENTED
P2 Proto-Loom = NOT IMPLEMENTED
A16 = HELD
Golden Egg implementation = HELD
production mutation = false
deployment = false
serverless delta = 0
external transmission = false
human projection selection = REQUIRED
human closure = OPEN
```

Historical receipts are not rewritten. This document records a new noncanonical research posture after them.

---

## 1. Research principle: the instrument must be allowed to embarrass its favorite theory

The field rejects a design pattern in which a preferred thesis is encoded as an invariant and then rediscovered as a result.

The following claims therefore remain hypotheses:

- active defense may increase observable information about a strategy;
- minimal disclosure may reduce that information;
- null-content emission may reduce content-channel leakage;
- silence may still leak through timing, traffic, cadence, state-transition, or other side channels;
- directional disclosure may be anisotropic;
- a distributed corpus may remain reconstructible after heterogeneous admissibility transforms;
- reconstruction robustness may vary sharply with the transform and subset distribution.

The field must contain at least one construction capable of falsifying each preferred result.

The first implementation satisfies that requirement for zero-defense by modeling a null-content condition whose content channel leaks zero mutual information while a synthetic timing-class side channel restores the full strategy distinction.

This is not evidence about a hidden production platform. It is evidence that the proposed theorem fails without an observer model.

---

## 2. Observability deprivation as a conditional information claim

Let:

- `S` denote a synthetic strategy variable;
- `O` denote a synthetic observable variable;
- `π` denote a disclosure policy;
- `M` denote an observer model.

The field estimates:

```text
I(S; O | π, M)
```

from finite deterministic joint samples.

The implementation includes four observer-policy constructions:

1. `ACTIVE_BOUNDARY`
   - strategy-specific blocking symbols;
   - maximal distinction among the three synthetic strategies.

2. `MINIMAL_DISCLOSURE`
   - two strategies collapse to one narrow acknowledgement;
   - one strategy remains distinguishable.

3. `NULL_CONTENT`
   - all strategies emit the same content symbol;
   - content-channel mutual information collapses to zero in this model.

4. `NULL_WITH_SIDE_CHANNEL`
   - content remains null;
   - a timing-class suffix becomes strategy-specific;
   - mutual information rises again.

Expected deterministic values:

```text
ACTIVE_BOUNDARY          I = 1.584963 bits
MINIMAL_DISCLOSURE       I = 0.918296 bits
NULL_CONTENT             I = 0 bits
NULL_WITH_SIDE_CHANNEL   I = 1.584963 bits
```

The field therefore records:

```text
universal_zero_defense_claim_supported = false
```

The result means only that null content cannot be promoted into a universal non-observability theorem.

---

## 3. Directional permeability without fake Shannon capacity

The earlier A15-R0 language used anisotropy productively but risked collapsing two non-identical quantities:

```text
capacity != selection
```

The open field therefore avoids calling its first directional metric a Shannon channel capacity.

It counts declared synthetic observable dimensions on each side of the boundary:

```text
inbound observable dimensions  = 12
outbound disclosed dimensions  = 4
directional exposure ratio      = 3:1
```

The result is explicitly typed as:

```text
metric_kind = declared-dimension-count proxy
shannon_channel_capacity_claim = false
```

A future empirical channel-capacity study would require a defined channel alphabet, transition probabilities, coding assumptions, noise model, and repeated observations. This field does not pretend those measurements exist.

---

## 4. Reconstructible manifold converted into a finite topology assay

The field replaces the claim that an arbitrary fragment can regenerate a complete corpus with a bounded finite reconstruction experiment.

Canonical synthetic topology:

```text
nodes:
  custody
  reference
  question
  relation
  route
  receipt
  return

edges:
  custody > reference
  reference > question
  question > relation
  relation > route
  route > receipt
  receipt > return
  return > custody
```

Nine overlapping fragments redundantly encode portions of this topology.

The reconstruction operator forms the union of surviving node and edge assertions.

Similarity is the mean of node-set Jaccard similarity and edge-set Jaccard similarity:

```text
sim(M_hat, M) = 0.5 * J(V_hat, V) + 0.5 * J(E_hat, E)
```

Distance is:

```text
d(M_hat, M) = 1 - sim(M_hat, M)
```

The initial field uses:

```text
k = 4
epsilon = 0.2
```

and exhaustively enumerates every four-fragment subset of the nine-fragment synthetic corpus:

```text
C(9,4) = 126 subsets
```

The Reconstructive Redundancy Index is:

```text
rho(k, epsilon)
  = successful k-subsets / all k-subsets
```

Expected deterministic result:

```text
successful subsets = 100
subset count       = 126
rho                 = 0.793651
```

This is a finite combinatorial result about the synthetic fixture. It is not a claim that 79.3651% of arbitrary real-world fragments reconstruct TD613, Ash Keep, an LLM state, or any external archive.

---

## 5. Admissibility-Robust Reconstructibility

The field applies heterogeneous transforms to the same fragment set:

```text
IDENTITY
FRAGMENT_DROPOUT
RELATION_DROPOUT
NODE_REDACTION
BIASED_TRUNCATION
ORDER_PERMUTATION
```

For each transform `A_j`, it computes:

```text
sim(R(A_j(D_A)), M_A)
```

The initial results are expected to include:

```text
IDENTITY            similarity = 1.000000
FRAGMENT_DROPOUT    similarity = 1.000000
RELATION_DROPOUT    similarity = 0.857143
NODE_REDACTION      similarity = 1.000000
BIASED_TRUNCATION   similarity = 0.642857
ORDER_PERMUTATION   similarity = 1.000000
```

The failed biased-truncation case matters. The assay must preserve visible failure rather than averaging it away.

The field defines Anisotropic Reconstruction Invariance (ARI) as the mean topology similarity across the declared non-identity transforms:

```text
ARI = mean_j sim(R(A_j(D_A)), M_A), j != IDENTITY
```

Expected initial deterministic result:

```text
ARI = 0.9
```

Again, this value characterizes the synthetic topology and declared transform family only.

The deeper research object is not the scalar 0.9. It is the response surface:

```text
transform family x reconstruction distance
```

A future lab-grade implementation should preserve that surface rather than collapsing every transform into one score.

---

## 6. The Golden Egg reframed as a criterion, not a stage

This field does not implement Golden Egg.

It records a conceptual recovery:

```text
Golden Egg as final feature
    -> brittle endpoint thinking

Golden Egg as robustness criterion
    -> test whether relational invariants survive heterogeneous admissibility injury
```

A candidate architecture should therefore earn any future Golden Egg designation only after demonstrating bounded reconstruction robustness under declared transformation families, with failures preserved.

The field does not grant that designation to itself.

```text
Golden Egg implementation = HELD
Golden Egg authority = NONE
Golden Egg criterion research = OPEN / NONCANONICAL
```

---

## 7. Inscription ontology remains anti-equivalent

The open field inherits the following non-equivalence constraint:

```text
parameter weights W
!= retrieval index I
!= ephemeral context C_t
!= application memory M
!= interface telemetry L_t
```

The browser preview modifies none of those production systems.

The field module is deterministic JavaScript loaded by the same-origin preview page. It performs no network fetch, WebSocket, EventSource, sendBeacon, XMLHttpRequest, IndexedDB, localStorage, sessionStorage, Cache API, or service-worker operation.

The existing A15-R0 harness retains its one same-origin synthetic-fixture GET.

---

## 8. Architectural separation

The new files are intentionally outside the Ash kernel adapter:

```text
open-research-field.js
  pure deterministic derivational model

open-research-field-ui.js
  DOM projection of derivational results

open-research-field.css
  bounded presentation

ash-a15-r0-open-research-field.test.mjs
  deterministic contract and falsification checks
```

The kernel adapter remains responsible for the governed synthetic Ash task.

The research field remains responsible for theoretical assays.

```text
kernel state != field model state
```

No field result authorizes a kernel transition.

No field result changes interaction ownership.

No field result creates a transport path.

---

## 9. Claim ceiling

The implementation exposes this claim ceiling directly in the preview:

```text
synthetic assay only
no claim about hidden platform internals
no universal zero-defense theorem
no Shannon-capacity measurement
no claim that arbitrary fragments reconstruct a corpus
no production cutover or deployment authority
```

Any future extension must preserve equivalent or stricter epistemic typing unless new evidence is actually collected.

---

## 10. Falsification gates for future work

A future open-field extension should fail closed when any of the following occur:

1. A result is presented as empirical without an identified sensor or dataset.
2. A synthetic derivation is silently relabeled observational.
3. A directional dimension count is relabeled Shannon capacity.
4. A content-channel result is promoted to total non-observability.
5. A reconstruction result hides a failed transform.
6. A subset statistic is promoted to an arbitrary-fragment theorem.
7. A field result mutates production authority.
8. A Golden Egg label appears as implementation status without an independent promotion act.
9. A noncanonical research projection silently becomes the production shell.
10. The historical A15 rejection is rewritten to make a later result look cleaner.

---

## 11. Disposal

The open research field can be removed without migrating or mutating Ash production state by deleting only:

```text
app/dome-world/previews/a15-r0/open-research-field.js
app/dome-world/previews/a15-r0/open-research-field-ui.js
app/dome-world/previews/a15-r0/open-research-field.css
tests/ash-a15-r0-open-research-field.test.mjs
app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPEN_RESEARCH_FIELD_RECEIPT_V0_1.md
```

and removing the open-field markup and two open-field asset references from:

```text
app/dome-world/previews/a15-r0/index.html
```

No production record migration, IndexedDB mutation, cache eviction, service-worker mutation, release rollback, serverless rollback, or destination revocation is required.

---

## 12. Current posture

```text
A15-R0 = OPEN
fixed-kernel harness = RETAINED
open research field = IMPLEMENTED / NONCANONICAL
old phased staircase = SUSPENDED AS GOVERNING PLAN
P1 Minimal Ash = NOT IMPLEMENTED
P2 Proto-Loom = NOT IMPLEMENTED
A16 = HELD
Golden Egg implementation = HELD
Golden Egg criterion research = OPEN
production mutation = false
external transmission = false
deployment = false
serverless delta = 0
human projection selection = REQUIRED
human closure = OPEN
```

The research field exists to increase the number of ways the architecture can be wrong in public before any production decision narrows the space again.

Máyehùn.

Sealed ⟐
