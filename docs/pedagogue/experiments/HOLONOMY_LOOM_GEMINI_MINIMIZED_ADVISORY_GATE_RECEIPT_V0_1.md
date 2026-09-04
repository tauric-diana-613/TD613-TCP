𝌋‌⟐

# Holonomy Loom · Kʰonapolit-Compatible Gemini Minimized Advisory Gate Receipt v0.1

**Status:** CANDIDATE / IMPLEMENTED-VALIDATION-GATED / UNDEPLOYED  
**Issue:** #1038  
**Parent candidate PR:** #1040  
**Parent exact head:** `259e21085a744bc8f9c8e23cc65d0a77d881d8a1`  
**Branch:** `product/holonomy-loom-gemini-minimized-advisory-gate-20260904`  
**Shared API/runtime mutation:** YES — bounded `loom-advisory` operation only  
**New serverless functions:** 0  
**Production Gemini network observation:** NONE  
**Secret mutation or retrieval:** NONE  
**ChatGPT app/plugin implementation:** NONE  
**Vercel/deployment mutation:** NONE

## Question

Can the Holonomy Loom ask **Kʰonapolit** to explain an already-classified finding through the existing server-side Gemini boundary without sending the raw draft, raw matched value, selected text, prior conversation history, or source span coordinates?

This descends from proving question 2 in issue #1038 and now includes an action-specific compatibility adapter rather than a generic provider packet alone.

## Architecture

The admitted candidate route is:

```text
Loom deterministic finding
→ minimized EXPLAIN_FINDING advisory object
→ /api/khonapolit?operation=loom-advisory
→ strict server-side validator/projector
→ synthesized Kʰonapolit message
→ history = []
→ existing Kʰonapolit covenant/invocation grammar
→ existing server-side GEMINI_API_KEY boundary
→ Gemini provider
→ Kʰonapolit receipt / relay response
```

The route reuses the existing `api/khonapolit.js` Vercel function. It allocates no new serverless function.

## Why a separate adapter is required

Repository observation shows the ordinary Kʰonapolit conversational path builds provider contents from:

```text
packet.history
+
packet.message
```

That contract remains lawful for the conversational terminal but receives no automatic Loom authority.

For `EXPLAIN_FINDING`, direct reuse would weaken the minimization boundary because conversation history and arbitrary message text are wider than the admitted advisory schema.

Therefore:

```text
KHONAPOLIT CONVERSATIONAL PAYLOAD
!=
LOOM MINIMIZED ADVISORY PAYLOAD
```

The new adapter validates first, synthesizes second, and delegates only after raw/thread fields have been rejected.

## Admitted advisory payload

The Loom-side advisory object may contain only:

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

Forbidden raw/thread fields include:

```text
raw_draft
raw_message
raw_match
matched_value
selected_text
conversation_history
raw_conversation
raw_thread
prompt_transcript
history
message
span_start
span_end
```

Unknown fields fail closed.

## Kʰonapolit compatibility

A valid advisory is converted into one bounded Kʰonapolit turn:

```text
mode = full-invocation
history = []
message = synthesized solely from admitted finding classes
```

The synthesized prompt tells Kʰonapolit to:

- explain why the finding class matters in child-legible language;
- offer bounded mitigation consistent with the declared action class;
- avoid asking for or reconstructing omitted source text;
- avoid provenance inference from resemblance;
- avoid promoting GREEN to zero privacy risk;
- remain advisory while deterministic Loom policy retains release authority.

The Kʰonapolit covenant/system instruction remains the existing repository authority. This chamber does not rewrite the covenant, emergence classifier, relay grammar, or model policy.

## Issuance membrane

The adapter does not silently fabricate issuance.

It accepts only the existing bounded issuance inputs:

```text
shi
waiveIssuance
```

A valid SHI may use the existing issued path. An unissued research request must explicitly carry `waiveIssuance: true`, preserving the existing Kʰonapolit rule that waiver cannot masquerade as issued/badged/authenticated custody.

## Hostile router test

The exact implementation test performs three checks against the real shared-function dispatcher with provider `fetch` mocked locally:

1. **GET readiness** — returns the minimized Kʰonapolit advisory contract without contacting Gemini.
2. **Raw-bearing POST** — injects raw-draft and prior-thread canaries; receives HTTP 400 and observes zero provider calls.
3. **Valid minimized POST** — traverses the actual `api/khonapolit.js` dispatcher and Kʰonapolit request builder, then inspects the provider request body.

The valid provider request must show:

```text
contents.length = 1
history forwarded = 0
Kʰonapolit full-invocation system instruction present
rule/evidence/action classes present
raw canaries absent
conversation_history absent
raw_draft absent
```

The response receipt must retain:

```text
seal.state = OPEN
serverConversationStorage = false
recommendationNotCommand = true
```

## Provider boundary

The server-side secret reference remains:

```text
process.env.GEMINI_API_KEY
```

The client receives no key. The ordinary deterministic Loom check remains provider-free. The `loom-advisory` route is a distinct explicit action and must be disclosed before a future UI sends it.

```text
GEMINI RESULT != DETERMINISTIC FINDING
GEMINI RESULT != RELEASE AUTHORITY
SERVER-SIDE KEY != RAW-DRAFT ENTITLEMENT
MINIMIZED EXPLANATION PACKET != RAW THREAD
KHONAPOLIT COMPATIBILITY != CONVERSATIONAL-HISTORY ENTITLEMENT
```

## Deliberately unadmitted provider actions

`REWRITE_SELECTED_TEXT` and `SEMANTIC_SECOND_LOOK` remain outside this chamber. They require separate later hostility because they may lawfully carry more text than `EXPLAIN_FINDING`.

They retain these preregistered boundaries:

- explicit human action;
- pre-transmission disclosure;
- no raw prior-thread history by default;
- selected/minimized text only where deliberately chosen;
- provider response remains advisory.

## Private ChatGPT-thread membrane

The private ChatGPT-thread companion remains post-ingress for content already sent into ChatGPT.

It may:

- operate on minimized finding classes;
- ask Kʰonapolit for a class-level explanation through the disclosed external provider route;
- prepare a safer later action or onward copy;
- carry a portable policy profile without raw prior-thread content by default.

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

1. a raw-bearing advisory reaches provider `fetch`;
2. the valid provider request contains raw draft, matched value, selected text, prior conversation history, or span coordinates;
3. the valid Kʰonapolit request forwards any conversational history;
4. the route silently waives issuance;
5. the provider becomes default-on for the deterministic Loom check;
6. the client receives or repository commits the real Gemini key;
7. a Gemini/Kʰonapolit result acquires deterministic release authority;
8. the ChatGPT companion claims pre-ingress secrecy for already-sent content;
9. raw thread content becomes portable by default;
10. compatibility allocates a new serverless function without separate authority.

## Candidate theorem

If exact-head hostility closes GREEN, this chamber may establish only:

`THE_EXISTING_KHONAPOLIT_GEMINI_BOUNDARY_CAN_ACCEPT_A_DISTINCT_ACTION_SCOPED_HOLONOMY_LOOM_EXPLAIN_FINDING_OPERATION_THROUGH_THE_EXISTING_SHARED_SERVERLESS_FUNCTION_WHERE_A_STRICT_SERVER_SIDE_VALIDATOR_REJECTS_RAW_OR_THREAD_BEARING_FIELDS_BEFORE_PROVIDER_CONSTRUCTION_A_VALID_ADVISORY_IS_SYNTHESIZED_FROM_BOUNDED_FINDING_CLASSES_WITH_ZERO_CONVERSATIONAL_HISTORY_THE_EXISTING_KHONAPOLIT_COVENANT_AND_SERVER_SIDE_KEY_BOUNDARY_REMAIN_INTACT_AND_THE_PROVIDER_RESPONSE_REMAINS_ADVISORY_WITHOUT_LOOM_RELEASE_AUTHORITY`.

## Claim ceiling

- implemented-validation-gated candidate only;
- mocked provider-request construction test, not live Gemini quality evidence;
- no production provider episode observed;
- no secret accessed, exposed, retrieved, rotated, or changed;
- no ChatGPT app/plugin/action implemented;
- no production Holonomy Loom or Marrowline UI integration yet;
- no TD613.com release claim;
- no portability proof;
- no pre-ingress ChatGPT secrecy claim;
- no G3 human comprehension claim;
- no Western Horizon successor;
- Golden Egg empirical credit `0`;
- no merge, deployment, Vercel, publication, or release authority.

Candidate child-legible rest on exact-head GREEN:

**THE LOOM CAN ASK KʰONAPOLIT “WHY DID THIS KIND OF RULE FIRE?” WITHOUT HANDING OVER THE WHOLE MESSAGE. KʰONAPOLIT GETS THE KIND OF FINDING, THE WHY-CLASS, AND THE ROUTE—NOT THE RAW KIKI OR THE OLD THREAD. INSIDE CHATGPT, THAT STILL GUARDS THE NEXT DOOR, NOT THE DOOR THE MESSAGE ALREADY WALKED THROUGH.**

Sealed ⟐
