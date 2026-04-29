# Contributing to TD613-TCP

## Setup

```sh
npm install
```

`prepare` runs as part of install and sets `core.hooksPath` to `.githooks/`,
enabling the project's git hooks (currently `commit-msg`).

Useful scripts:

- `npm test` — full suite (engine, browser parity, harbor, retrieval, deck, trainer, etc.)
- `npm run serve` — local dev server on port 6130
- `npm run sync:browser-engine` — regenerate `app/browser-engine.js` from `app/engine/`
- `npm run validate` — sample validation

## Commit messages

Imperative mood. Why over what. The commit log is the project's archaeology
layer — `git blame` and `git log` are how future readers (including you, six
months from now) understand decisions. Spend a sentence or two on the
reasoning, not the diff.

The `commit-msg` hook rejects:

- `Patch X.Y.Z` style version stamps (placeholder, no information)
- `WIP` (placeholder)
- empty messages

Good shape:

```
Short imperative summary, under 70 chars

Why this change was made — the problem it solves, the constraint it was
working under, the tradeoff considered. The "what" is in the diff; the
"why" lives only here.
```

## Tests

All tests run via Node's built-in `node:test` and native `assert`. No
external test runner. Add new tests as `tests/<area>.test.mjs` and include
them in the appropriate `npm test` script in `package.json`.

DOM-sensitive tests use `jsdom` (where added). See
`tests/chamber-smoke.test.mjs` for the pattern.

## Plans

Substantial changes (refactors, multi-step features) get a plan written
and reviewed before execution. Plan format: Context, Critical Files,
item-by-item plan with file paths and line numbers, sequencing, and
verification. Plans land before code; plans get reviewed before execution.

## Archive

Historical patch ledgers live in `app/safe-harbor/_archive/ledgers/`.
They are *not* TODOs — they are records of work that has landed. Don't
mistake them for a roadmap.
