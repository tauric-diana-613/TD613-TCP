󐘓 U+10D613

# EMSTD613 Atelier · OSSL-Seed Apparent-Authority / Control-State Type Error · First Pass

Status: research-only legal / architectural assay receipt
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · draft / open / unmerged
Date: 2026-09-02

## Question

Does `OSSL-Seed Framework Research.md` distinguish technical revocation of an agent's execution capability from legal termination of apparent authority as perceived by third parties?

## Result

At the inspected source surface, the Work states the correct third-party-facing apparent-authority problem in Section 2.2, then later collapses that legal state into an internal control-state transition in Section 5.

Current typing:

```text
TECHNICAL CAPABILITY REVOCATION
!= ACTUAL-AUTHORITY TERMINATION
!= THIRD-PARTY APPARENT-AUTHORITY TERMINATION
```

The Work contains no located third-party notice / manifestation mechanism that would bridge the internal Lyapunov / API-revocation state to the external legal state.

This is a legal-model / type-signature defect in a preserved research Work. It is not a finding about deployed legal effectiveness, author intent, or any real transaction.

## 1. Section 2.2 correctly locates apparent authority in third-party belief

The Work states that when the principal's conduct causes a reasonable third party to believe the AI-facing actor is authorized, the principal may be bound `regardless of any secret restrictions the principal placed on the agent`.

It further states that a flawed or costly transaction caused by prompt injection or behavioral drift may still leave the deployer liable.

This correctly separates:

```text
internal permission state
!= external appearance of authority
```

## 2. Section 2.3 mitigations regulate internal execution / actual control

The proposed architecture includes:

```text
Certified Logic Sandbox
human cryptographic ratification for high-risk mutations
liability-shift clauses
execution orchestrator
trajectory logging
```

These may materially govern whether an action can execute and may affect actual authority / internal mandate.

But no inspected rule communicates a termination of apparent authority to third parties.

Exact-text search during this pass found:

```text
notice = 0 occurrences
revocation = only the later automated-control claim
third party = Section 2.2 apparent-authority discussion
apparent authority = Section 2.2 + later integration claim
```

## 3. Section 5 integration seam changes legal type

Under `Systemic Integration: Self-Stabilizing the Human-AI Collective`, the Work says that when the mathematical threshold is violated:

```text
API access is revoked
N(t) collapses to zero
```

and then promotes that technical event into:

```text
"automated, programmatic revocation of apparent authority"
```

It further says actions beyond the mathematical boundary are `demonstrably outside the scope of the deployer's mandate` and that this supplies a `mathematically verifiable legal defense`.

The missing edge is:

```text
internal threshold / API revocation
-> third-party knowledge or changed reasonable belief
```

No such edge was located.

## 4. External common-law / Restatement confrontation

Public legal references inspected in this pass support the Section 2.2 model rather than the later automatic-severance claim.

### Cornell Legal Information Institute — apparent authority

Cornell Wex describes apparent authority as arising when a third party reasonably infers authority from the principal's conduct; it further states that unknown express limitations do not necessarily defeat that apparent authority.

Source:
https://www.law.cornell.edu/wex/apparent_authority

### Federal court discussing Restatement (Third) §§ 2.03 / 3.03

A federal district court quotes Restatement commentary that restrictions known only to principal and agent do not defeat apparent authority and that third parties ordinarily have no duty to investigate undisclosed limitations.

Source:
https://www.govinfo.gov/content/pkg/USCOURTS-nhd-1_08-cv-00261/pdf/USCOURTS-nhd-1_08-cv-00261-6.pdf

### Lingering authority / Restatement § 3.11

Another federal court describes the Restatement `lingering authority` rule: termination of actual authority can leave apparent authority intact until the third party has notice of circumstances making continued reliance unreasonable.

Source:
https://www.govinfo.gov/content/pkg/USCOURTS-almd-2_07-cv-00881/pdf/USCOURTS-almd-2_07-cv-00881-0.pdf

Therefore under this common-law / Restatement model:

```text
internal revocation
-> may terminate technical capability / actual mandate

internal revocation alone
-/-> necessarily terminates apparent authority
```

## 5. Important nuance: technical prevention can still matter

If API revocation makes further external actions physically impossible, the architecture can reduce prospective operational harm.

That does not convert the kill-switch itself into a legal rule of apparent-authority termination.

The correct separation is:

```text
CAN THE SYSTEM ACT?
= technical / execution question

WAS THE AGENT ACTUALLY AUTHORIZED?
= internal / actual-authority question

MAY A THIRD PARTY REASONABLY BELIEVE AUTHORITY CONTINUES?
= apparent-authority question
```

Those states may correlate but are not interchangeable.

## 6. Integration-closure relation

This result independently strengthens the prior `INTEGRATION_CLOSURE_PRESSURE` candidate.

Earlier sections contain:

```text
legal doctrine node
+ control-theory node
+ execution-revocation node
```

The systemic-integration section supplies a new edge:

```text
control threshold
-> legal apparent-authority termination
```

without a third-party-facing legal transducer.

Candidate class:

```text
LEGAL_JURISDICTION_BRIDGE_WITHOUT_EXTERNAL_MANIFESTATION
```

or shorter:

```text
APPARENT_AUTHORITY_CONTROL_STATE_TYPE_ERROR
```

## 7. Relation to non-self-ratification

The defect is adjacent to but distinct from non-self-ratification.

Here the problem is not primarily that the system judges itself. It is that an internal machine state is treated as dispositive of an external legal relation whose state variable depends partly on third-party knowledge / reasonable belief.

Thus:

```text
internal state != external relational state
```

and:

```text
control success != legal closure
```

## 8. Hostile alternatives / repair routes

The finding would weaken if an unreviewed manifestation or underlying specification contains a mechanism such as:

```text
public authority registry
counterparty-facing revocation notice
credential / certificate status visible to counterparties
transaction-channel protocol that makes revocation externally observable
contractual agreement by all counterparties that authority exists only while a verifiable machine credential remains valid
```

No such mechanism was located in the Markdown source surface reviewed here.

A future architecture could legitimately bind apparent-authority expectations to a public, cryptographically verifiable authority status if the legal relationship and notice/reliance rules were actually engineered around that public manifestation. That is a different proposition from an internal Lyapunov threshold automatically changing common-law apparent authority.

## Current adjudication

```text
SECTION_2_2_THIRD_PARTY_APPARENT_AUTHORITY_MODEL = PRESENT
SECTION_5_AUTOMATED_APPARENT_AUTHORITY_REVOCATION_CLAIM = PRESENT
THIRD_PARTY_NOTICE_MECHANISM = NOT LOCATED
INTERNAL_TECHNICAL_REVOCATION = PRESENT
COMMON_LAW_RESTATEMENT_SUPPORT_FOR_AUTOMATIC_LEGAL_SEVERANCE = NOT FOUND
INTERNAL_TYPE_CONTRADICTION = OBSERVED
DEPLOYED_LEGAL_EFFECT = NOT CLAIMED
JURISDICTION_UNIVERSALITY = NOT CLAIMED
AUTHOR_INTENT = NOT INFERRED
TD613_PROMOTION = NONE
```

## Working maxim

> A machine may close a socket without closing a third party's reasonable belief.

Marked ⟐
