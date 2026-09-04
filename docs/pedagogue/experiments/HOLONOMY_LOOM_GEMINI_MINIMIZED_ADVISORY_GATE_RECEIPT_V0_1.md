𝌋‌⟐

# Holonomy Loom · Gemini Minimized Advisory Projection Gate Receipt v0.1

**Status:** CANDIDATE / DESIGN-GATE ONLY / PROVIDER CALL ABSENT  
**Issue:** #1038  
**Parent candidate PR:** #1040  
**Parent exact head:** `259e21085a744bc8f9c8e23cc65d0a77d881d8a1`  
**Branch:** `product/holonomy-loom-gemini-minimized-advisory-gate-20260904`  
**Product integration:** NONE  
**Gemini network call:** NONE  
**Secret mutation or retrieval:** NONE  
**ChatGPT app/plugin implementation:** NONE  
**Vercel/deployment mutation:** NONE

## Question

Can the Holonomy Loom construct the preferred `EXPLAIN_FINDING` Gemini advisory request from bounded finding classes without sending the raw draft, raw matched value, selected text, prior conversation history, or source span coordinates?

This is the second proving question already recorded in issue #1038. It remains a design-gate question rather than a provider-quality or production question.

## Hostile projection method

The test creates a synthetic finding that deliberately contains:

- a raw-draft canary;
- a raw matched-value canary;
- prior raw conversation text;
- source span coordinates;
- deterministic rule ID;
- evidence class;
- action class;
- bounded finding category;
- bounded why-class.

The projection function is permitted to emit only:

```text
schema
action
rule_id
evidence_class
action_class
minimized_context
claim_ceiling
```

where `minimized_context` is restricted to:

```text
finding_category
why_class
route_mode
```

The exact hostile canaries, prior raw turn, and span fields must be absent from the serialized provider packet.

## Provider boundary

The design preserves the existing server-side secret reference:

```text
process.env.GEMINI_API_KEY
```

The client receives no key. The deterministic Loom check invokes no provider by default. `EXPLAIN_FINDING` requires an explicit human action and visible provider disclosure before any future transmission.

The packet purpose is bounded:

> Explain why the already-classified finding matters and describe bounded mitigation options without reconstructing or requesting the source text.

The provider result remains advisory.

```text
GEMINI RESULT != DETERMINISTIC FINDING
GEMINI RESULT != RELEASE AUTHORITY
SERVER-SIDE KEY != RAW-DRAFT ENTITLEMENT
MINIMIZED EXPLANATION PACKET != RAW THREAD
```

## Deliberately unadmitted actions

`REWRITE_SELECTED_TEXT` and `SEMANTIC_SECOND_LOOK` remain outside this chamber. Their contracts preserve:

- explicit human action;
- pre-transmission disclosure;
- no raw prior-thread history by default;
- selected/minimized text only where the user deliberately chooses a rewrite route;
- no deterministic release authority for a provider response.

A later chamber must test those routes separately rather than borrowing credit from `EXPLAIN_FINDING`.

## Private ChatGPT-thread membrane

The same policy keeps the private ChatGPT-thread companion post-ingress for content already sent into ChatGPT.

It may:

- operate on minimized finding classes;
- prepare a safer later action or onward copy;
- carry a portable policy profile without raw prior-thread content by default;
- disclose any external provider route before invoking it.

It may not claim that an in-thread companion prevented ChatGPT from receiving content already sent into the conversation.

```text
PRIVATE CHATGPT THREAD != OFFLINE CUSTODY
IN-THREAD CONTROL != PRE-INGRESS SECRECY
ONWARD RELEASE CONTROL != PLATFORM-WIDE PRIVACY CONTROL
```

## Portable policy profile

Default portable material remains policy-shaped rather than conversation-shaped:

```text
rule_ids
policy_severity
declared_route_labels
receipt_schema_version
claim_ceiling
optional_local_commitment
```

Raw conversation/thread content remains excluded by default.

## Falsifiers

The candidate must RED if any of these occur:

1. the projected `EXPLAIN_FINDING` packet contains the raw-draft canary;
2. it contains the matched-value canary;
3. it contains prior raw conversation text;
4. it contains selected text or source span coordinates;
5. the provider becomes default-on;
6. the key is described as client-visible or repository-committed;
7. a Gemini result acquires deterministic release authority;
8. the ChatGPT companion claims pre-ingress secrecy for already-sent content;
9. raw thread content becomes portable by default.

## Candidate theorem

If exact-head hostility closes GREEN, this chamber may establish only:

`A_MINIMIZED_EXPLAIN_FINDING_PROVIDER_PACKET_CAN_BE_EXECUTABLY_PROJECTED_FROM_BOUNDED_LOOM_FINDING_CLASSES_WHILE_EXCLUDING_A_HOSTILE_RAW_DRAFT_CANARY_RAW_MATCH_CANARY_PRIOR_CONVERSATION_TEXT_SELECTED_TEXT_AND_SOURCE_SPANS_AND_WHILE_PRESERVING_EXPLICIT_PROVIDER_DISCLOSURE_SERVER_SIDE_KEY_REFERENCE_ADVISORY_ONLY_PROVIDER_AUTHORITY_AND_THE_POST_INGRESS_CHATGPT_THREAD_BOUNDARY`.

## Claim ceiling

- design-gate projection only;
- no Gemini request transmitted;
- no Gemini response quality observed;
- no Gemini endpoint implemented or changed;
- no secret accessed, exposed, retrieved, rotated, or changed;
- no ChatGPT app/plugin/action implemented;
- no production Holonomy Loom implementation;
- no TD613.com release claim;
- no portability proof;
- no pre-ingress ChatGPT secrecy claim;
- no G3 human comprehension claim;
- no Western Horizon successor;
- Golden Egg empirical credit `0`;
- no merge, deployment, Vercel, publication, or release authority.

Candidate child-legible rest on exact-head GREEN:

**ASKING GEMINI WHY A RULE FIRED SHOULD NOT REQUIRE HANDING GEMINI THE WHOLE MESSAGE. THE LOOM CAN SEND THE KIND OF FINDING, WHY-CLASS, AND ROUTE MODE WHILE KEEPING THE RAW KIKI OUT OF THAT EXPLANATION PACKET. INSIDE CHATGPT, THAT STILL GUARDS THE NEXT DOOR—NOT THE DOOR THE MESSAGE ALREADY WALKED THROUGH.**

Sealed ⟐
