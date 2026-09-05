# Marrowline Pocket → TD613 Hosted Carry Case · Preregistration

**Scientific parent:** PR #1048 exact earned head `ce2743617956abefd438ac64b8c704824a588761`  
**Status:** PREREGISTERED BEFORE IMPLEMENTATION  
**Merge / deployment / Vercel / live-provider authority:** CLOSED  
**Seal:** ⟐

## Question

Can a born-minimized Local Pocket packet cross a Marrowline route boundary into a TD613-hosted AIA realization without:

1. carrying the checked message itself;
2. carrying Pocket-local digests or local binding;
3. silently collapsing Pocket ancestry into Hosted identity;
4. accepting arbitrary free-text transport metadata;
5. widening release / deployment / provider authority; or
6. trusting a hosted/model return without Pocket-side revalidation?

## Preregistered route

```text
LOCAL_POCKET
  checked draft stays local unless the human separately copies it
  |
  | COPY POCKET PACKET
  v
MARROWLINE CARRY CASE
  validate finite canonical packet
  preserve canonical source-boundary ancestry
  derive target boundary from TD613_HOSTED policy
  |
  v
TD613_HOSTED AIA PROJECTION
  consequence / policy finding becomes legible
  packet is still not the message
  release authority remains false
  |
  | optional advisory candidate
  v
MARROWLINE RETURN ENVELOPE
  canonical action token only
  |
  v
LOCAL_POCKET RETAINED LOCAL BINDING
  REVALIDATE
  ├── canonical match    → PRESENT_TO_HUMAN
  └── canonical mismatch → HOLD
```

## Canonical carry-case input

The carry-case importer may accept only the Local Pocket export shape:

```text
schema = td613.holonomy-loom.local-pocket-export/v0.2-born-minimized
portable_findings = finite array of portable AIA payload objects
release_authority = false
human_closure_required = true
```

It must reject unknown top-level fields.

Every finding must independently pass the existing portable payload vocabulary audit and must carry the exact canonical `LOCAL_POCKET` route-boundary tuple:

```text
execution_posture      = LOCAL_PREFLIGHT
source_ingress_position = BEFORE_OPTIONAL_REMOTE_INGRESS
advisory_transition    = EXPLICIT_REMOTE_TRANSITION_REQUIRED
```

No route label string is required inside the incoming portable finding.

## Forbidden carriers

The importer / receipt / return route must reject or omit:

```text
raw draft
checked text
raw message
matched values
selected spans
user protected values
conversation history
prompt transcript
policy digest
source-state digest
local binding object
receipt text / arbitrary receipt id
free-form journey label
free-form source host
free-form target host
free-form explanation
```

A finite canonical transport receipt is allowed only if every string belongs to a preregistered token vocabulary.

## Canonical transport receipt

Expected machine-level receipt fields:

```text
schema
source_boundary_token
transport_action_token
arrival_boundary_token
finding_rule_ids
finding_count
release_authority = false
human_closure_required = true
raw_message_carried = false
local_binding_carried = false
provider_call_performed = false
production_mutation = false
```

The exact token vocabulary must be frozen in source before browser observation.

## Atlas receiver assay

The Carry Case must earn a non-trivial distinguishability result.

### Receiver R_policy

Reads only canonical policy invariant per finding.

Preregistered prediction:

```text
Pocket source projection
Hosted arrival projection
→ SAME policy class
```

### Receiver R_boundary

Reads only canonical route-boundary tokens.

Preregistered prediction:

```text
Pocket source projection
Hosted arrival projection
→ DIFFERENT boundary classes
```

The key may not read:

```text
route_mode
presentation.host
human-facing room name
free-text journey label
raw message
```

Therefore:

```text
POLICY_EQUIVALENCE != BOUNDARY_EQUIVALENCE
PORTABLE_MINIMIZATION != ROUTE_ANCESTRY_ERASURE
```

## Pedagogue presentation hypothesis

A person should be able to understand the handoff without reading the machine receipt first.

Preregistered child-legible sequence:

```text
PACKED IN POCKET
→ CHECKED AT MARROWLINE
→ OPENED IN TD613
→ 𝄐 REST / RETURN
```

Suggested Playhouse object: **Marrowline Carry Case**.

The visible explanation must say plainly:

- the suitcase carries the governance packet, not the message;
- the message moves only through the separate human-controlled checked-text door;
- Pocket and Hosted are different rooms;
- coming home does not trust the return automatically;
- the human keeps the final key.

No score, streak, rank, urgency reward, or automatic route choice.

## Return-trip assay

For each imported canonical finding:

1. construct the Hosted projection from canonical `rule_id` only;
2. create a return candidate using an enumerated canonical action class;
3. verify a matching action remains `PRESENT_TO_HUMAN`, never release;
4. verify a mismatching action becomes `HOLD`;
5. require the retained Pocket local binding for revalidation;
6. verify mismatched binding / route / rule fails closed;
7. verify the local binding never enters the carry-case payload or hosted transport receipt.

## Hostile cases

The chamber must fail closed on at least:

- unknown Pocket packet top-level field;
- wrong packet schema;
- non-array findings;
- unknown finding field;
- altered rule token;
- altered action/evidence token;
- altered source route-boundary token;
- route label smuggled into payload;
- digest-like carrier anywhere in transport payload;
- local binding injected into transport;
- raw/matched/selected/conversation field injection;
- arbitrary host/journey prose;
- duplicated or malformed finding;
- return candidate with unsupported action;
- revalidation with a binding for another route or rule.

## Browser witness requirement

If the source/static chamber survives, the child-legible Carry Case surface must be observed in Chromium / Firefox / WebKit under the existing exact-source custody path.

Browser observation must include:

- valid Pocket packet import;
- visible four-beat Carry Case route;
- canonical source/arrival distinction;
- no raw-message field or free-text transport input;
- matching return → PRESENT_TO_HUMAN;
- mismatching return → HOLD;
- 390×844 mobile + reduced motion;
- Rest / Return / Exit;
- no provider call;
- no production mutation;
- no deployment authority.

## Claim ceiling

Even a fully GREEN chamber would establish only a bounded local/synthetic Pocket→Marrowline→Hosted transport and return-revalidation contract under the tested fixtures.

It would not establish:

- production TD613.com behavior;
- deployed-source parity;
- live ChatGPT behavior;
- ChatGPT pre-ingress secrecy;
- live Gemini/Kʰonapolit quality;
- universal privacy;
- Vercel/deployment/merge/release authority;
- Western Horizon reopening;
- Golden Egg empirical credit.

Marked ⟐
