# Pedagogue Research Hydration

Status: **GENERIC / RESEARCH-ONLY / NON-AUTHORITATIVE**

Pedagogue originally learned from product and operator-facing encounters: a local consequential case could reveal a reusable mechanism, then the mechanism could be stripped of product nouns, independently tested, and only afterward considered for shared-core promotion.

Research hydration extends that same law to external scientific literature without turning literature into Pedagogue ontology.

## The research-transfer card

A `td613.flowcore.pedagogue-research-transfer-card/v0.1` contains only a bounded structured record:

- primary-source provenance and source class;
- a generic `domain_family` and optional domain tags;
- the domain-specific observed relation;
- a stripped transferable relation;
- admissible synthetic assays;
- alternative explanations;
- falsifiers;
- forbidden inferences;
- a claim ceiling.

The card does **not** ingest raw paper content. It does not copy a paper's ontology into TD613. It does not transfer source authority, promote a law, redesign a product, mutate production, or authorize external transmission.

Supported source classes are deliberately narrow:

```text
PRIMARY_PEER_REVIEWED
PRIMARY_ACCEPTED
PRIMARY_PREPRINT
```

Source class is preserved because an interesting preprint and a peer-reviewed paper are not the same evidentiary object.

## Hydration

`hydratePedagogueResearch(cards)` groups cards by generic mechanism and asks whether the same stripped relation has witnesses from more than one independent domain family.

A cross-domain review candidate requires at minimum:

```text
unique source references >= 2
and
distinct domain families >= 2
```

This is intentionally stricter than counting papers. Two papers in one field can deepen a relation without constituting independent cross-domain transfer.

A passing cross-domain threshold produces only:

```text
CROSS_DOMAIN_REVIEW_CANDIDATE
```

It never produces:

```text
PEDAGOGUE_LAW
PROMOTED_ONTOLOGY
PRODUCT_REQUIREMENT
PHYSICAL_IDENTITY
```

The learning posture remains:

```text
HYPOTHESIS_GENERATION_AND_ASSAY_DESIGN_ONLY
```

## Why this is Pedagogue-native

The existing `TRANSFER` phase already protects the relation:

```text
pattern relation observed across contexts
!=
universal equivalence
```

Research hydration moves one step earlier. It structures an external observation before that observation is allowed to become a transfer candidate.

The complete research-learning route is:

```text
primary source
→ bounded research-transfer card
→ stripped generic relation
→ cross-domain witness review
→ independent synthetic assay
→ falsifier / negative control
→ human closure
→ only then consider shared-core promotion
```

## Moss Lantern v0.1 hydration use

The first research-hydration field is A15-R0 Moss Lantern. Its 2026 literature fixture spans tomography, inverse-problem identifiability, control/representation, moiré and phasonics, quasiperiodic structure, quantum-geometry methodology, authorship/provenance, operator learning, and inverse design.

The hydration does not make those sciences TD613 ontology. It uses them to author better falsifiers and controls.

For example:

- temporal tomography teaches that ordered process history may need to remain first-class;
- inverse-problem identifiability teaches that visibility and recoverability are distinct;
- distributed-observation work teaches that multiple probes may be correlated rather than independent;
- moiré/phason work motivates a separate registry-shift perturbation rather than treating quasiperiodicity as a static texture;
- latent-representation work motivates equivalence-controlled transforms without granting latent physical geometry;
- holonomy papers raise the threshold for later transport claims: route residue alone remains insufficient;
- inverse-design work motivates target → candidate → independent verification loops while physical realization remains outside current authority.

The first executable result of that hydration is deliberately narrower: Moss Lantern ML1 reference identifiability plus the minimum ML2 probe-dependence controls.

## Promotion law remains unchanged

Research hydration may propose experiments. Shared Pedagogue law still requires a generic mechanism, independent testing outside the source context, bounded authority, and human closure.

Research hydration is therefore an **input discipline for learning**, not an authority to learn automatically.
