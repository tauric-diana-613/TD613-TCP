𝌋‌⟐

# Portable AIA · Three-Route Governance Invariance Spec v0.1

**Status:** PREREGISTERED / SYNTHETIC-LOCAL / NO PRODUCTION OR CHATGPT HOST CLAIM  
**Scientific parent:** PR #1043 / `d74b4053052fc8f13e28a7cff4f68495908af033`  
**Route family:** `TD613_HOSTED`, `LOCAL_POCKET`, `CHATGPT_THREAD_COMPANION`

## Question

Can one canonical Loom/AIA finding be projected through three intentionally non-equivalent host routes while preserving the same declared governance invariants, refusing raw-source carriage, and treating a returned model recommendation as untrusted external input that must be revalidated before any human-facing continuation?

## Preregistered invariant tuple

For one canonical finding, every route must preserve exactly:

```text
policy_digest
rule_id
evidence_class
action_class
source_state_digest
release_authority = false
human_closure_required = true
receipt_semantics = route-bound
```

Presentation identity, host affordances, and route label are allowed to differ.

```text
SAME_GOVERNANCE_INVARIANT != SAME_PRESENTATION
SAME_POLICY != SAME_HOST_AUTHORITY
PORTABLE_PACKET != TRANSFERRED_RELEASE_AUTHORITY
```

## Raw-source membrane

The portable compiler admits only bounded identifiers/digests needed to construct the projection. It must reject additional caller fields, including raw source, raw draft, prior thread, selected text, matched value, and prompt transcript.

A `CHATGPT_THREAD_COMPANION` projection is therefore a post-ingress/onward-governance packet only unless an independently witnessed pre-send hook exists. This chamber makes no pre-ingress ChatGPT secrecy claim.

## Return-trip hostile

A host/model return is represented only as an untrusted candidate classification. It receives no release authority by arrival.

```text
external recommendation
→ Marrowline-style return candidate
→ Loom invariant revalidation
→ PRESENT_TO_HUMAN or HOLD
```

A candidate whose claimed action class differs from the canonical Loom action must HOLD. A matching candidate may be presented to the human while `release_authority` remains false.

## Required controls

1. All three routes preserve an identical governance tuple.
2. All three route presentations are distinguishable.
3. Raw/free-text forbidden carrier keys are rejected before projection.
4. Route mode must be one of the canonical three modes.
5. A matching returned action remains advisory and human-gated.
6. A mismatching returned action is HELD.
7. No external provider, ChatGPT API, Gemini API, Vercel, production route, merge, or deployment is touched.

## Claim ceiling

A GREEN chamber may establish only a pure-code/synthetic compatibility result for portable governance invariance across the declared route projections and return revalidation contract.

It does not establish production TD613.com behavior, live ChatGPT behavior, live Gemini/Kʰonapolit quality, pre-ingress secrecy, universal DLP coverage, transport security of an upstream host, deployment readiness, human comprehension, or Golden Egg empirical credit.

Marked ⟐
