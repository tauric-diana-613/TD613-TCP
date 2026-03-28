# START HERE

This is the shortest practical path into TCP.

## First run

1. Open `app/index.html`.
2. Complete the `Ingress Membrane`, or use `?ingress=off` during development.
3. Start in `Homebase`.
4. Paste your corpus into `Cadence Lockbox`, press `Lock`, then use `Reveal` when you want the dossier and solo Telemetry/Harbor wake path.
5. If you want to test transformation first, stay in `Homebase`: the passage bench works before `Reveal`.
6. Open `Personas`, choose a mask on the shelf, then use `Bring into Homebase` when you want that mask to become worn instead of merely previewed.
7. In `Homebase`, read the sequence in order: `Worn Mask`, `Source`, `Through Mask`, `Before Contact`, `After Contact`, `What Clung`.
8. In `Deck`, use the cast report before analysis, then press `Analyze Cadences`, read the shell cards after the duel wakes, and try `Swap Cadences`.
9. Use `Readout` as the witness/law proof surface, and `Trainer` when you want the manual forge.

## What each view is for

- `Homebase` is the private cadence base: `Cadence Lockbox`, staged `Lock -> Reveal -> Save`, worn mask, passage bench, dossier, and lock archive
- `Personas` is the collectible mask shelf: built-ins, captured shells, trained shells, and the preview stage that feeds `Homebase` and `Deck`
- `Readout` is the witness/law proof surface: similarity, traceability, route pressure, archive state, harbor, and formulas
- `Deck` is the live encounter chamber: bays, cast report, shells, scans, swaps, and duel output
- `Trainer` is the manual forge: extraction, inspection, validation, correction, export, and injection

## How to read a run

For a clean read, use this order:

1. `Lock` / `Reveal` in `Homebase`, or `Analyze Cadences` in `Deck`
2. worn mask / source / through-mask result
3. `Shell Duel` when the `Deck` is live
4. `Readout`
5. swap audit or trainer validation if you are tuning

That order matters because TCP is built to separate surface resemblance from route, custody, and semantic integrity.

One important split to keep straight:

- choosing a mask in `Personas` only selects it on the shelf
- `Bring into Homebase` makes that mask worn in `Homebase`
- `Try on Deck A` / `Try on Deck B` assigns it to the live encounter chamber instead

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
