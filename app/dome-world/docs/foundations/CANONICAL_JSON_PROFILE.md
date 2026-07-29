# TD613-CJ-1 Canonical JSON Profile

**Identifier:** `td613.ash.canonical-json/v0.1`  
**Manifest domain:** `td613.ash.manifest-digest/v0.1`  
**Receipt domain:** `td613.ash.receipt-digest/v0.1`

## Purpose

TD613-CJ-1 gives the browser and Python one narrow, reproducible byte representation for Ash Phase 2 manifests and receipts. It deliberately avoids pretending that generic JSON has one universal canonical form.

## Admitted values

The profile admits:

- `null`;
- booleans;
- Unicode scalar strings, preserved without normalization;
- integers in the inclusive range `[-9007199254740991, 9007199254740991]`;
- arrays, preserving order;
- plain objects whose keys are printable ASCII strings.

Objects are serialized with keys in ascending ASCII order, no insignificant whitespace, UTF-8 encoding, and the ordinary JSON escapes required for control characters, quotes, and backslashes.

## Rejected values

The profile rejects:

- floating-point numbers;
- negative zero in parsed JSON;
- integers outside the cross-language safe range;
- duplicate object keys;
- non-ASCII object keys;
- unpaired Unicode surrogates;
- `undefined`, functions, symbols, non-plain browser objects, and non-JSON Python objects.

## Domain separation

Digest material is:

```text
ASCII(domain) || 0x0A || UTF8(canonical_json(subject))
```

The manifest subject excludes `manifest_digest` and `aperture`. The latter remains interface context rather than artifact metadata. The receipt subject excludes `receipt_digest` and `receipt_id` so the identifier can derive from the completed receipt digest without recursion.

## Digest semantics

- `artifact_digest` compares exact selected bytes.
- `manifest_digest` compares the canonical manifest subject.
- `receipt_digest` compares the canonical receipt subject.

Metadata edits leave a valid `artifact_digest` unchanged while changing `manifest_digest`. Receipt-envelope edits change `receipt_digest`. None of these values establishes possession, authorship, authenticity, identity, permission, external truth, or trusted time.

## Frozen parity vectors

Cross-language fixtures live at:

`app/dome-world/fixtures/ash-canonical-json-vectors.json`

Both implementations must reproduce every canonical string and digest exactly:

- browser: `app/dome-world/ash/canonical-json.js`;
- Python: `packages/dome_world_exact/ash_canonical_json.py`.

Any profile change requires a new profile identifier and new vectors. Silent semantic edits are forbidden.

⟐
