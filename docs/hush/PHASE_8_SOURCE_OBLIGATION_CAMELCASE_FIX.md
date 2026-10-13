# Phase 8 Source Obligation camelCase Fix

This patch keeps the Phase 8 explicit source-obligation gate strict while honoring both option styles.

Before the patch, snake_case `derive_source_anchors: true` enabled explicit-plus-derived coverage, but camelCase `deriveSourceAnchors: true` did not. In explicit-required mode, that could silently leave a caller in explicit-only mode even when derived anchors were intentionally requested.

Both spellings now request derived anchors:

```js
derive_source_anchors: true
deriveSourceAnchors: true
```

Explicit obligations remain required when either `explicit_source_obligation_required` or `explicitSourceObligationRequired` is true. The change only prevents spelling style from suppressing requested source-derived anchors.

Non-goals: no Phase 8.1 individual mask packet, no public-default authority, no raw sample export, no raw candidate storage, and no identity/authorship/legal/consent proof claim.
