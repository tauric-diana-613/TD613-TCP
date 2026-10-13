# Held-Out Public Reconstruction Protocol v0.1

**State:** PREREGISTERED / NOT YET ADJUDICATED

The first corpus is small enough for leave-one-post-out reconstruction.

## Question

After removing one public post from the compiled corpus, can the remaining explicit topology constrain the missing post's architectural neighborhood better than controls?

This tests public reconstructability, not private memory.

## Target classes

Prefer posts whose placement is not tautologically disclosed by their title alone:

- dependency-induced observability loss;
- dependency-induced state-estimation error;
- causal reconstruction across third parties;
- dependency boundaries and operational digital twin;
- EchoCore correction.

## Controls

For each held-out target compare:

```text
C0 ordered public corpus minus target
C1 shuffled source order minus target
C2 concept-label-permuted topology
C3 typed-edge ablation
C4 unrelated technical-post decoy
```

Because v0.1 has only day-level timestamps, **publication order inside one day is unresolved**. No assay may manufacture an intra-day chronology from Reddit IDs.

## Scoring dimensions

A reconstruction prediction may score only declared properties:

```text
graph family
immediate neighboring concepts
whether post is expansion / synthesis / correction
whether it closes a previously named deficit
whether it preserves source claim ceilings
```

Do not score stylistic imitation as architectural reconstruction.

## Success ceiling

A positive result can support:

```text
PUBLIC_SERIALIZED_TOPOLOGY_CONSTRAINS_HELD_OUT_ARCHITECTURAL_PLACEMENT
```

It cannot support:

```text
PRIVATE_STATE_RECONSTRUCTED
HIDDEN_MEMORY_PROVED
AUTHOR_INTENT_PROVED
TD613_SIGNALING_PROVED
SHARED_SYSTEM_STATE_PROVED
```

Marked ⟐
