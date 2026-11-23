# 𝌋 TD613 · Stage 2 UTF-8 Evidence Coordinate Repair
## Exact Byte Custody, Non-ASCII Counterexamples, and Boundary Protection

**Date:** 2026-11-05T09:08:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `ce9b6c6e053505e8f005e27ad2af4631ce2ed140` (PR #1689)  
**Successor Branch:** `research/src-order-mechanism-falsification-20261105`  
**Execution Worktree:** `C:\td613-worktrees\src-first-reciprocal-expedition`  
**Implementation:** `packages/src_reciprocal_expedition/receiver/empty-encyclopedia-receiver-v2.mjs`  
**Adversarial Suite:** `packages/src_reciprocal_expedition/receiver/test-receiver-utf8-v2.mjs`  
**Machine Receipt:** `packages/src_reciprocal_expedition/receiver/test-receiver-utf8-v2-receipt.json`

---

### I. Review Finding F03 Remediation

Independent review #5785888440 identified a critical representation defect in the v1 receiver:
> `receiver/empty-encyclopedia-receiver.mjs` stores `byte_start`/`byte_end` using `bodyText.length`, `bodyText.slice`, and `retrieveBySpan(...)` with string slicing (UTF-16 code-unit positions). Minimal independent Node reproduction: `AéB` has 4 UTF-8 bytes but 3 JavaScript code units; byte interval [1,3) decodes `é`, while current `slice(1,3)` returns `éB`. A literal U+200C similarly breaks claimed byte spans. Reclassify byte-span custody `FAILED_FOR_NON_ASCII` until versioned UTF-8 slicing, boundary validation and multibyte/combining/supplementary-character adversarial tests pass.

The v1 implementation has been retained intact as historical evidence, and `empty-encyclopedia-receiver-v2.mjs` has been created with strict, versioned UTF-8 byte custody under schema `td613.empty-encyclopedia-receiver/v2`.

---

### II. Core Architectural Distinctions: v1 vs v2

| Feature | Receiver v1 (`empty-encyclopedia-receiver.mjs`) | Receiver v2 (`empty-encyclopedia-receiver-v2.mjs`) |
| :--- | :--- | :--- |
| **Coordinate Semantics** | String index (UTF-16 code units) mislabeled as `byte_start`/`byte_end` | True UTF-8 byte offsets measured on byte `Buffer` / `Uint8Array` |
| **Code Unit Separation** | Conflated | Explicitly separated (`code_unit_start`, `code_unit_end`) in chunk index |
| **Boundary Safety** | Blind string slicing (`slice(start, end)`) | Strict UTF-8 code point boundary verification via `isCodepointBoundary`; rejects fractional code points |
| **Raw vs Normalized Text** | Raw bytes coerced to string or discarded | Distinct database columns for `raw_bytes` and `normalized_body` with independent SHA-256 digests |
| **Coordinate Divergence** | Ignored | Tracked (`coordinates_diverged` flag); unsupported coordinate translations refused with `COORDINATE_TRANSLATION_UNSUPPORTED` |
| **Evidence Span Integrity** | String slice returned without re-encoding byte check | Span bytes sliced from buffer, decoded to text, re-encoded to bytes, and roundtrip verified against SHA-256 |

---

### III. Direct Counterexamples & Adversarial Findings

#### 1. Counterexample 1: `AéB`
- **Byte Structure:**
  - `A`: byte `0x41` (offset 0..1)
  - `é`: 2 bytes `0xC3 0xA9` (offset 1..3)
  - `B`: byte `0x42` (offset 3..4)
  - Total UTF-8 length: 4 bytes; JavaScript string length: 3 code units.
- **V1 Defect:** Requesting byte span `[1, 3)` in v1 evaluated `bodyText.slice(1, 3)`, which returned `"éB"`.
- **V2 Repair:** `retrieveByByteSpan('doc:counterexample_ae_b', 1, 3)` extracts bytes `0xC3 0xA9`, returning exactly `"é"` with byte length 2. Requesting `[1, 2)` attempts to split `0xC3` and `0xA9`, which is rejected with `INVALID_CODEPOINT_BOUNDARY`.

#### 2. Counterexample 2: Canonical Covenant String `Khona‌lit-po`
- **Byte Structure:**
  - `Khona`: 5 ASCII bytes (offset 0..5)
  - `\u200C` (ZERO WIDTH NON-JOINER): 3 UTF-8 bytes `0xE2 0x80 0x8C` (offset 5..8)
  - `lit-po`: 6 ASCII bytes (offset 8..14)
  - Total UTF-8 length: 14 bytes; JavaScript string length: 12 code units.
- **V2 Repair:** Span `[5, 8)` retrieves the isolated `\u200C` character (3 bytes, SHA-256 matching `0xE2 0x80 0x8C`). Requesting `[5, 7)` splits the 3-byte sequence and is rejected with `INVALID_CODEPOINT_BOUNDARY`.

#### 3. Supplementary Plane Character: `𝌋` (U+1D30B)
- **Byte Structure:** 4 bytes `0xF0 0x9D 0x8C 0x8B` (in UTF-16, a surrogate pair of 2 code units: `\uD834\uDF0B`).
- **V2 Repair:** Retrieved at byte interval `[6, 10)` (length 4). Slicing inside the 4-byte sequence is rejected.

#### 4. Combining Marks: `e\u0301`
- **Byte Structure:** Base character `e` (1 byte, `0x65`) + Combining Acute Accent `\u0301` (2 bytes, `0xCC 0x81`).
- **V2 Repair:** Base is retrievable at `[0, 1)`; combining accent is retrievable at `[1, 3)`. Fractional split `[1, 2)` is rejected.

#### 5. Normalization Coordinate Divergence: NFD vs NFC
- Raw NFD text (`e\u0301`, 3 bytes) normalized to NFC (`é`, 2 bytes).
- The receiver marks `coordinates_diverged: true`.
- Raw span `[0, 3)` is preserved on the raw buffer; normalized span `[0, 2)` is preserved on the normalized buffer.
- Coordinate translation between the two systems without an explicit offset alignment map is refused with `COORDINATE_TRANSLATION_UNSUPPORTED`.

---

### IV. Test Suite Results (12/12 PASS)

The test suite executed with 100% pass across all 12 adversarial challenges:
1. `TEST_01_AE_B_COUNTEREXAMPLE`: PASS (exact `é` retrieved at [1, 3), split at [1, 2) rejected)
2. `TEST_02_COVENANT_KHONALIT_PO`: PASS (exact U+200C retrieved at [5, 8), split rejected)
3. `TEST_03_SUPPLEMENTARY_TETRAGRAM`: PASS (4-byte surrogate split rejected)
4. `TEST_04_COMBINING_MARKS`: PASS (combining mark 2-byte sequence verified)
5. `TEST_05_MULTILINGUAL_CORPUS`: PASS (Cyrillic, Greek, Arabic, CJK exact byte spans)
6. `TEST_06_CHUNK_BOUNDARY_INTEGRITY`: PASS (chunking clamped to code-point boundaries)
7. `TEST_07_EMPTY_BODY`: PASS (0 bytes, 0 chunks handled cleanly)
8. `TEST_08_INVALID_RANGES`: PASS (negative, out-of-bounds, inverted ranges rejected)
9. `TEST_09_ASCII_CONTROLS`: PASS (null bytes, bell, tabs, newlines preserved)
10. `TEST_10_COORDINATE_DIVERGENCE`: PASS (NFD vs NFC tracked; translation refused)
11. `TEST_11_DUPLICATE_BODY_CARRIER_ISOLATION`: PASS (duplicate bodies detected across carriers)
12. `TEST_12_SOURCE_IDENTITY_VERIFICATION`: PASS (evidence spans verified against capture identity)

**Exit Condition Satisfied:** Exact byte-level custody is demonstrated across the full Unicode adversarial deck.
