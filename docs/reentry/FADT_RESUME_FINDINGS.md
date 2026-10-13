# FADT resumption: retained challenge history and admissibility

Date: 2026-10-02 UTC. Research custody: PR #1406, restored checkpoint
`2565130edfd1260446d9af3c122336cca820b0c2`.

This is an independent FADT review of the restored re-entry lane. It extends
[the first finite findings](FADT_FINDINGS.md) and
[the earlier joining browser witness](FADT_BROWSER_FINDINGS.md). Canonical
jurisdiction is [FADT.md](../../FADT.md), [DOLLHOUSE.md](../../DOLLHOUSE.md),
[the Dollhouse entry map](../../dollhouse/README.md), and
[the original lineage](../../dollhouse/lineage/README.md).

The exact question is whether the representation retains distinctions needed
by the chosen lawful action. Different histories do not automatically require
different actions. Equality is established only in the stated action coordinate.

## Occupied counterexample: latest clean is too coarse

The executable re-entry controls construct two actual local lanes. Their roots
and raw receipts differ; the compared projection is the relation **bound to
its own registered route**, the latest bounded challenge result, and the retained
linked history. It is not a claim that the exact roots or receipts are equal.

| Actual retained history for the active registered excursion | Latest result | Actual next bounded admission result |
| --- | --- | --- |
| Clean episode only | `BOUNDED_CHALLENGE_PASSED` | Exact candidate plus reviewed gesture admits |
| Literal exposure, then clean episode | `BOUNDED_CHALLENGE_PASSED` | `HELD`; local head unchanged |

Omitting the optional challenge attachment during the return check does not
remove either registered episode. The held candidate retains both exact
episode references and evidence; its reason includes
`REGISTERED_CHALLENGE_OBSERVED_EXPOSURE`.

For this occupied pair the declared finite action supports are:

- clean-only: `{REST_AND_INSPECT, ADMIT_WITH_EXACT_REVIEW_GESTURE}`;
- prior linked exposure: `{REST_AND_INSPECT, RETAIN_HEAD_AND_INSPECT_PRIOR_CHALLENGE}`.

Erasing the retained history merges the pair. The adapter reports one occupied
fibre, intersection `{REST_AND_INSPECT}`, and irreducible gap
`{ADMIT_WITH_EXACT_REVIEW_GESTURE, RETAIN_HEAD_AND_INSPECT_PRIOR_CHALLENGE}`.
Retaining history separates the two occupied fibres and yields constant
support in this finite example. Neither union nor intersection reconstructs
the erased distinction. This is not a universal sufficient representation.

The actual engine corroborates the bounded admission outcomes before the
finite audit runs. The finite adapter still receives caller-declared supports;
it authenticates no support, executes no action, and grants no admission
authority. It cannot determine an unseen receiver's true policy compliance.

## Other histories that a later clean episode must not erase

The same actual registry control passes for:

| Earlier registered episode | Retained status | Later clean episode changes earlier lawful HOLD? |
| --- | --- | --- |
| Required error/status channel missing | `HELD_INCOMPLETE_OBSERVATION` | No |
| Required structured reply missing | `HELD` | No |
| Malformed captured JSON | `HELD` | No |
| Receiver policy reference substituted | `HOLD_REFERENCE_MISMATCH` | No |

Each episode retains the originally captured evidence, its own reference,
session/anchor/policy scope, active excursion reference, and the registered
intent references present at registration. A new clean capture does not turn
missingness into observation or mismatch into binding.

`recordChallenge` reserves a `PENDING_CHALLENGE` synchronously before awaiting
qualification. This invalidates an older candidate immediately. Even a clean
completed episode requires a fresh return check and exact reviewed candidate
gesture. Challenge registration, challenge qualification, and return checking
each leave the local head unchanged.

## Positive control: anchor-only and absence

A clean episode registered before any excursion has
`excursion_ref: null`, no registered intent references, and
`episode_class: ANCHOR_EPISODE_NO_FUTURE_TURN_COVERAGE`.
It remains in the private exported history. It is not copied into the later
excursion's `registered_challenges`.

Both this history and a genuinely absent challenge permit an otherwise exact
bounded return to become a candidate and be admitted by the reviewed gesture.
Both candidates explicitly say `NO_EPISODE_RETAINED_FOR_THIS_CHECK`. Neither
claims a leakage assay covered the future foreign turn.

For the narrow next action **admit this exact bounded declaration**, their
supports coincide. Erasing assay scope produces one occupied fibre with zero
gap for that action alone. For the action **report which assay occurred**,
the lawful supports differ: report no assay versus report anchor-only assay
with no foreign-turn coverage. Erasing scope then produces a gap; retaining
scope restores exact finite descent. A blanket “different history means
different admission result” rule would itself teach the wrong law.

Registered or attached clean challenges are explicitly labeled as episodes
with **no foreign-turn coverage**. Matching root and anchor references do not
bind an assay to the exact returned task, answer, source use, or hidden host
history. Stronger coverage would require a separately specified discriminating
witness, rather than another transformation of the same retained declaration.

## Phase and input-class boundaries

The actual operation sequence distinguishes a checked challenge, an insufficient
bound return, an admission candidate, and an admitted local descendant. The
finite model has different support for `CHALLENGED`, `HELD`,
`ADMISSION_CANDIDATE`, and `ADMITTED`. Erasing phase merges one occupied fibre
with four nonshared actions; retaining phase preserves exact finite support.

A clean challenge cannot advance ancestry. A check-only gesture cannot advance
ancestry. The only tested successful crossing is the live issued candidate
plus exact head/candidate comparison, `ADMIT_RETURNED_WORK`, and explicit
acceptance of unresolved alternatives.

The runtime Dollhouse adapter retains the Pedagogue `HELD_INPUT_CLASS` because
it received challenge/verifier data without a captured operator notice/gesture/
consequence trace. It does not fabricate such a trace. The Portable-AIA
roundtrip adapter likewise retains `HELD_INPUT_CLASS`; no semantic-field object
is manufactured. The FADT adapter remains a
`DECLARED_FINITE_ACTION_SUPPORT_MODEL`, `model_only: true`,
`actual_support_authorized: false`, and `local_admission_performed: false`.
Role agreement is not multiplied evidence or an authorization token.

## Fresh live browser witness

An independent cloud Chrome tab 3 actually traversed
<https://td613.com/dome-world/holonomy-loom.html>. Desktop viewport was
1348 × 926. The browser visibly reported **browser source unpinned**.
The inherited release coordinates remain the production starting claims:
source `29a4f0fb67be67a62e0eb170f4b5957cbf38cd2d`, release
`dd4684be7410d6d3a3eef561bbfddf041ba5dd5e`, relock
`de0cbe3589f3f9055061370279d7e41b4ccb980a`. Exact deployed-byte verification
belongs to the parent release audit; these SHAs are not promoted into browser
source authentication by this witness.

The route used a fictional operator-authored task, local preparation, and Loom
Demo mode to open the Challenge Receiver. No Run, provider send, Marrowline
handoff, or copy gesture occurred. The public challenge was expanded and read
before constructing synthetic returns. Its visible prompt had no canary value
and no reconstruction probes; the private literal token was
`FADT-RESUME-FICTIONAL-CANARY`.

| Browser-observed coordinate | Value |
| --- | --- |
| Session root | `3cbb9133b9dbfc1078c93f86e6491000930a303da0a71040ff4e7285157cab8f` |
| Prepared anchor | `273dd6ef843060cc6bcc3548a50f75faf44eb9552a0d16128c404891e4e515a5` |
| Policy commitment | `4d9766454efb545310d16d7a77d140df649b745e868f1472771d68f3aed2c35b` |
| Challenge ID | `challenge_192603a9_444f_4da4_9111_75e89f537b65` |
| Public challenge ref | `93b8226c40491e74a449920d50457c3708c839818fc0de0cac01cc23df94b526` |
| Capture horizon | Single required pasted `reply` channel |

Within the same prepared episode, putting the synthetic canary into the
receiver declaration's notes yielded **Exposure observed in this challenge**
and `OBSERVED_LITERAL_DISCLOSURE`. Changing only the policy commitment to
64 `f` characters yielded **Challenge held · the evidence is incomplete or
mismatched**, while the literal disclosure finding remained visible. Replacing
the notes with clean synthetic bytes and restoring the policy yielded **No
exposure observed within this bounded challenge** and
`FINITE_LITERAL_EXCLUSION_SUPPORTED`.

The live result surface replaces the prior findings with the latest capture's
findings. The earlier exposure and reference HOLD are not present in its final
visible summary. This is an observed latest-capture UI behavior, not proof that
the new PR registry is deployed and not proof that hidden state was erased.
It motivates preserving registered episode history in the admission lane.
The identical green result styling for exposure and reference HOLD is also
visible; Pedagogue owns the consequence-route judgment.

Saved browser frames show the three distinct states:

- [synthetic literal exposure](browser-evidence/fadt-resume-literal-exposure-20261002.jpg);
- [reference HOLD retaining literal exposure](browser-evidence/fadt-resume-reference-hold-literal-exposure-20261002.jpg);
- [latest clean result after an earlier synthetic exposure](browser-evidence/fadt-resume-latest-clean-20261002.jpg).

The fresh run confirms local verifier behavior and visible replacement only.
It adds no foreign-host enforcement, physical-device witness, human
comprehension, universal secrecy, Golden Egg, or empirical exteriority evidence.
The earlier joining witness remains separately pinned in
[FADT_BROWSER_FINDINGS.md](FADT_BROWSER_FINDINGS.md).

## Executable receipt and source boundary

Run from repository root:

```bash
node --test tests/portable-loom-reentry-fadt-resume.test.mjs
```

Result: **9 passed, 0 failed**, no provider invocation. The tests are
[portable-loom-reentry-fadt-resume.test.mjs](../../tests/portable-loom-reentry-fadt-resume.test.mjs).
These inspected SHA-256 file digests describe the working bytes tested after
the parent restored the registry; they are not a deployed-source receipt:

| File | SHA-256 |
| --- | --- |
| `app/engine/portable-loom-reentry.js` | `6981ca094b2b8b69d9927a255a8ba4264cfb7c6527e42b6c40d1107c24488a7b` |
| `app/engine/portable-loom-challenge.js` | `4901263372bd4abc03c675497e06fa05d7578c1b3f58ebdd4327329f85276832` |
| `app/engine/dollhouse-continuity-audit.js` | `6df6acb691288a0ab2190ef0d75ba45de8906dc789fcc7861a356a7633d7479f` |
| New resumed test file | `0b83525f5e26c27c51309f7892529dd10b9f93ebd0e2157669002f3f4c846b12` |

The live-process custody and global/latest-state boundaries remain unresolved
where stated by the engine. A return to the same root is not proof of unchanged
state, and admission of captured declared content is not authentication of the
receiver's execution or enforcement.
