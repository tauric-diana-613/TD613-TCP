# TCP - The Cadence Playground

TCP is a deterministic browser instrument for studying patterned language at the moment it becomes socially legible without yet becoming safely routable. That interval matters when residue is real before verdict is available, when cadence survives paraphrase strongly enough to merit measurement, and when a post-training system needs explicit separation between what it detects, what it transforms, and what it is allowed to claim.

The project therefore treats stylometry as bounded signal modeling rather than as authorship adjudication. It measures sentence rhythm, connector behavior, contraction posture, punctuation density, lexical dispersion, and recurrence pressure; it stages shell borrowing and persona reuse; and it forces those transformations through a retrieval lane with semantic audits, protected-anchor checks, and explicit failure classes before the system is allowed to present the result as anything stronger than exploratory contact.

The live browser surface is playful by design, but the model is not loose. TCP is thresholded, auditable, deterministic, and explicit about where measurement ends and policy begins.

For the Phase 0 architecture admission of TCP's adversarial stylometry bench, see [docs/ADVERSARIAL_STYLOMETRY_BENCH.md](docs/ADVERSARIAL_STYLOMETRY_BENCH.md). That document defines the closed-loop Escape Vector, Personas as living exposure membranes, Hostile Pipeline Compression, Belonging Without Collapse, Ingestion Friction, the iteration ledger / flight recorder distinction, and the claim ladder without changing runtime behavior.

## Registered field language

TCP's glyph system is operational, not decorative. The browser uses a registered field language to keep surface role, state transition, and retrieval truth aligned.

The current public membrane is organized as five roles:

- `Ingress` = threshold
- `Homebase / Personas` = anchor, mask shelf, contact, residue
- `Readout` = witness and law
- `Deck` = encounter and duel
- `Trainer` = forge

That role split matters because TCP does not present every state in the same voice. Ingress now hands off directly into `Homebase / Personas`, while `#console` remains only as a compatibility alias. `Homebase / Personas` is where a cadence home is locked, a mask is chosen or worn, and residue is read. `Readout` stays colder because it is the proof surface. `Trainer` stays retrieval-first, but the visible loop now reads as extraction, live draft forging, validation, correction, and injection rather than as generic tooling.

Adjacent to the six-room TCP shell, `TD613 Flight` is the SHI-gated credential flightdeck launched from Safe Harbor. It prepares LLM-ready Flight Packets and authorship / rupture footers, but it does not mint SHI on its own; entrants must complete Safe Harbor's triad first.

## Problem statement

Most language systems flatten three different acts into one gesture:

- measuring patterned resemblance
- transforming text into donor-shaped outputs
- inferring what those patterns should mean socially or operationally

TCP is built to keep those acts separate. The research question is not whether cadence can be made legible. It can. The harder question is how to expose stylometric contact, shell borrowing, route pressure, and provenance-sensitive passage without allowing resemblance to impersonate authorship, route, or repair.

The current system is organized around three layers:

1. stylometric evidence from measured text features
2. field and route transforms derived from those measurements
3. custody and harbor policy over the resulting state

That separation is the backbone of the project.

## Formal model

### Feature extraction

For each text, TCP computes a bounded stylometric profile over scalar features and normalized distributions. The feature families include punctuation density `p`, contraction density `c`, line-break density `ell`, repeated-bigram pressure `b`, lexical dispersion `x`, function-word profile `F`, word-length profile `W`, character-trigram profile `G`, and recurrence pressure `R_text`.

```math
p = \frac{\#\{\text{punctuation marks}\}}{\max(\text{word count},1)}
```

```math
c = \frac{\#\{\text{tokens containing apostrophes}\}}{\max(\text{word count},1)}
```

```math
\ell = \frac{\#\{\text{line breaks}\}}{\max(\text{sentence count},1)}
```

```math
b = \frac{\text{repeated bigram mass}}{\max(\text{word count}-1,1)}
```

```math
x = 0.4u + 0.3p_r + 0.3n
```

where `u` is unique-token ratio, `p_r` is token predictability, and `n` is singleton-type ratio.

```math
R_{\text{text}}=
\frac{1}{3}\left(
\operatorname{clip}\left(\frac{p}{0.35},0,1\right)+
\operatorname{clip}\left(\frac{\ell}{0.75},0,1\right)+
\operatorname{clip}\left(\frac{b}{0.18},0,1\right)
\right)
```

These quantities exist to keep the browser model inspectable and bounded. They are not universal stylistic constants.