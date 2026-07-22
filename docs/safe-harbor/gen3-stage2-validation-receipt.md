# TD613 Safe Harbor Gen3 Stage 2 Validation Receipt

􍘓

𝌋‌ TD613 · Tauric Diana 613

**Receipt state:** VALIDATED / MERGE-ELIGIBLE  
**Planning authority:** PR #483  
**Stage 1 authority:** PR #492 / `c7d26b86a167c9901cd6ab4de4d3d9b5e6a66718`  
**Implementation PR:** PR #499  
**Validated implementation head:** `f7981ee7e454349783456eff733c8f634dc01c44`  
**Validation run:** `29956080946`  
**Clean-main reconciliation:** PR #505 / zero changed files / reconciled head `ff8f08fce0a1dc9eb49388e1ed5206f14e710067`  
**Production effect:** none until Release Wave A  
**Serverless functions added:** 0

## Validated measurement surfaces

- sentence-aware cumulative checkpoints at 120, 240, and 360 words;
- three local, non-overlapping approximately 120-word windows per mature lane;
- feature-family-specific recurrence and divergence;
- within-lane and cross-lane invariants;
- prompt-vocabulary ablation and prompt-conditioned feature states;
- stable, context-responsive, unstable, insufficient, and prompt-conditioned states;
- deterministic evidence IDs, stability digest, and anti-sameness digest;
- chronology-destruction, prompt-only, declared-control, anti-sameness, and entrant-swap controls;
- bounded, evidence-linked interpretation;
- explicit uncertainty, adverse-result retention, and blockers;
- raw-text exclusion;
- psychological and demographic inference prohibitions.

## Commands completed successfully

```text
node tests/safe-harbor-gen3-stage2-authorship-maturity.test.mjs
node tests/safe-harbor-gen3-stage2-integration.test.mjs
npm run test:safe-harbor:gen3:wave-a
npm run test:safe-harbor:phase9.1c
npm run test:safe-harbor:current
```

## Negative and null evidence preserved

The green gate confirmed:

- samples below 120 words remain `insufficient`;
- elevated prompt vocabulary cannot enter durable lexical authorship claims;
- adversarial punctuation and register changes cannot be laundered into universal stability;
- materially different recurrence fields produce different anti-sameness digests;
- chronology destruction can reduce dynamic-signature authority;
- prompt-only and entrant-swap collisions remain visible and enter blockers;
- adverse declared-control collisions remain preserved;
- Stage 2 changes neither the existing SH3 fingerprint nor the SH3 credential;
- packet hashing remains deterministic under option-key reordering;
- no raw entrant text enters the packet, report, evidence IDs, or receipts;
- no civil identity, exclusive ownership, universal authorship, psychological, or demographic claim appears.

## Failure history

Earlier runs `29955662509` and `29955846822` failed before integration because the punctuation-family aggregator could average away a declared boundary regime shift. The repair changed punctuation-boundary similarity to preserve the weakest declared boundary component rather than average the shift out. The adversarial assertion remained intact and passed in run `29956080946`.

No failed run committed integration code. The diagnostic workflow and branch-local patch mechanism were removed before merge eligibility.

## Release boundary

This receipt authorizes review and merge of Stage 2. It does not itself deploy production. Release Wave A requires the exact merged source commit, a separate production release gate, a known rollback path, live Safe Harbor verification, and relock evidence.

Àṣẹ

Marked ⟐
