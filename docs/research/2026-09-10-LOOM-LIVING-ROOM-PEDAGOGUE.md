# 𝌋 Loom living request room — Pedagogue design contract

Status: declared implementation contract, pending candidate browser witnesses. Source inspection base: `847a29e520d701c677341e6bdded1c8d7f70f813`. This review follows `AGENTS.md`, `DOLLHOUSE.md` and `PEDAGOGUE.md`. The operator requests an expressive live room whose animation explains the chosen AI task and its governed route.

## The concrete design

Build a small inhabited workroom with three persistent places. A visitor should recognize where the papers are, which ones travel, and where the answer returns before learning a technical term. Warm paper cards, rounded shelves, ribbon-bound parcels and a receiver lantern can bring the requested playful character. Their positions carry information; their charm must support that information.

| Place | Visible object | Consequence | Exact source |
| --- | --- | --- | --- |
| Your pocket | Selected paper cards beside a separate gold-lined private shelf | These papers can travel; these stay here | Current selected IDs and local-only count |
| Rule gate | A ribbon binding the outgoing task parcel; a door that can hold | The task and rules travel together; a changed or rejected binding stops this route | Local governor authorization and input binding |
| AI desk | Receiver lantern, waiting posture, then returning answer tray | Waiting for a reply; reply arrived; checking; ready for review | Client submission, observed response, deterministic admission |

The same room must visibly belong to the selected project. Show the project title, actual selected/local counts, and recognizable bounded paper props. Private content must never enter SVG text, titles, new receipts or provider envelopes merely to decorate the private shelf. Public demo labels may be used; own-document visual labels should use counts or generic paper labels unless an existing local display already exposes the filename.

## Phase choreography and copy

| Event | Child-facing sentence | Movement | Static equivalent |
| --- | --- | --- | --- |
| Project selected | “Your work is ready here.” | Selected cards gather beside the parcel; private shelf remains separate | Cards, counts and project title |
| Local checks running | “Checking what can travel.” | Gate inspects the local parcel, staying on the local side | “Checking” at gate |
| Binding admitted | “Your task and rules are joined.” | Ribbon closes around the same selected parcel | Bound ribbon and explicit binding state |
| Client submission | “Your request has started.” | One directional outgoing gesture; keep the origin strand attached | Submitted route plus timestamp |
| Awaiting response | “Waiting for a reply.” | Receiver lantern or waiting ring breathes around a stationary submitted parcel | Waiting label and measured elapsed time |
| Response observed | “A reply arrived. Checking it now.” | Return parcel approaches the checking tray, still closed | Reply received / under review |
| Result admitted | “Your answer is ready to look at.” | Answer tray opens; source-reference links and reported questions appear | Ready-to-review tray, actual source references and questions |
| Held before submission | “This task stayed here.” | Gate stops local parcel | Local hold reason; no outgoing route |
| Waiting stopped after submission | “Waiting stopped. The request already left.” | Waiting motion settles; submitted strand persists | Submission history plus stop reason |
| Returned candidate held | “A reply came back. It needs attention.” | Return remains at the checking gate; usable-answer tray stays closed | Observed return plus exact hold reason |
| Visual rest | “The room is still. Your route stays visible.” | Every unnecessary render loop stops | The identical current route, cards and receipt |

The distinction between client submission and provider receipt is essential. A successful local `fetch` invocation establishes a client attempt; the pending phase supplies no independent observation that the provider has read, reasoned about or retained the packet. Waiting animation must never manufacture that stage. Avoid a percentage, invented processing stages, a typing mind, or a parcel repeatedly crossing the gate as if additional requests were occurring.

Likewise, an HTTP-success response may still fail local admission. Returned and admitted require visibly different places. A completed room can show the answer for human review without representing automatic external release.

## Expressive Flow-Core grammar

Glyphs attach to relations already present in the event; they never command an invented ontology. `à` can accompany selected papers gathering. `cōl` can accompany the retained local shelf. `出` requires a specifically identified real boundary event: observed client submission or admitted local presentation; its caption must identify which. `𝄐` marks actual settled relation with provenance retained. `米` needs recorded recurrence; a repeating waiting loop supplies no recurrence evidence. Thermal or moiré ambiance may express declared visual posture, but must not be labeled a measured provider thermal field.

Use the existing `AnimationCoordinator` as the only animation owner. A render consumes one event snapshot. Subordinate passes may place paper cards, gate ribbon, lantern, strands and answer tray. A slow background can coexist with these passes when it remains within the same owner and stops for hidden/rest/reduced-motion conditions. Avoid introducing independent perpetual CSS/RAF clocks to achieve a busier room.

## Integration implications discovered in source

At the inspected base, `project('held', ...)` emits a fresh event without retaining `outbound_submitted` or `response_received`. The old request-field projector can consequently lose already-observed history. The new room must conserve these facts per request: a held request before send, an interrupted wait after send, and a rejected observed return have different histories.

Local authorization is available immediately after `taskGovernor.authorize(shared)` succeeds. Bind the ribbon to that result, not the earlier checking animation. The completed packet already carries `aia.input_digest` and the admission record. Optional visual inspection can reference the bound digest without repeating document contents.

Reported `used_document_ids` and `missing_information` arrive with the structured return. Their marks must appear only then, under a reported-evidence label. Unreferenced selected documents should stay visibly distinct from claimed references; neither absence nor a reported reference establishes the provider's hidden internal use.

## Acceptance and falsifiers

The new fixture `tests/fixtures/pedagogue/loom-living-room-design.json` preserves equal neutral burden inputs between candidate and baseline. Its PASS compiles the declared consequence route; it supplies neither a fabricated child-comprehension score nor an empirical product win.

Candidate witnesses should exercise:

1. All three existing demos: changing selection changes actual task/source state with zero automatic requests.
2. A pending request: only one submission, private shelf stationary, elapsed waiting visible, no generated delivery/reading claim.
3. An admitted result: source references and reported questions appear from actual returned fields, and the answer becomes inspectable.
4. Holds on both sides of submission and after observed return: historical facts persist and no success tray or release gesture appears prematurely.
5. Plain/auditor switches: same selected scope, request facts and admissible operations beneath different copy.
6. Reduced motion, explicit stillness and hidden view: identical semantics, canceled unnecessary cadence, usable controls.
7. Replay: scrubbing an observed event changes the presentation only; no new provider request, admission, export or overwritten live state. The replay label identifies its historical event and live return remains available. Editing task/rules/selection refreshes the prepared projection and invalidates old runnable output.
8. Narrow mobile screen: three places remain understandable without compressed microtext; vertical stacking is preferable to a clipped miniature diagram.

Browser screenshots demonstrate rendered behavior on a declared machine route. Actual provider calls demonstrate the specific observed request and result. Human comprehension remains a separate empirical question requiring people to use the product.

## Handoff

Pedagogue owns this consequence contract and fixture. Aperture audits the observation geometry and implements bounded visual primitives. Atlas checks presentation changes against the invariant control plane. FADT checks preserved support and history through hold, rest and erasure. These roles remain distinct; none acquires release authority from its own review.

Gate result: PASS with preserved AIA invariants, preserved rest/exit, and all four burden deltas equal to zero. Command: `node scripts/run-pedagogue-design-gate.mjs tests/fixtures/pedagogue/loom-living-room-design.json`. Browser and live-provider witnesses remain separately pending in the implementation PR.

No shared Pedagogue engine promotion is warranted yet. The reusable candidate is a persistent-place visual grammar that conserves monotonic request history. Promote only after independent proving cases and targeted falsifiers establish its generality.

Sealed ⟐
