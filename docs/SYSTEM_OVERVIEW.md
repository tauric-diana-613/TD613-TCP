# SYSTEM OVERVIEW

TCP is a small public instrument for inspecting how language starts to feel patterned before the system is willing to call that pattern routable, safe, or interpretable.

The important point is that TCP does not collapse everything into one score. It keeps different layers visible:

- stylometric resemblance
- native writing and explicit hold behavior
- retrieval-side semantic integrity
- Aperture audit and registration
- route and harbor policy
- archive and provenance state

That separation is the main design choice.

## What the system actually measures

At the bottom of the stack, TCP extracts stylometric features such as sentence rhythm, spread, punctuation density, contraction posture, function-word behavior, lexical dispersion, and recurrence pressure.

Those features feed two kinds of work:

- comparison work, such as similarity, traceability, coherence, and resonance
- transformation work, such as shell borrowing, cadence transfer, persona reuse, and the default Generator V2 writing lane

The current build is deterministic. There is no hidden model call inside the main browser loop.

The current writer contract is also explicit: if the native writer cannot land a valid rewrite, the UI should surface a visible hold docket rather than quietly snapping back to source and pretending nothing happened.

## What the retrieval lane adds

Stylometric resemblance alone is too weak to govern the whole system. TCP therefore adds a retrieval lane that checks whether a transformation is doing something visible while still respecting semantic and literal constraints.

The retrieval lane currently tracks:

- semantic audits
- protected-anchor integrity
- transfer plans and candidate summaries
- borrowed-shell outcomes
- borrowed-shell failure classes
- swap-matrix and fixture-based proofs

On top of that, the maintained diagnostics battery now includes a dedicated generator audit so the repo can distinguish:

- a weak writer
- a safe explicit hold
- a structurally live writer that still stays semantically bounded

This matters most in `Swap Cadences`, because a swap can look stylish while still being semantically timid, one-sided, or effectively native. The retrieval lane is the part that keeps the system honest about that.

## Why the UI is playful

The live app is supposed to be fun to use. That is not a contradiction.

Play matters here because cadence is easier to understand when you can stage it, stress it, swap it, and save it. The interface is therefore allowed to feel lively, but the underlying readouts still have to stay explicit about what is measured, what is inferred, and what is simply being preserved for later judgment.

In practice, that means:

- the `Deck` can feel playful
- the `Readout` stays strict
- the `Trainer` lets you iterate manually
- the docs should explain the whole thing without pretending there are three unrelated audiences

That same rule now applies to failure. A miss should read as an explicit generator hold, not as a quiet reversion to source dressed up as safety.

## Why this matters in higher-stakes reading

TCP is not built to certify authorship or replace testimony. It is useful when a pattern needs to remain visible without being overclaimed.

That makes the system relevant in settings where a reader may need to say:

- a pattern is present
- the pattern is not yet a verdict
- the residue should not be flattened away
- the route, harbor, or archive state changes how the pattern should be handled

That same discipline is also useful for post-training work. A long-range RLHF or post-training team should be able to inspect the system and see exactly where the project is measuring, where it is transforming, where it is applying policy, and where it refuses to pretend those are the same act.

## What to read as proof

If you want the strongest maintained proof surfaces, use these:

- `npm test`
- `node scripts/run-diagnostics-battery.mjs`
- `?test-flight=transfer`
- `?test-flight=swap`
- `?test-flight=2`
- [ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
- [SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md)

If you want the most important operational feature, start with `Swap Cadences`. That button now compresses most of the project's hard problems into one visible surface: bilateral movement, semantic integrity, partial rescue, failure classes, and truthful reporting when the engine cannot carry the donor shell cleanly.

If you want the most important implementation feature, start with `buildCadenceTransfer()`. It is now the live public writer API, backed by Generator V2 by default and legacy only through explicit compatibility exports.

## Boundaries

TCP does not currently do these things:

- issue authorship verdicts
- decide truth on its own
- replace provenance or documentation
- treat stylometric contact as evidence of motive
- hide its safety heuristics behind a neutral-looking score
- hide a generator miss by silently flattening back toward source

The project is most coherent when read as a retrieval-first cadence lab with an intentionally public interface and a native-first deterministic writer.
