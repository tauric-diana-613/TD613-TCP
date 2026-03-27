# TCP - The Cadence Playground

𝌋‌ TCP is a browser instrument for making cadence legible without pretending cadence is already proof.

It stages three things at once:

- human-readable language play
- bounded stylometric measurement
- custody-aware routing logic

The project is experimental, deterministic, and explicit about its limits. It is not a forensic authorship engine, not a covert adjudication tool, and not a substitute for human judgment. It is a public membrane for exploring when language starts to gather enough patterned pressure that it needs routing, preservation, or scrutiny.

## Who this should still make sense to

TCP should be readable by one mixed human audience, not three sealed castes:

- someone under pressure who is trying not to overclaim a pattern
- someone who wants to explore cadence because language behavior itself matters
- someone building or studying retrieval-first post-training systems
- anyone else curious enough to read carefully and test the instrument instead of mythologizing it

## What the app does now

The live app has four working views:

- `Deck`: raw text bays, shell cards, `Analyze Cadences`, `Swap Cadences`, and `Shell Duel`
- `Readout`: route pressure, branch, harbor, and formula-facing telemetry
- `Personas`: saved shell library and in-app persona reuse
- `Trainer`: a manual persona lab for corpus extraction, prompt generation, pasted-output validation, and persona injection

Normal visits enter through the `Ingress Membrane`, which resolves containment, mirror posture, and custody badge before the deck unlocks.

## Patch 28 status

`Swap Cadences` is now governed by a retrieval-guided shell-borrowing path rather than vague “did the text kind of change?” logic.

Patch 28 added:

- a canonical 56-pair swap matrix built from the 8 long-form library samples
- a 12-case flagship matrix that acts as the model gate
- borrowed-shell outcomes:
  - `structural`
  - `partial`
  - `subtle`
  - `rejected`
- borrowed-shell failure classes:
  - `semantic-risk`
  - `literal-lock`
  - `lexical-underreach`
  - `pathology-block`
  - `already-close`
  - `donor-underfit`
- a dedicated browser swap flight at `?test-flight=swap`

In the current maintained build, the swap matrix clears the Patch 28 thresholds with:

- `42` bilateral-engaged pairs
- `12` one-sided pairs
- `2` both-rejected pairs

That does not mean the transfer engine is “finished.” It means the swap button is finally honest enough to serve as a real model surface.

## What TCP is not

- not an authorship verdict engine
- not a truth machine for whistleblowing claims
- not a production safety platform
- not a magical persona synthesizer

Stylometric resemblance is treated here as a bounded contact signal. It can matter without becoming a verdict.

## Fast start

### Open the app

```text
app/index.html
```

### Skip ingress during development

```text
app/index.html?ingress=off
```

### Serve locally

```bash
cd tcp-repository
python -m http.server 8000
# then open http://localhost:8000/app/
```

## Built-in browser flights

- `app/index.html?test-flight=1`
  - smoke path
- `app/index.html?test-flight=2`
  - full browser matrix
- `app/index.html?test-flight=transfer`
  - transfer benchmark flight
- `app/index.html?test-flight=swap`
  - borrowed-shell flagship swap flight
- `app/index.html?test-flight=ingress`
  - ingress-only handshake flight

All browser flight routes auto-skip the ingress membrane.

## Maintained test path

The current maintained regression surface is:

```bash
npm test
```

That includes:

- stylometry
- benchmark
- browser parity
- retrieval lane
- swap-cadence matrix
- trainer lab
- harbor

Legacy formulas remain quarantined behind:

```bash
npm run test:legacy:formulas
```

## Reading map

Start here if you want a human-facing path through the repo:

- [START_HERE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/START_HERE.md)
- [docs/HUMAN_GUIDE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/HUMAN_GUIDE.md)

Then follow the deeper technical lanes as needed:

- [ABSTRACT.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/ABSTRACT.md)
- [docs/ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
- [docs/STYLOMETRIC_MATH.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/STYLOMETRIC_MATH.md)
- [docs/SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md)
- [docs/INTERFACE_LEXICON.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/INTERFACE_LEXICON.md)

## Repository stance

TCP is trying to keep four conditions visible at the same time:

- weak resemblance that is probably noise
- recognition pressure that is real but not yet routable
- residue that should be preserved instead of flattened
- harbor choices that lower witness burden without destroying provenance

That is the level on which the project should be read.
