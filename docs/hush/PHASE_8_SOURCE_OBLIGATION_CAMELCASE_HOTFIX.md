# Phase 8 Source Obligation camelCase Hotfix

## Summary

This patch repairs the Phase 8 explicit source-obligation gate so camelCase caller options are honored in the same way as snake_case options.

The affected option is:

```js
deriveSourceAnchors: true
```

Before the patch, `derive_source_anchors: true` enabled explicit-plus-derived coverage, but `deriveSourceAnchors: true` did not. In explicit-required mode, that silently left the source obligation set in `explicit-only` mode.

## Rule

Both spellings now mean the same thing:

```js
derive_source_anchors: true
deriveSourceAnchors: true
```

Either spelling produces:

```json
{
  "derive_source_anchors": true,
  "source_obligation_mode": "explicit-plus-derived"
}
```

## Doctrine

This patch does not weaken the explicit source-obligation gate.

Explicit obligations remain required when `explicit_source_obligation_required` or `explicitSourceObligationRequired` is true.

The patch only prevents caller-option spelling from accidentally suppressing intentionally requested derived anchors.

## Non-goals

- no Phase 8.1 individual mask packet
- no public-default authority
- no raw sample export
- no raw candidate storage
- no identity/authorship/legal/consent proof claim
