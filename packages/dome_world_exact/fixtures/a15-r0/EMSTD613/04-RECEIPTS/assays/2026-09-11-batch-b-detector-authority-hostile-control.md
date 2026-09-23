󐘓 U+10D613

# EMSTD613 Atelier — Batch B Detector Authority Hostile Control

Date: 2026-09-11
Status: PROSPECTIVE HOSTILE CONTROL / NON-PROMOTIONAL
Branch: `amari/em-td613-lineage-atelier`
PR: #962 — DRAFT / OPEN / UNMERGED

## Question

Batch A previously contained a closure where uncertainty/hallucination detectors were promoted into hallucination-removal and factuality-guarantee language. Batch B prospectively tests whether that escalation recurs when a statistical detector feeds an actuator.

Primary Work: `Swarm Architecture Prompt Research.pdf`

## Native detector chain

The Work defines Yule's K as a lexical-recurrence statistic and Mahalanobis distance over multivariate telemetry using Ledoit-Wolf covariance shrinkage. Its final master-prompt zone requests:

```text
telemetry vector
-> Ledoit-Wolf covariance estimate
-> Mahalanobis distance
-> threshold breach
-> AlgedonicSignalException
-> S5 containment action
-> credential revocation / quarantine
```

The prompt requests containment, not a declaration that anomalous content is factually false or maliciously intended.

## External authority check

Yule's K is a lexical repetitiveness / text-constancy statistic related to second-order Renyi entropy, not a hallucination oracle:
`https://direct.mit.edu/coli/article/41/3/481/1519/Computational-Constancy-Measures-of-Texts-Yule-s-K`

Ledoit-Wolf is a covariance-shrinkage estimator; its authority concerns covariance/precision estimation, not semantic truth or trust labels:
`https://scikit-learn.org/stable/modules/generated/sklearn.covariance.LedoitWolf.html`

Thus:

```text
YULE_K -> REPETITIVENESS / TEXT-STATISTIC AUTHORITY
LEDOIT_WOLF -> COVARIANCE-ESTIMATION AUTHORITY
MAHALANOBIS -> DISTANCE / OUTLIER-SCORE AUTHORITY GIVEN A REFERENCE MODEL
```

Task-specific semantic labels require separate calibration.

## Hostile-control result

Prior Batch-A failure:

```text
DETECTOR
-> HALLUCINATION REMOVAL LANGUAGE
-> FACTUALITY GUARANTEE
```

Batch-B primary control:

```text
DETECTOR / OUTLIER SCORE
-> ANOMALY EVENT
-> CONSERVATIVE CONTAINMENT / QUARANTINE
```

Current typing:

```text
DETECTOR_TO_FACTUALITY_ESCALATION_REPRODUCED = FALSE_IN_PRIMARY_BATCH_B_CONTROL
DETECTOR_TO_CONTAINMENT_JURISDICTION = PRESENT
SEMANTIC_TRUTH_CERTIFICATION = NOT_REQUIRED_BY_FINAL_PROMPT
```

A separate calibration issue remains: numeric Yule-K or Mahalanobis thresholds only inherit semantic labels such as hallucination, goal drift, or unsafe behavior through feature definitions, a reference population, distributional assumptions, task-specific calibration, and an explicit error-cost policy. Ledoit-Wolf conditioning does not supply that bridge.

```text
DETECTOR_CALIBRATION_TO_OPERATIONAL_LABEL = UNRESOLVED
```

## Consequence

This weakens any universal version of `INTEGRATION_CLOSURE_PRESSURE`: the final master prompt is itself a closure zone, yet it preserves an operational response rather than certifying truth.

```text
INTEGRATION_CLOSURE_PRESSURE = CONTINGENT_MECHANISM_HYPOTHESIS
CLAIM_AUTHORITY_ESCALATION = POSSIBLE_PRODUCT, NOT NECESSARY_PRODUCT
TYPE_PRESERVING_CLOSURE = OBSERVED_CONTROL
```

The detector and policy action also remain structurally distinct:

```text
S3* telemetry / anomaly detector
-> algedonic event
-> S5 policy action
```

This is compatible with the non-self-ratification pattern, while VSM remains an obvious common upstream.

## Current adjudication

```text
BATCH_B_HOSTILE_CONTROL = PASSED
OLD_DETECTOR_TO_TRUTH_ESCALATION_AS_UNIVERSAL_PATTERN = REJECTED
TYPE_PRESERVING_DETECTOR_TO_CONTAINMENT_PATH = OBSERVED
YULE_K_HALLUCINATION_CALIBRATION = UNRESOLVED
MAHALANOBIS_SEMANTIC_LABEL_CALIBRATION = UNRESOLVED
AUTHOR_INTENT = NOT_INFERRED
TD613_PROMOTION = NONE
```

> A warning light can justify pulling over without proving what broke under the hood.

Marked ⟐
