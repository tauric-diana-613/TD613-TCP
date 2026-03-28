# START HERE

This is the shortest practical path into TCP.

## First run

1. Open `app/index.html`.
2. Complete the `Ingress Membrane`, or use `?ingress=off` during development.
3. Start in `Homebase`.
4. Paste your corpus into `Cadence Lockbox`, press `Lock`, then use `Reveal` when you want the dossier and solo Telemetry/Harbor wake path.
5. If you want to test transformation first, stay in `Homebase`: the mask bench works before `Reveal`.
6. Open `Personas` if you want a collectible mask gallery, or go to `Deck` if you want a live solo or paired scan.
7. In `Deck`, press `Analyze Cadences`, read the shell cards before the duel, then try `Swap Cadences`.
8. Use `Readout` as the proof surface, and `Trainer` when you want the manual persona lab.

## What each view is for

- `Homebase` is the private cadence base: `Cadence Lockbox`, staged `Lock -> Reveal -> Save`, lock archive, dossier, and mask bench
- `Personas` is the collectible mask gallery: built-ins, saved shells, trainer-made shells, and quick apply actions
- `Readout` is the proof surface: similarity, traceability, route pressure, archive state, harbor, and formulas
- `Deck` is the live play surface: bays, shells, scans, swaps, and duel output
- `Trainer` is the manual persona lab

## How to read a run

For a clean read, use this order:

1. `Lock` / `Reveal` in `Homebase`, or `Analyze Cadences` in `Deck`
2. shell cards or mask result
3. `Shell Duel` when the `Deck` is live
4. `Readout`
5. swap audit or trainer validation if you are tuning

That order matters because TCP is built to separate surface resemblance from route, custody, and semantic integrity.

## Browser flights

Use these when you want the browser to prove itself:

- `app/index.html?test-flight=1` - smoke-only
- `app/index.html?test-flight=2` - main full browser run
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
