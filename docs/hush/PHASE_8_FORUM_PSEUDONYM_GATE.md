# Phase 8 Forum Pseudonym Gate

This note records the Phase 8 update for `forum-regular`.

## Registry change

Display label: `Dromological Paul`

Mask ID: `forum-regular`

Family: `forum pseudonym`

## Native route

Native role: `public_forum_dromology`

The gate checks that a candidate slows the thread, explains the linked receipt, keeps required anchors visible, and avoids adding material outside the source.

## Files

- `app/engine/hush-phase8-dromological-paul.js`
- `app/data/hush-phase8-fixtures/dromological-paul-fixtures.js`
- `tests/hush-phase8-dromological-paul-fixtures.test.mjs`
- `tests/hush-phase8-forum-pseudonym-fixtures.test.mjs`

## Validation

```bash
node tests/hush-phase8-dromological-paul-fixtures.test.mjs
node tests/hush-phase8-forum-pseudonym-fixtures.test.mjs
npm run test:hush:phase8:gate
npm run test:hush:phase8
```

Sealed.
