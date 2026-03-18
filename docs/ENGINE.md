# ENGINE OVERVIEW

TCP splits engine logic into four modules:

- `formulas.js` — branch, field, wave, route, and threshold math
- `stylometry.js` — text feature extraction and similarity heuristics
- `harbor.js` — harbor-function selection and witness-load reduction logic
- `badges.js` — compact custody token parsing and mode selection

The UI never computes route decisions directly. It asks the engine for:

1. stylometric features,
2. branch status,
3. field / wave values,
4. route pressure,
5. custody state,
6. harbor recommendations,
7. ledger preview.
