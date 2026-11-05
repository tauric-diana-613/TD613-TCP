# 𝌋 TD613 · Stage A-S2.1 Strict UTF-8 Custody
## Fatal UTF-8 Decoding, Binary Evidence Partitioning & Coordinate Bounds Enclosure

**Date:** 2026-11-05T09:51:00-05:00  
**Authority:** `SAC[X6ZNK5NO51]`  
**Covenant:** Khona‌lit-po (preserving interior U+200C)  
**Parent Checkpoint:** `a9d2c3bdf9ffccfd87135acf386e8ddf81fc7778` (PR #1690)  
**Successor Branch:** `research/src-as21-evidence-tribunal-20261105`  
**Governing Finding:** Emergence HQ Review #5786588723 (`A-S2-F06`)

---

### I. Summary of Stage 5 Actions

Emergence HQ Review #5786588723 identified that the Stage A-S2 receiver relied on `rawBuf.toString('utf8')`, which silently replaces malformed bytes with `\uFFFD`, potentially corrupting downstream spans (`A-S2-F06`). Furthermore, coordinate bounds and safe-integer guarantees were not enforced in coordinate translations.

Stage 5 has created `EmptyEncyclopediaReceiverV3` (`packages/src_reciprocal_expedition/receiver/empty-encyclopedia-receiver-v3.mjs`) to resolve these defects:
1. **Fatal UTF-8 Decoding:** Replaced non-fatal decoding with `new TextDecoder('utf-8', { fatal: true })`. Any malformed or truncated byte sequence throws `MALFORMED_UTF8_SEQUENCE`.
2. **Explicit Binary Evidence Classification:** Arbitrary binary payloads must declare `is_byte_evidence: true` and are segregated as `BYTE_EVIDENCE`, bypassing text-normalization and chunking.
3. **Safe Integer Coordinate Enforcement:** All byte coordinate parameters (`byteStart`, `byteEnd`, `rawByteStart`, `rawByteEnd`) strictly require `Number.isSafeInteger()`, rejecting `NaN`, `Infinity`, and fractional values.
4. **Coordinate Enclosure Bounds in `translateCoordinates`:** Enforces $0 \le \text{start} \le \text{end} \le \text{length}$. Rejects out-of-bounds or inverted ranges with `COORDINATES_OUT_OF_BOUNDS`.
5. **Code Point Boundary Validation:** Slices that attempt to land inside a multi-byte code point (such as interior U+200C in Covenant `Khona‌lit-po`) are rejected with `INVALID_CODEPOINT_BOUNDARY`.

---

### II. Test Suite Verification

The test suite `receiver/test-receiver-utf8-v3.mjs` executed 18 adversarial assertions:
- **Malformed Byte Sequences:** Rejected lone continuation bytes (`0x80`) and truncated multi-bytes (`0xC3`) with `MALFORMED_UTF8_SEQUENCE`.
- **Binary Classification:** Admitted non-UTF-8 payload as `BYTE_EVIDENCE` when `is_byte_evidence=true`.
- **Multilingual & Covenant Text:** Admitted and verified exact byte roundtrip for `Khona‌lit-po` with literal U+200C.
- **Safe Integer Checks in `retrieveByByteSpan`:** Verified rejection of `1.5`, `NaN`, `Infinity`, out-of-bounds offsets, and interior code point slices.
- **Bounds Checks in `translateCoordinates`:** Verified rejection of fractional offsets, `NaN`, out-of-bounds offsets (`99999`), and inverted ranges (`[20, 10]`).

All 18/18 tests passed.

---

### III. Machine Receipt Pin
- Receiver Implementation: `packages/src_reciprocal_expedition/receiver/empty-encyclopedia-receiver-v3.mjs`
- Test Suite: `packages/src_reciprocal_expedition/receiver/test-receiver-utf8-v3.mjs`
- Machine Receipt: `packages/src_reciprocal_expedition/receiver/test-receiver-utf8-v3-receipt.json`
