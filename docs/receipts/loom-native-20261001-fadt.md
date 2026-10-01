# Native Marrowline passage · FADT finding · 2026-10-01

The operator explicitly requested four active-session Dollhouse agents under the current #737 task. This finding grants no authority of its own. Base source: `c3d403bf1c0ecf90d434f352a041ddffbcee6c3f`; final candidate checks remain the integrating agent's responsibility.

**Finding:** ordinary Marrowline presentation may carry every Loom phase while the controller retains stage, admission and current-head conditioning. Removing the composer membrane is presentation compression. Erasing those distinctions from the custody controller would be unlawful support compression.

The supplied finite fixture contains eleven occupied declarations, including ARRIVED, AIA_STAGED, AIA_SENT, FILES_STAGED, CONTINUING and DONE, plus held activation, held follow-up, stale admitted continuation, malformed transfer and ordinary entry. It is a caller-declared model of requirements, not authenticated runtime evidence. The exact JSON findings are adjacent in `loom-native-20261001-fadt.json`.

| Retained conditioning | Result | Exact gap |
| --- | --- | --- |
| Stage, admission, head | CONSISTENT_DECLARATIONS | Empty on every occupied fibre |
| Native presentation only | HOLD | EXPORT_CURRENT, SEND_AIA, SEND_FILES, SEND_FOLLOWUP, SEND_ORDINARY, STAGE_AIA, STAGE_FILES, STOP |
| Stage and admission, erasing head | HOLD | The DONE/ADMITTED fibre loses EXPORT_CURRENT and SEND_FOLLOWUP distinction between current and historic results |

In the native-presentation-only fibre, the largest universally sound support is `{EXIT, REST}`. Union would admit actions in states where they are prohibited; intersection would omit the lawful continuation. Neither constitutes exact repair. Retaining distinguishing controller coordinates avoids the gap without forcing that ontology into the composer.

The historical FADT theorem remains separately pinned in FADT.md and the lineage archive; this bounded adapter does not promote its research branch, authenticate declared supports or supply a universal information-loss result. The controller and Gate do not establish global latest state merely because local predecessor references agree. Remote Neon custody remains responsible for authenticated head/CAS checks at dispatch.

Two concrete implementation defects were found and addressed within this repair:

- The earlier custom submit path acquired `busy` only after asynchronous cryptographic binding, allowing rapid tap/Enter races. Native terminal now acquires one synchronous request lock before preparation; the controller also acquires its own lock before the first crypto await.
- The public `exportPacket` function could return an old admitted binding after leaving or expiring, despite the button's expiry check. Button and public API now share the same active/DONE/unexpired/not-busy guard. A held follow-up continues to retain the previous admitted export; the held candidate earns no replacement authority.

Meaningful synthetic regressions exercise the real native terminal plus actual Loom controller with a deliberately blocked SHA-256 preparation. Rapid second submission creates no second user turn. Stop before dispatch preserves the staged AIA and sends no network request. Leave and expiry during preparation cannot dispatch or unlock export; the native Send control recovers. Separate contract regressions reject ordinary, held, unsupported-source and wrong-turn answers, and bind retry to the actually admitted immediate predecessor.

Further closure review found two additional consequence defects. Attachment staging previously checked closure only before awaiting file bytes; a late callback could overwrite LEFT/EXPIRED and reactivate an ended transfer. Root added synchronous staging acquisition, an invalidated generation token and own-attachment cleanup. Native corner retry also removed a successful ACTIVATE reply before the controller rejected its unauthorized repeat; root now guards the waiting-for-files stage before mutating conversation history. Eight real terminal/controller regressions now pass, including blocked AIA and selected-file `arrayBuffer()` preparation under both End and expiry, and preservation of the admitted activation reply when Retry is pressed. This extends the earlier three preparation-race witnesses without making a browser or provider claim.

A ninth negative control exposed an ownership error in that first cleanup: subtracting all pre-await attachment IDs deleted a separately staged ordinary attachment after End. The native attachment helper now reports only the new IDs owned by its own staging call, and Loom cleanup removes only those IDs. The regression blocks Loom AIA file bytes, ends custody, stages a separate ordinary source, then releases the old read; the ordinary attachment survives while the late Loom attachment is removed. All nine terminal/controller race checks pass on the final source candidate.

Validation at the working candidate: `node --test tests/loom-demo-contract.test.mjs tests/loom-demo-neon-custody.test.mjs tests/dollhouse-continuity-audit.test.mjs tests/loom-native-stage-support.test.mjs tests/loom-native-terminal-races.test.mjs` passed. These are source/DOM/contract checks. They do not establish browser layout, physical mobile behavior, live provider quality or production release acceptance. A mobile browser witness remains a separate requirement.

⟐
