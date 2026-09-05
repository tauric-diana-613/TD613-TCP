# Portable AIA v0.2 · Born-Minimized Payload / Local Envelope × Atlas Route Quotient

Status: PREREGISTERED BEFORE IMPLEMENTATION / NO 𝄐 YET  
Scientific parent: PR #1046 head `fa5988a9b2c5a9250eb4b876663da6a1140fbe05`  
Prior portable chamber: PR #1044 / v0.1 three-route governance invariance  
Deployment / merge / Vercel / provider authority: CLOSED

## Trigger

Post-earn review of portable AIA v0.1 found that a field allowlist did not eliminate every discretionary semantic carrier.

The v0.1 projection admitted caller-controlled `receiptId`; the return candidate admitted caller-controlled `sourceHost`; and `claimedActionClass` was uppercased but not restricted to the finite canonical Loom action alphabet.

The v0.1 governance-invariance theorem remains boundedly valid. The broader phrase `raw/free-text carrier rejection` requires sharpening.

```text
FIELD_ALLOWLIST != SEMANTIC_NON_CARRIAGE
BOUNDED_STRING != CANONICAL_TOKEN
MINIMIZED_SHAPE != MINIMIZED_CONTENT
```

A second issue remains even after closing those three text fields: caller-supplied digest slots are high-entropy commitments. A digest may be legitimate local custody material while still carrying information. Therefore v0.2 must not pretend that a syntactically valid digest is a zero-information channel.

```text
OPAQUE_DIGEST != ZERO_INFORMATION_CHANNEL
LOCAL_BINDING_MATERIAL != PORTABLE_PAYLOAD
```

## Preregistered architecture

v0.2 separates two objects that v0.1 partially co-located.

### A. Portable payload

May contain only finite canonical tokens and fixed booleans derived from admitted Loom policy and declared route mode.

Expected token surfaces:

```text
policy_schema_token
rule_id
evidence_class
action_class
route_boundary_tokens
release_authority = false
human_closure_required = true
```

The portable payload must contain no:

```text
raw source/draft/message/thread/history
selected or matched text
prompt transcript
caller-supplied receipt text
caller-supplied source-host text
caller-supplied arbitrary action prose
policy digest
source-state digest
```

Human-readable presentation copy may remain a local projection surface because it is code-derived finite copy, not source-derived free text. It is not part of the portable payload alphabet under test.

### B. Local binding envelope

May retain bounded local commitments needed for custody/revalidation:

```text
policy_digest
source_state_digest
canonical rule identity
canonical route identity
```

The local binding envelope is explicitly non-portable in this chamber.

```text
LOCAL_BINDING_ENVELOPE != PORTABLE_PAYLOAD
LOCAL_CUSTODY_BINDING != PROVIDER_CONTEXT
```

No theorem in this chamber establishes that arbitrary digests are harmless, source-free, or independent of the underlying state. The narrower claim is that those high-entropy commitments do not occupy the portable payload under the declared compiler.

## Return-trip hardening

The return candidate must accept only a finite canonical action token already present in the Loom rule vocabulary.

`source_host` must be derived from the original projection route and may not be supplied by the returning host/model.

The return candidate remains:

```text
trusted = false
release_authority = false
must_revalidate = true
```

Matching canonical action may become `PRESENT_TO_HUMAN`; mismatch remains `HOLD`.

```text
ENUMERATED_RETURN_TOKEN != TRUST_TRANSFER
MATCHING_ACTION != RELEASE_AUTHORITY
```

## Atlas receiver assay

Atlas must not win by reading the route label directly.

The same three declared route modes remain:

```text
TD613_HOSTED
LOCAL_POCKET
CHATGPT_THREAD_COMPANION
```

The portable compiler derives finite route-boundary tokens for each mode. Atlas evaluates at least two declared receiver maps.

### Receiver R_policy

Observes the governance invariant while excluding route label, host copy, and route-boundary tokens.

Preregistered prediction:

```text
input routes = 3
quotient classes = 1
```

Reason: the same rule and governance law are intentionally preserved across routes.

### Receiver R_boundary

Observes only the canonical route-boundary token tuple. It must not use `route_mode`, presentation host text, or raw source material as its distinguishing key.

Preregistered prediction:

```text
input routes = 3
quotient classes = 3
```

This is the target route-distinguishability result.

```text
POLICY_EQUIVALENCE != BOUNDARY_EQUIVALENCE
ROUTE_LABEL_PRESERVED != ROUTE_STRUCTURE_IDENTIFIABLE
RECEIVER_QUOTIENT_DEPENDS_ON_DECLARED_APERTURE
```

A failed result is admissible. If `R_boundary` collapses required route distinctions, the chamber remains RED until diagnosed; the receiver definition must not be widened post hoc merely to force three classes.

## Hostile tests

The implementation must fail closed when:

1. `receiptId` or aliases are supplied to portable projection input;
2. a return candidate supplies `sourceHost` or aliases;
3. `claimedActionClass` contains anything outside the finite canonical Loom action vocabulary;
4. raw/free-text carrier aliases are supplied;
5. unsupported route modes or rule IDs are supplied;
6. the portable payload contains policy/source-state digests;
7. the portable payload contains fields outside the declared finite alphabet;
8. `R_policy` does not collapse to exactly one class;
9. `R_boundary` does not yield exactly three classes;
10. the Atlas boundary key depends directly on `route_mode` or presentation host copy;
11. return revalidation widens trust or release authority.

## Claim ceiling

If GREEN, this chamber may establish only:

- a pure-code born-minimized portable-payload contract;
- separation of local high-entropy binding material from the declared portable payload;
- closure of the three identified discretionary string channels;
- finite canonical return-action vocabulary;
- a receiver-indexed Atlas quotient in which policy-only observation collapses the routes and boundary-aware observation distinguishes them;
- descendant browser non-regression if the repository classifier runs those inherited lanes.

It will not establish:

- implemented Local Pocket application behavior;
- live ChatGPT or Gemini portability;
- pre-ingress secrecy in an upstream host;
- universal semantic non-carriage outside the declared payload compiler;
- harmlessness or provenance of arbitrary digests;
- external physical geometry or causal order from an Atlas quotient;
- production TD613.com behavior;
- human comprehension;
- merge, deployment, Vercel, publication, promotion, or release authority;
- a Western Horizon successor;
- Golden Egg empirical credit.

Golden Egg empirical credit remains `0`.

Preregistered ⟐
