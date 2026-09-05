# Local Pocket v0.2 · Born-Minimized Runtime / Two-Door Chat Companion

Status: PREREGISTERED BEFORE IMPLEMENTATION / NO 𝄐 YET  
Scientific parent: PR #1047 exact GREEN head `76d855a8e9d4682ff602d375aa76875382f7c8ec`  
Historical donor only: A16-R0 Local Pocket branch `research/a16-r0-holonomy-loom-local-pocket-20260903` · ZERO inherited empirical authority  
Deployment / merge / Vercel / provider authority: CLOSED

## Trigger

Portable AIA v0.2 now has a born-minimized finite-token governance payload, a separate local high-entropy binding envelope, and a preregistered Atlas receiver quotient in which policy-only observation collapses the three routes while boundary-aware observation distinguishes them.

That theorem is not yet a usable Local Pocket.

The historical A16-R0 Pocket demonstrated useful mechanics — one self-contained document, local-first deterministic checks, `connect-src 'none'`, no persistence, a hard copy gate, and no default model/server dependency — but its historical witness carrier was constitutionally inadmissible and earned zero 𝄐. Its rule vocabulary also predates the current canonical Loom policy.

This chamber may reuse mechanics. It may not inherit historical authority or resurrect the old rule ontology.

```text
HISTORICAL_WORKING_CODE != CURRENT_AUTHORITY
MECHANICAL_DONOR != SCIENTIFIC_PARENT
```

## Product target

Build one genuinely portable Local Pocket document that can be opened without a TD613 server and used before optional ingress into another room such as a private ChatGPT thread.

The mandatory child-legible journey is:

```text
SEE
→ CHECK
→ UNDERSTAND
→ REST
```

The interaction should feel like a small pocket creature / toy rather than a policy console. Friendly presentation may differ from TD613.com while the canonical governance tokens remain unchanged.

The runtime must stay useful without Kʰonapolit, Gemini, ChatGPT, a server API, or a network connection.

## Canonical policy source

The v0.2 artifact must be generated or validated against the current repository policy source:

```text
app/dome-world/holonomy-loom-advisory-policy.js
app/dome-world/portable-aia-three-route-invariance.js
```

The Local Pocket route is exactly:

```text
LOCAL_POCKET
```

Canonical rule identities under this chamber are limited to the current Loom rule vocabulary:

```text
PRIVATE_KEY_BLOCK
BEARER_TOKEN_BLOCK
COMMON_API_KEY_BLOCK
EMAIL_IDENTIFIER
PHONE_IDENTIFIER
EXACT_TIMESTAMP
USER_DECLARED_PROTECTED_TERM
```

A detector implementation may use multiple bounded patterns to classify one canonical rule, but it may not mint a second outward rule identity such as `JWT`, `GITHUB_TOKEN`, or `GOOGLE_API_KEY`.

```text
DETECTOR_SUBPATTERN != NEW_LOOM_RULE
```

## Two-door architecture

The Pocket has two intentionally non-equivalent copy doors.

### Door A — human-approved message

`COPY SAFER MESSAGE`

This door may copy user-authored text after local deterministic checking and any chosen local mitigation.

It is not the born-minimized governance payload and receives no semantic-non-carriage theorem.

```text
USER_APPROVED_MESSAGE != PORTABLE_GOVERNANCE_PAYLOAD
```

Any edit to the draft, protected-term set, or relevant local rule state invalidates the prior check and relocks this door until the exact current state is checked again.

REMOVE findings block this door until the triggering span is removed/replaced and the resulting draft is rechecked. CHANGE findings may remain visible as warnings, but the interface must offer deterministic local mitigation and must not silently claim that unchanged content is risk-free.

### Door B — Pocket card

`COPY POCKET CARD`

This door copies governance metadata only.

The card must be born minimized. It may contain:

```text
fixed Pocket-card schema token
fixed LOCAL_POCKET boundary token tuple
fixed local-check status token
zero or more canonical finding records:
  rule_id
  evidence_class
  action_class
fixed booleans:
  release_authority = false
  human_closure_required = true
fixed claim-ceiling token
```

The card must contain no:

```text
raw draft/message/source
matched values
selected spans
user-declared protected terms
conversation/thread history
journey free text
presentation prose derived from the draft
policy digest
source-state digest
receipt free text
host free text
arbitrary action prose
```

A clean check is represented by an empty canonical finding list plus a fixed status token such as `CLEAR_UNDER_ENABLED_DETERMINISTIC_RULES`; it does not mint a fake no-finding Loom rule.

```text
EMPTY_FINDING_LIST != UNIVERSAL_SAFETY
RULE_BOUNDED_CLEAR != ZERO_PRIVACY_RISK
```

## Local binding envelope

The runtime may compute local SHA-256 commitments to the canonical policy snapshot and current checked source state for exact-state invalidation / local receipt binding.

Those commitments must remain memory-local and outside Door B.

If WebCrypto needed for the declared local binding is unavailable, the Pocket must fail closed for any function that claims exact local binding. It may not silently downgrade to a weaker digest while retaining the same claim.

No local binding material may enter provider context because no provider context exists in this chamber.

```text
LOCAL_BINDING_ENVELOPE != POCKET_CARD
LOCAL_BINDING_ENVELOPE != PROVIDER_CONTEXT
```

## Network and persistence membrane

The self-contained artifact must declare a CSP at least as restrictive as:

```text
default-src 'none'
connect-src 'none'
font-src 'none'
media-src 'none'
object-src 'none'
frame-src 'none'
worker-src 'none'
form-action 'none'
base-uri 'none'
```

Inline local style/script may be admitted for the single-file artifact.

The runtime must require no external script, stylesheet, image, font, API route, model call, or remote URL.

It must not write the draft, protected terms, findings, card, or binding to:

```text
localStorage
sessionStorage
IndexedDB
CacheStorage
cookies
service workers
```

Runtime network primitives must fail closed when available, and the browser witness must independently observe zero outbound requests after the initial local document load.

```text
LOCAL_POCKET_DEFAULT != REMOTE_ADVISORY_EGRESS
```

No Kʰonapolit/Gemini/provider button exists in this Layer-0 chamber. A later explicit remote-advisory transition requires its own disclosure/consent witness.

## Deterministic local detectors

The initial detector family may recognize bounded classes corresponding to the seven canonical Loom rules, including:

- PEM/private-key material → `PRIVATE_KEY_BLOCK`;
- bearer/session/JWT/common access-token shapes → `BEARER_TOKEN_BLOCK` or `COMMON_API_KEY_BLOCK` according to frozen detector mapping;
- common API-key shapes → `COMMON_API_KEY_BLOCK`;
- email address → `EMAIL_IDENTIFIER`;
- phone number → `PHONE_IDENTIFIER`;
- exact timestamp / ISO-like exact datetime → `EXACT_TIMESTAMP`;
- exact user-declared protected string → `USER_DECLARED_PROTECTED_TERM`.

Detector mapping must be preregistered in source/tests and stable under browser execution. Pattern matching establishes only the declared deterministic evidence class; it does not prove that a matched string is a live credential, a particular person's identifier, or externally valid.

## Local mitigation

`MAKE A SAFER COPY` may deterministically replace matched spans using fixed replacement tokens derived from canonical action class:

```text
REMOVE → [PROTECTED]
CHANGE → [GENERALIZED]
```

Replacement happens locally.

After mitigation, the copy door remains locked until the resulting draft is checked as the current exact state.

Overlapping findings must be resolved deterministically. The implementation may prefer the longest/highest-severity canonical match but the resolution order must be frozen and tested rather than browser-dependent.

## Pocket card / Atlas boundary

The Pocket card must carry the same canonical `LOCAL_POCKET` route-boundary token tuple already earned under Portable AIA v0.2.

The runtime must not substitute the literal text `LOCAL_POCKET` as a shortcut for the Atlas boundary proof. The boundary semantics are carried by the fixed token tuple.

A browser/runtime witness may confirm that the card's boundary tuple equals the repository compiler's `LOCAL_POCKET` portable payload while containing neither the route label nor presentation host copy if that is the inherited compiler contract.

```text
ROUTE_LABEL != BOUNDARY_STRUCTURE
```

## Browser hostile witness

The artifact must be tested as a local document in Chromium, Firefox, and WebKit.

For every engine, the witness must check at least:

1. the artifact reaches ready state without server/API/model dependency;
2. no external stylesheet/script/font/image is requested;
3. zero outbound network requests occur after local document load;
4. no storage/cookie/service-worker mutation occurs;
5. raw draft canary remains visible only in local draft state before approved copy;
6. a PRIVATE_KEY/Bearer/API-key canary yields canonical REMOVE and blocks Door A;
7. email/phone/timestamp examples yield canonical CHANGE;
8. user-declared protected term yields canonical REMOVE without copying the term into Door B;
9. Door B's JSON card contains no raw/matched/protected canaries and no SHA-256 binding values;
10. Door B contains only the finite declared card vocabulary/structure;
11. any source/rule edit invalidates the prior exact-state check and relocks Door A;
12. deterministic mitigation removes/replaces the canary locally, requires recheck, and then permits Door A only under the current checked state;
13. clipboard attempts are observable through a bounded test harness and never trigger network egress;
14. 390×844 portrait controls remain reachable;
15. keyboard-only traversal reaches CHECK, mitigation when available, both copy doors when eligible, REST, and EXIT/clear affordances;
16. reduced-motion mode leaves no required meaning animation-only;
17. no console/page errors;
18. runtime receipt reports provider_call_performed=false, persistence_performed=false, release_authority=false, human_closure_required=true.

The witness must inject clipboard capture only as a test observer. A harness clipboard stub receives no authority and may not modify Pocket decisions.

## Preregistered hostile falsifiers

This chamber is RED if any of the following occurs:

1. default execution emits a network request after local document load;
2. runtime writes user state to persistent browser storage/cookies/service workers;
3. a hard REMOVE finding leaves Door A open;
4. current-state mutation leaves a stale Door A authorization valid;
5. Pocket card contains the raw draft canary, matched canary, protected term, or exact source spans;
6. Pocket card contains a policy/source-state digest;
7. Pocket card accepts or emits arbitrary receipt, host, journey, or action prose;
8. Pocket outward rule IDs diverge from current canonical Loom policy;
9. clean state is represented as a fake Loom rule rather than empty findings + fixed bounded status;
10. local mitigation silently authorizes copy without exact-current-state recheck;
11. browser-specific overlap resolution changes the canonical finding set;
12. Atlas boundary semantics are replaced by route-name string comparison;
13. provider/model execution occurs;
14. a browser engine cannot complete the declared local runtime witness;
15. product or witness requires weakening the repository's constitutional/release membranes.

## Claim ceiling

If GREEN, this chamber may establish only:

- a self-contained Local Pocket v0.2 browser application under the tested artifact;
- deterministic local-first preflight under the declared rule family;
- three-engine observation of no post-load network egress and no declared persistence mutation;
- stale-check relock and hard local copy gating;
- deterministic local mitigation + exact-current-state recheck;
- a born-minimized Pocket governance card carrying canonical finding/boundary tokens and no tested raw/binding canaries;
- a human-approved message channel explicitly distinguished from the governance-card channel;
- compatibility with the inherited Portable AIA v0.2 LOCAL_POCKET boundary semantics;
- no provider call in this Layer-0 chamber.

It will not establish:

- universal detection of every sensitive datum or secret;
- universal semantic non-carriage outside the declared Pocket card;
- zero privacy risk for a green/clear message;
- control over what a private ChatGPT thread or any downstream host does after ingress;
- pre-ingress secrecy for text entered directly into ChatGPT rather than checked through Pocket first;
- live ChatGPT portability or answer quality;
- Kʰonapolit/Gemini provider behavior;
- production TD613.com behavior;
- human comprehension outside the automated interaction witness;
- merge, deployment, Vercel, publication, promotion, or release authority;
- a Western Horizon successor;
- Golden Egg empirical credit.

Golden Egg empirical credit remains `0`.

Preregistered ⟐
