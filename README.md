# TCP - The Cadence Playground

TCP is a browser-based research instrument for studying stylometric resemblance, cadence transfer, shell borrowing, and custody-aware routing without confusing any of them for authorship proof.

The project is useful when you want to keep three things visible at once:

- what the language is doing
- what the retrieval and safety layers are willing to claim
- what still needs human judgment, provenance, and context

TCP is deterministic, explicit about its thresholds, and tested through both Node suites and browser flights. It is designed to be fun to explore in the UI and strict in the places where the system has to tell the truth.

## What the app does

The live app currently has four views:

- `Deck` for raw text, shell cards, `Analyze Cadences`, `Swap Cadences`, and `Shell Duel`
- `Readout` for similarity, traceability, route pressure, archive state, harbor selection, and formulas
- `Personas` for saved shells and reusable in-app persona assignment
- `Trainer` for manual persona extraction, prompt building, pasted-output validation, and persona injection

Normal visits enter through the `Ingress Membrane`, which resolves containment, mirror posture, and custody badge before the deck unlocks.

## Why retrieval matters here

TCP does not treat a convincing rewrite as enough. The current build exposes a retrieval lane that tracks semantic audits, protected anchors, failure classes, and borrowed-shell outcomes. That matters because stylometric play is easy to fake at the surface and much harder to defend once the system has to say what actually changed and what stayed intact.

Patch 28 made `Swap Cadences` retrieval-guided and casebook-driven. The maintained build now checks shell borrowing against:

- a canonical 56-pair swap matrix built from the 8 long-form library samples
- a 12-pair flagship matrix used as the model gate
- explicit borrowed-shell outcomes and failure classes
- browser flights and Node regression tests

In the current maintained build, that matrix clears the Patch 28 thresholds with:

- `42` bilateral-engaged pairs
- `12` one-sided pairs
- `2` both-rejected pairs

That is not a claim of completion. It is a claim that the swap surface is finally auditable enough to tune seriously.

## What TCP is not

- not an authorship verdict engine
- not a truth machine for whistleblowing claims
- not a production safety platform
- not a covert classifier
- not a magical persona synthesizer

Stylometric resemblance can matter without becoming a verdict. TCP is built around that boundary.

## Quick start

Open the app:

```text
app/index.html
```

Skip ingress during development:

```text
app/index.html?ingress=off
```

Serve locally:

```bash
cd tcp-repository
python -m http.server 8000
# then open http://localhost:8000/app/
```

## Browser proof surfaces

TCP ships browser flights that exercise the maintained browser surface directly:

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

The maintained regression entry point is:

```bash
npm test
```

That path covers:

- stylometry
- benchmark
- browser parity
- retrieval lane
- swap-cadence matrix
- trainer lab
- harbor

Legacy formulas remain explicit and separate:

```bash
npm run test:legacy:formulas
```

## Reading order

If you want the repo in a clean sequence, use this order:

1. [START_HERE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/START_HERE.md)
2. [docs/SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md)
3. [ABSTRACT.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/ABSTRACT.md)
4. [docs/ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
5. [docs/SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md)
6. [docs/STYLOMETRIC_MATH.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/STYLOMETRIC_MATH.md)
7. [docs/INTERFACE_LEXICON.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/INTERFACE_LEXICON.md)

## Repository stance

The safest concise reading of TCP is this:

- recognition is not route
- resemblance is not authorship
- unresolved residue is not noise just because it resists closure
- safe passage only counts if provenance stays intact

That stance is what holds the playful UI and the strict proof surfaces together.
