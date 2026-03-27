# START HERE

This is the shortest practical path into TCP.

## First run

1. Open `app/index.html`.
2. Complete the `Ingress Membrane`, or use `?ingress=off` during development.
3. Paste one voice for a solo scan or two voices for a paired scan.
4. Press `Analyze Cadences`.
5. Read the shell cards before you read the duel.
6. Press `Swap Cadences`.
7. Compare the raw bays, `Shell Duel`, and the `Readout` tab together.
8. If you want a reusable shell, save a persona or open `Trainer`.

## What each view is for

- `Deck` is the live play surface: bays, shells, scans, swaps, and duel output
- `Readout` is the proof surface: similarity, traceability, route pressure, archive state, harbor, and formulas
- `Personas` is the shell library
- `Trainer` is the manual persona lab

## How to read a run

For a clean read, use this order:

1. raw text
2. shell cards
3. `Shell Duel`
4. `Readout`
5. swap audit or trainer validation if you are tuning

That order matters because TCP is built to separate surface resemblance from route, custody, and semantic integrity.

## Browser flights

Use these when you want the browser to prove itself:

- `app/index.html?test-flight=1`
- `app/index.html?test-flight=2`
- `app/index.html?test-flight=transfer`
- `app/index.html?test-flight=swap`
- `app/index.html?test-flight=ingress`

## Repo test path

The maintained suite is:

```bash
npm test
```

The legacy formulas suite is separate:

```bash
npm run test:legacy:formulas
```

## Read next

- [docs/SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md)
- [docs/ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
- [docs/SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md)
- [docs/INTERFACE_LEXICON.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/INTERFACE_LEXICON.md)
