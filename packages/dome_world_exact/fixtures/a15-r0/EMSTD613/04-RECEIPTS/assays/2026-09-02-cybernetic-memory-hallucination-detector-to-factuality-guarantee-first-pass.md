󐘓 U+10D613

# EMSTD613 Atelier · Cybernetic Memory: Hallucination Detector → Factuality Guarantee · First Pass

Status: research-only assay receipt / OPEN_FIELD
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · draft / open / unmerged
Date: 2026-09-02

## Question

Does `Cybernetic Memory Algorithms Research.md` preserve the epistemic authority of its uncertainty / hallucination-detection methods through the physical-autonomy and conclusion zones, or does detector evidence get promoted into a stronger truth guarantee?

## Result

The Work contains a clear claim-force escalation:

```text
uncertainty estimator / hallucination detector
-> hallucination flag / interrupt
-> context described as "cleared of hallucinations"
-> generated outputs said to be "guaranteed" factually grounded
```

The underlying cited methods are detection / uncertainty-estimation methods with measured discrimination performance. No source reviewed supports the conclusion-level universal factuality guarantee.

Candidate class:

```text
CLAIM_AUTHORITY_ESCALATION_AT_CLOSURE
```

or more specifically:

```text
DETECTOR_TO_TRUTH_GUARANTEE_PROMOTION
```

No author intent or deployed-system claim is inferred.

## 1. Body-level authority is detector / uncertainty authority

The Work's `Semantic Entropy Probes and Energy Formulations` section describes:

- SEPs as lightweight linear probes approximating semantic entropy from hidden states;
- performance in hallucination detection and out-of-distribution generalization;
- Semantic Energy as an uncertainty signal operating on logits;
- an AUROC improvement claim relative to Semantic Entropy in certain conditions;
- an entropy-distribution method framed as a calibrated statistical hypothesis test;
- a response to a failed null test as `flagged as a hallucination`, triggering an algedonic interrupt.

These are all detector / uncertainty / decision-support claims.

## 2. Physical-autonomy seam promotes detector status

Immediately before the conclusion, the Work states that the LLM's context is:

```text
"cleared of hallucinations via Semantic Energy probing"
```

and therefore can reliably interpret the physical navigation state.

This changes the claim type:

```text
probabilistic / discriminative hallucination signal
-> successful removal of hallucinations from context
```

No perfect-recall / perfect-precision or exhaustive factual-verification contract is supplied at this seam.

## 3. Conclusion promotes again into guarantee

The conclusion states that HippoRAG plus Semantic Entropy Probes and Semantic Energy:

```text
"guarantees that the generated outputs are not merely plausible,
but factually grounded and structurally sound"
```

This is stronger than the measurement authority supplied by the body.

Current typing:

```text
UNCERTAINTY ESTIMATION
!= HALLUCINATION DETECTION WITH ZERO ERROR
!= HALLUCINATION REMOVAL
!= FACTUALITY GUARANTEE
```

## 4. External source confrontation — Semantic Entropy Probes

Source:
`Semantic Entropy Probes: Robust and Cheap Hallucination Detection in LLMs`
arXiv:2406.15927 / OpenReview

The public paper frames SEPs as uncertainty quantification / hallucination detection. Its reported discrimination performance is evaluated through AUROC across tasks/models; values vary substantially by layer/model/task rather than constituting a perfect detector.

The OpenReview paper reports later-layer AUROCs roughly in the 0.7–0.95 range in the examined setup and explicitly evaluates generalization rather than claiming zero-error factuality certification.

Sources:
https://arxiv.org/abs/2406.15927
https://openreview.net/pdf?id=Zd0XLr6JKn

## 5. External source confrontation — Semantic Energy

Source:
`Semantic Energy: Detecting LLM Hallucination Beyond Entropy`
OpenReview / arXiv:2508.14496

The public paper describes Semantic Energy as an uncertainty-estimation framework producing more reliable signals for downstream hallucination detection.

Its abstract does not claim that the method removes all hallucinations or guarantees factual truth.

Source:
https://openreview.net/pdf?id=E5mL07Fbq8

## 6. External source confrontation — entropy fingerprint / calibrated score

Source:
`Entropy Distribution as a Fingerprint for Hallucinations in Generative Models`
arXiv:2605.28264

This paper formalizes hallucination detection as a statistical hypothesis test and proposes a calibrated entropy score. It provides finite-sample calibration / error guarantees for the detector and asymptotic detection results under the paper's assumptions.

That is a formal guarantee about a detection procedure, not a proof that all unflagged generated claims are factually true.

Source:
https://arxiv.org/abs/2605.28264

This distinction is important:

```text
FORMAL ERROR GUARANTEE FOR A TEST
!= FACTUALITY GUARANTEE FOR EVERY MODEL OUTPUT
```

## 7. Integration-closure relation

This specimen differs from payload-type drift and the OSSL legal type error.

Here the edges themselves are mostly legible. The mutation occurs in the **authority class assigned to the output** as the Work closes:

```text
metric / detector
-> operational gate
-> elimination language
-> truth guarantee
```

Therefore `INTEGRATION_CLOSURE_PRESSURE` should admit at least four products:

```text
A. PAYLOAD_TYPE_DRIFT
B. JURISDICTION_BRIDGE_WITHOUT_CALIBRATION
C. EMPIRICAL_VALIDATION_COMPOSITING
D. CLAIM_AUTHORITY_ESCALATION
```

## 8. Positive interpretation / repair

A technically coherent repaired architecture could state:

```text
Semantic Energy / SEP / CES
-> bounded hallucination-risk signal
-> calibrated threshold + abstention / secondary verification
-> interrupt / reroute / request external evidence
```

without claiming the surviving output is thereby guaranteed factual.

This would preserve the useful sensor while preventing the sensor's success from becoming its own truth certificate.

## 9. Hostile alternatives

1. `guarantees` may be rhetorical closure rather than intended formal guarantee.
2. An unexported downstream verifier may exist.
3. The Work is a research synthesis / workspace artifact rather than a publication-ready specification.
4. Some cited detectors provide formal error guarantees under defined assumptions; the error may be scope inflation rather than total invention.

These alternatives remain live.

## Current adjudication

```text
BODY_DETECTOR_AUTHORITY = PRESENT
BODY_AUROC / UNCERTAINTY LANGUAGE = PRESENT
"CLEARED OF HALLUCINATIONS" = PRESENT
CONCLUSION_FACTUALITY_GUARANTEE = PRESENT
EXTERNAL_SOURCE_SUPPORT_FOR_UNIVERSAL_FACTUALITY_GUARANTEE = NOT FOUND
CLAIM_AUTHORITY_ESCALATION = OBSERVED
DEPLOYED_FAILURE = NOT CLAIMED
AUTHOR_INTENT = NOT INFERRED
TD613_PROMOTION = NONE
```

## Working maxims

> A detector may know when to worry without knowing the truth.

> Calibration of a warning light does not certify the road beyond it.

Marked ⟐
