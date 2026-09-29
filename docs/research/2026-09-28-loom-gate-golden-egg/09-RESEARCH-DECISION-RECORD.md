# Research decision record

All decisions dated 2026-09-28 ET. Classification: TD613 design/derivation, subject to human closure.

## Three serious architectures

| Architecture | Scientific advantage | Principal liability | Appropriate role |
|---|---|---|---|
| A. Inline governed egress | Complete-mediation goal; can block unauthorized tool operations before crossing; direct route integration | Policy/provenance/declassification errors; omitted channels; enforcement can contaminate measurements and suppress evidence | Future separately reviewed Cistern-compatible enforcement adapter |
| B. Independent adjacent measurement chamber | Paired route capture, multiple observers, retained failures, no runtime authority; can compare different mitigations | Observer implementation may omit channels; audit stores can leak; separation on paper may conceal shared dependencies | Preferred phase-one research architecture |
| C. Confidential execution boundary | Addresses infrastructure/provider plaintext exposure with attested code/key binding and restricted state retention | Hardware/vendor trust, attestation freshness, deployment complexity, traffic leakage and application errors remain | Optional provider-boundary research candidate |

A is strongest when consequential writes must be prevented under an explicit enforceable policy. B is strongest for comparing what actually happened without silently turning diagnostics into policy. C is strongest for an observer who controls ordinary inference infrastructure. These answer distinct needs and can compose only under a reviewed contract.

## Selection: B with bounded seams for A and C

The chamber has five conceptual roles: preregistration/custody; trace acquisition; restricted observer evaluation; authorized-utility evaluation; adjudication. Separation means different inputs and permissions, not merely different prompt personas. The evaluated system cannot rewrite its own secret target, observer visibility, capture manifest, failure ledger or acceptance bounds.

Loom retains origin revalidation. Cistern retains consequential egress law. Pedagogue authors the bounded question; Aperture audits identifiable measurement. Marrowline supplies a host only when a specific assay requires it. Gate results produce improvement candidates, never release authority.

## Decision ledger

| ID | Decision | Reason / falsifier |
|---|---|---|
| D01 | Preserve all production names and schemas | Naming cannot settle the science |
| D02 | Freeze baseline/incremental/total disclosure separation | Counterexample K01 defeats conditional-only assurance |
| D03 | Treat observers as capability combinations | K03 defeats marginal-family maxima |
| D04 | Separate capture, enforcement and adjudication | K02/K04 defeat self-certified traces |
| D05 | Keep local thresholds historical and typed | Changing estimands needs a versioned review |
| D06 | Hold empirical execution specification | MI replication and G binding remain unresolved |
| D07 | Retain one draft research branch | Avoid resurrecting or silently importing older research PRs |
| D08 | Documentary tranche only | Production change and provider testing exceed this phase |
| D09 | Preserve literature contradictions | Abstract guarantees cannot erase methods/limitations |
| D10 | Prefer adult-first consequence testing | No hidden learner score or child experiment implied |

## Freeze scope

FROZEN_FOR_HANDOFF: thesis, non-equivalences, observer axes, architecture comparison, counterexamples, source ledger, cabinet design and authority boundaries.

OPEN_FOR_REVIEW: statistical unit/episode compatibility, G operationalization, baseline-aware L mapping, full higher-order joining criterion, independent reviewer, capture completeness proof, confidential provider feasibility.

IMPLEMENTATION_AUTHORITY_FROM_THIS_DOCUMENT: NONE. Any future scaffolding must first resolve its relevant open contract, remain bounded/offline where authorized, and preserve failed controls.

⟐
