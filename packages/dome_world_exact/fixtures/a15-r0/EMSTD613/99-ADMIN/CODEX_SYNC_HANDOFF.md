# Codex handoff — sync `emstd613lineage`

## Exact target

Repository: `tauric-diana-613/TD613-TCP`

Branch: `amari/em-td613-lineage-atelier`

Landing directory:

`packages/dome_world_exact/fixtures/a15-r0/EMSTD613/02-ORIGINALS/emstd613lineage/`

## Required sync behavior

1. Start from the exact branch above and record its pre-sync HEAD.
2. Copy the **contents** of the local folder named `emstd613lineage` into the landing directory while preserving relative paths and original filenames.
3. Do not normalize, rewrite, OCR, rename, or re-encode original files during the source-copy step.
4. Compute SHA-256 and byte length for every preserved file.
5. Generate `01-MANIFESTS/source-files.jsonl` with one row per file conforming to `source-files.schema.json`.
6. Generate an extension/media-type census and exact-hash duplicate report.
7. Place extracted text or OCR only under `03-DERIVATIVES/`, each derivative bound to its parent SHA-256 and tool/version.
8. Write an append-only intake receipt under `04-RECEIPTS/intake/` containing:
   - pre-sync HEAD;
   - post-sync HEAD;
   - file count;
   - total source bytes;
   - manifest SHA-256;
   - duplicate groups;
   - unreadable/unsupported files;
   - any filename/path transformation forced by Git or the operating system.
9. Do not infer works, motifs, mechanisms, lineage, or TD613 relations during the byte-preservation step.
10. Do not merge the branch.

## First analytical pass after sync

Once custody is receipted, build in this order:

```text
source inventory
-> extraction coverage
-> section/formula/citation maps
-> claim atoms
-> concept/motif candidates
-> mechanism candidates
-> within-Em relation graph
-> TD613/SRC comparison
-> current-science confrontation
-> convergence/divergence/emergence stress tests
```

The first pass should be deliberately conservative about genealogy and aggressively rich about candidate structure.

## Safety against expectation leakage

The folder name and human provenance create a search hypothesis, not a conclusion. Preserve null results. A file that turns out unrelated to TD613 remains scientifically useful as a negative control.
