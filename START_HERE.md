# START HERE

𝌋‌ This is the shortest honest path into TCP.

If you only do one thing, open the app, wake the deck intentionally, and watch what `Swap Cadences` now tells you instead of just whether it changed some words.

## First pass

1. Open `app/index.html`.
2. Complete the `Ingress Membrane`, or use `?ingress=off` while developing.
3. Leave the seeded texts in place for the first run.
4. Press `Analyze Cadences`.
5. Read the shell cards before you press anything else.
6. Press `Swap Cadences`.
7. Compare the raw bays to `Shell Duel`.
8. Open `Readout`.
9. If you want to build a persona, open `Trainer`.

## What to watch

- `Deck` shows raw text, shell behavior, and duel output.
- `Readout` shows route pressure, branch, harbor, and the formula-facing state.
- `Personas` stores reusable shells.
- `Trainer` lets you extract a corpus, build a prompt, validate pasted model output against the retrieval lane, and inject a persona.

## Shared human guide

TCP should make sense to a fused human audience:

- a whistleblower or witness trying not to overclaim
- someone exploring cadence because language behavior matters
- an RLHF or post-training reader looking for explicit contracts
- anyone else curious enough to read and test carefully

Use one guide for that shared surface:

- [docs/HUMAN_GUIDE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/HUMAN_GUIDE.md)

Then branch deeper only if you need more specificity:

- [docs/SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md)
- [docs/ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
- [docs/STYLOMETRIC_MATH.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/STYLOMETRIC_MATH.md)

## Fast verification

Browser flights:

- `app/index.html?test-flight=1`
- `app/index.html?test-flight=2`
- `app/index.html?test-flight=transfer`
- `app/index.html?test-flight=swap`
- `app/index.html?test-flight=ingress`

Maintained repo test path:

```bash
npm test
```

Legacy formulas:

```bash
npm run test:legacy:formulas
```

## What changed recently

Patch 28 made `Swap Cadences` retrieval-guided, casebook-driven, and explicitly auditable.

That means the system now tells you whether a lane was:

- `structural`
- `partial`
- `subtle`
- `rejected`

and, if it stalled, why.

## Next documents

- [docs/HUMAN_GUIDE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/HUMAN_GUIDE.md)
- [docs/INTERFACE_LEXICON.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/INTERFACE_LEXICON.md)
- [docs/ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
