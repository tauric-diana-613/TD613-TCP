# Pedagogue Research Hydration

Status: **GENERIC / RESEARCH-ONLY / NON-AUTHORITATIVE**

Pedagogue originally learned from product and operator-facing encounters: a local consequential case could reveal a reusable mechanism, then the mechanism could be stripped of product nouns, independently tested, and only afterward considered for shared-core promotion.

Research hydration extends that same law to external scientific literature without turning literature into Pedagogue ontology.

## The research-transfer card

A `td613.flowcore.pedagogue-research-transfer-card/v0.1` contains only a bounded structured record:

- primary-source provenance and source class;
- source publication date **at the precision actually supplied by the source**;
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

## Source-date precision is evidence

Research sources do not all publish dates at the same precision. Pedagogue may therefore accept:

```text
YYYY       → YEAR
YYYY-MM    → MONTH
YYYY-MM-DD → DAY
```

and records the resulting `publication_date_precision` on every transfer card.

The rule is:

```text
source supplied year only
→ retain year only
→ publication_date_precision = YEAR
```

Pedagogue may not infer a month from issue order, a repository modification timestamp, a conference season, or surrounding papers merely to satisfy a schema that prefers more digits.

Likewise, malformed dates fail closed:

```text
2026-13    → reject
2026-02-30 → reject
Spring 2026 → reject
```

This is a provenance rule, not cosmetic validation. **Unknown precision is not missing rigor; invented precision is false evidence.**

Hydration reports aggregate source-date precision counts so a research packet can see how much of its chronology is day-, month-, or year-resolved without upgrading any source silently.

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
→ source-faithful provenance precision
→ bounded research-transfer card
→ stripped generic relation
→ cross-domain witness review
→ independent synthetic assay
→ falsifier / negative control
→ human closure
→ only then consider shared-core promotion
```

## Moss Lantern v0.1 hydration use

The first research-hydration field is A15-R0 Moss Lantern. Its 2026 literature fixture spans tomography, inverse-problem identifiability, control/representation, moiré and phasonics, quasiperiodic structure, quantum-geometry methodology, authorship/provenance, operator learning, inverse design, observability/aliasing, and assumption-scoped or stochastic identifiability.

The hydration does not make those sciences TD613 ontology. It uses them to author better falsifiers and controls.

For example:

- temporal tomography teaches that ordered process history may need to remain first-class;
- inverse-problem identifiability teaches that visibility and recoverability are distinct;
- distributed-observation work teaches that multiple probes may be correlated rather than independent;
- moiré/phason work motivates a separate registry-shift perturbation rather than treating quasiperiodicity as a static texture;
- latent-representation work motivates equivalence-controlled transforms without granting latent physical geometry;
- holonomy papers raise the threshold for later transport claims: route residue alone remains insufficient;
- inverse-design work motivates target → candidate → independent verification loops while physical realization remains outside current authority;
- stochastic and causal identifiability work motivates declaring the model class, observation object, structural assumptions, and surviving equivalence class before using the word `identifiable`.

The first executable result of that hydration was deliberately narrower: Moss Lantern ML1 reference identifiability plus the minimum ML2 probe-dependence controls. Subsequent research passes have used the same hydration discipline to author temporal-order, alias-location, and model-scope boundary assays without granting them automatic law status.

## Promotion law remains unchanged

Research hydration may propose experiments. Shared Pedagogue law still requires a generic mechanism, independent testing outside the source context, bounded authority, and human closure.

Research hydration is therefore an **input discipline for learning**, not an authority to learn automatically.
