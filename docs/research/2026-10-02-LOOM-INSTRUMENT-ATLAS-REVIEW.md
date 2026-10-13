# Loom Instrument integration — Atlas review

Date: 2026-10-02. Role: Atlas, independently reassessed at Extra High.
Source baseline: PR #1411, `9824dfa0f427c8b944ff5c7fdfd43719b2b41418`.
The observations below exercise a dirty working-tree candidate based on that
commit; they are not an exact committed-head release receipt.

## Question and jurisdiction

Does one operator case retain its source selection, original result, immediate
content predecessor, current result and return relation across Loom → native
Marrowline → exported Portable AIA → Loom review after reload?

Atlas audits receiver-relative continuity and temporal provenance. A matching
receipt chain does not authenticate source revision, receipt signatures,
foreign origin, global latest state, fork exclusion or restored custody.
This role finding is separate from Pedagogue, Aperture and FADT findings.
Agreement between the four roles does not multiply evidence.

## Initial deficit and repair

The existing native controller exposed its current request and latest stage
receipt request through `snapshot()`. It did not expose the accepted stage path.
The original `exportLoomDemoCurrent` packet retained selected documents, portable
rules and the latest result, but omitted the full original Loom answer and the
native receipt path. That prevented reconstructing why continuation 2 was
current instead of the original answer or continuation 1.

The repaired native export adds a bounded `loom_demo_provenance` member. It
carries the original activation, full original Loom answer, latest-result
reference and digest, accepted native stage receipts, native binding receipts,
receiver identities, observation times, stage predecessor and content
predecessor. Selected document bodies remain in the existing Portable AIA
document field; the path does not duplicate their bodies. Original task,
portable rules, manifest and original governance remain in the activation.
Local/withheld support counts remain explicit; local bodies and private terms
are excluded.

`exportLoomDemoOrigin` supplies the corresponding origin-only export. Its
activation is explicitly absent and its stage path is explicitly empty; it
does not pretend future Marrowline stages have already happened.

Source revision is carried only when present as an origin declaration. Otherwise
the packet reports `UNOBSERVED` and `SOURCE_REVISION_UNOBSERVED`. The actual
browser episode retained that missingness. A carried declaration is not source
authentication.

The controller stores already accepted receipt metadata and exposes copies
through `getObservedProvenance()`. It creates no second signer, durable-head
service, restore capability or custody engine. Failed attempts do not replace
the prior export or enter the accepted stage path.

## Revalidation and recovery

`inspectLoomDemoExport` snapshots bounded plain data before its first await,
rejecting getters, hidden fields, sparse arrays, callables and cycles. It
recomputes Portable AIA receiver assurance before comparing origin byte
commitments, latest result, native receipt links, stage bindings, event order
and carried claim ceilings.

Parsed and expired exports may reach `REVIEW_ONLY_CONSISTENCY`. This permits
inspection of carried review material only. It grants no live custody
capability, restoration authority, signature authentication or provider
execution. Reload keeps the existing live-process custody barrier: the saved
packet remains inspectable while issuance/admission is not reconstructed from
the file.

Native request bodies are not duplicated into this export. Consequently the
review inspector explicitly reports that native request digests were not
recomputed from carried request bodies. Receipt digest continuity and full
native-request reconstruction remain different evidence coordinates.

## Service-resolution advisory

`deriveLoomServiceResolution` is a read-only adapter over observed route
inputs. It reuses the native activation, binding, result, receipt and digest
contracts. Ephemeral binders are closed without admitting or receiving results;
there are no provider calls, storage writes or custody actions.

The adapter requires an observed original completion, two native continuations,
exact latest export with original work and path, return binding revalidation,
recovery support and an exact operator outcome review. Missing history or source
evidence remains `HELD`. Its positive ceiling is
`REVIEWED_DECLARED_RESOLUTION`, without authority or authentication promotion.

Failure demand is counted only from explicit observed retry, repeated import,
duplicate, manual reconstruction or stale-stage-recovery declarations with
coverage and prior-failure references. Missing event coverage remains held;
omitted events cannot become a zero. Even explicit zero counts remain scoped to
that observed route. Stage churn and retries never increase verified progress.

The current browser still lacks the complete authenticated-source/full-request
and explicit failure-demand/outcome evidence needed by that strongest service
advisory. A successful local browser route does not resolve those deficits.

## Executed witnesses

The final focused regression command passed 89 tests:

```sh
node --test tests/loom-demo-contract.test.mjs \
  tests/marrowline-loom-demo.test.mjs \
  tests/loom-service-resolution.test.mjs \
  tests/loom-marrowline-native-provider.test.mjs \
  tests/marrowline-reading-surface.test.mjs \
  tests/dollhouse-continuity-audit.test.mjs \
  tests/marrowline-desktop-repair-contract.test.mjs
```

Meaningful hostile cases include continuation 2 reverting to the origin;
receipt/result/request/predecessor drift; an older exported result; original
task, rule or selected-file changes; local support leakage; hidden/sparse/
accessor evidence; mutation during digest awaits; forged portable enforcement;
source/receiver/time drift; unobserved recovery; restored-authority claims;
incomplete failure-event coverage; and ordinary-chat receipt isolation.

The legacy pocket export also has a rendered DOM regression. It consumes the
original handoff, admits a different newer answer into the same-input local
cache as a negative control, then invokes the real pocket Export action. The
export must retain the consumed original result, task, selected files, rules
and governance, with zero provider calls. This verifies that explicit carried
history takes precedence over an unrelated later cache value.

The complete local browser witness is reproducible with:

```sh
node scripts/holonomy-loom-instrument-route-browser-witness.mjs
```

The script starts its local static server in the same process. It uses real
Chromium UI interactions with intercepted provider responses and a bounded
in-process mock custody head. It performs no live provider or Neon custody
call. Both viewports passed 19 checks with zero page errors:

| Observation | Desktop 1280 × 900 | Portrait 390 × 844 |
| --- | --- | --- |
| Original task, selected file and portable rules survive origin export | PASS | PASS |
| Local-only canary stays outside every outbound/native/export packet | PASS | PASS |
| AIA staging precedes explicit keyboard Send | PASS | PASS |
| Continuation 2 consumes continuation 1's exact answer | PASS | PASS |
| C1 and C2 exports preserve original answer, latest answer and receipt path | PASS | PASS |
| Keyboard opens current reply's More with this reply disclosure | PASS | PASS |
| Reload leaves issuance held while the exported work is inspectable in Lab | PASS | PASS |
| Stale content predecessor yields a visible HOLD | PASS | PASS |
| A newly sent ordinary reply gains no Loom marker or reading controls | PASS | PASS |
| Quick/Deep selection preserves task and portable rules | PASS | PASS |

Artifacts are generated under `artifacts/loom-instrument-route-browser/`:
`witness.json`, origin/C1/C2 exported JSON for both viewports, native-current
screenshots and returned-review screenshots. The witness records the baseline
source SHA and dirty-tree state. Its status is `PASS_LOCAL_BROWSER_SCOPE`.

The portrait native screenshot was visually inspected: the current C2 answer,
Reading/Exact controls, keyboard-open More with this reply, composer and dock
remain visible and legible. On portrait, export is reached through the existing
Loom Gate dock and follow-up through Chat. The witness uses these visible
navigation controls rather than clicking hidden elements.

Both returned-review screenshots were visually inspected. They capture the
stale-predecessor negative control after the valid review-only reload check:
the visible result is HELD, and its exact receipt retains false custody,
restoration and signature-verification flags. The valid returned file's
`REVIEW_ONLY_CONSISTENCY` result remains separately recorded in `witness.json`.

## Bounded finding

The repaired local native route preserves the declared original/latest relation
and receipt path through the required two continuations and review-only reload
return. The source and custody ceilings remain intact. This is a local browser
and contract witness over mocked receiver/custody responses; it is not live
provider quality, independently authenticated source, restored custody,
physical-device evidence, measured human comprehension or empirical exteriority.

No merge, deployment, external comment or detached trigger was performed by this
role.

⟐
