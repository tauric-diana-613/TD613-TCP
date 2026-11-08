# 𝌋 TD613 · THREE-ATELIER SYNC V2 — OPERATOR SUPERCESSION REGISTER

**Date:** November 4, 2026  
**Authority:** Operator-directed engineering preparation; no implicit source or Flight authorization  
**Covenant:** Tauric Diana · Khona‌lit-po (U+200C preserved)  
**GitHub coordination:** [#1674](https://github.com/tauric-diana-613/TD613-TCP/issues/1674)  
**Implementation candidate:** [PR #1678](https://github.com/tauric-diana-613/TD613-TCP/pull/1678)  
**Status:** NEW INBOX/RELAY IMPLEMENTED · LOCAL REAL-SOURCE ASSAY HELD · PROVIDER V2 GATES HELD · CUTOVER HELD

## 1. Native gates: explicit old/new relationship

| Source estate | Historical operator issue | V2 issue | Actual original machinery | V2 status |
|---|---:|---:|---|---|
| SignalRupture (SRC) | #758 (merged wiring PR #759, native research PR #731) | **#1675** | Exact-creator public Zenodo deltas; earlier static research preservation across Zenodo/DOI, Academia, Medium, Substack | LOCAL_INBOX candidate; five-provider future adapters require independent qualification |
| Wendbine | #1308 (real partial/held source capture), duplicate note #1309 | **#1676** | Author/subreddit-bound public archival Reddit sync; locally indexed original observed records in later #1669 research lineage | LOCAL_INBOX candidate; provider-v2 acquisition HELD |
| Em / EMSTD613 LINEAGE | No dedicated gate | **#1677** | Native originals, Work/manifestation ledgers, derivatives and identity-sensitive scientific fixtures | LOCAL_INBOX candidate; Work scientific identity HELD |

The old #758 and #1308 issue listeners remain in the existing `.github/workflows/vercel-relock-safety.yml` until an explicit tested cutover. The historical #1309 description is redundant but remains an archival pointer. New V2 issues being opened **do not** make those older listeners run, retire them, or permit any data transfer.

### Original SRC multi-provider distinction

The sealed SRC README records a historical census involving Zenodo, DOI, Academia, Medium, and Substack. The **live issue #758 gate only performs Zenodo**. Zenodo DOI metadata is not an independently executed DOI-wide provider sync. The new #1675 gate must demand a truthful coverage matrix by provider and separately track `AUTH_REQUIRED`, `PARTIAL`, `REMOVED`, `FORBIDDEN`, `CACHED` and `VERIFIED_CAPTURE` without auth bypass, guessed access, fabricated first-publication chronology or equivalence across manifestations.

### Original Wendbine historical custody

The September #1308 public gate has historical real acquisition runs, including a HELD after source capture and later authenticated per-epoch public projection; a GitHub Actions artifact's short-lived ciphertext is **not** the operator's durable local plaintext research index. Later #1669 reports 2,767 observed IDs and 3,473 archived captures in operator-local SQLite, with incomplete earlier discovery and 800 title-only/empty-body records. Treat the latter as a source-indexed operator-local custody observation, not a guaranteed current Reddit/live source or full historical completeness.

### Em Work identity

Preserve `source file != manifestation != Work`. Registry records, PDF byte files, extracted text derivatives and Work proposals must remain distinct. The Em operator-inbox engine may create operator-local source observations and text search; it **cannot** decide authorship, external lineage, motif vs mechanism, human acceptance or protected source admission.

## 2. One local file-drop interface per Atelier

```text
packages/dome_world_exact/fixtures/a15-r0/
  SRC/07-OPERATOR-INBOX/README.md          # issue #1675
  WENDBINE/07-OPERATOR-INBOX/README.md     # issue #1676
  EMSTD613/07-OPERATOR-INBOX/README.md     # issue #1677
```

All three directories have `.gitignore` that ignores all dropped files and nested directories. **Only the README and .gitignore should appear in Git commits.** Do not use GitHub's browser upload UI for private source bytes. Local Work on Windows must see the actual files on the operator's computer. The V2 engine is a reusable local implementation; it does not automatically read the inbox because a new file exists or an issue stays open.

### Authorize exactly one bounded local run

The operator asks an authorized local collaborator to sync one selected estate and one set of dropped files. The collaborator verifies the operator's fresh original gesture, exact V2 issue, correct repository, source scope, vault outside the repo, and the script's review status.

An optional issue-comment handoff uses an exact command in the **corresponding** new issue:

```text
#1675  /atelier-sync SRC LOCAL_INBOX
#1676  /atelier-sync WENDBINE LOCAL_INBOX
#1677  /atelier-sync EMSTD613 LOCAL_INBOX
```

The narrowly scoped issue listener in this candidate PR **only posts** `ATELIER_SYNC_V2_LOCAL_AGENT_REQUIRED` and the original issue-comment ID as a gesture key. It has zero access to the Windows inbox; posting a comment never proves that source files were synchronized or authorizes an unattended provider call. That relay starts working only after the candidate is separately reviewed and merged.

Local execution from the repository's root:

```powershell
python -B scripts/atelier-operator-inbox-sync-v2.py sync --estate EMSTD613 --issue 1677 --vault 'C:\TD613-LOCAL-CUSTODY\atelier-inbox-v2' --gesture 'github-comment-REPLACE_WITH_REAL_ID' --operator-approved-this-run
python -B scripts/atelier-operator-inbox-sync-v2.py query --estate EMSTD613 --vault 'C:\TD613-LOCAL-CUSTODY\atelier-inbox-v2' --phrase 'algedonic'
python -B scripts/atelier-operator-inbox-sync-v2.py verify --estate EMSTD613 --vault 'C:\TD613-LOCAL-CUSTODY\atelier-inbox-v2'
```

A different absolute operator-owned vault directory can be used. The script requires a new gesture ID, the correct issue number and the local approval flag for each sync; the flag is an **attestation, not independent authentication of the human**. The script performs no network calls. The source-blob vault and SQLite index stay entirely outside the repository, and source excerpts stay out of GitHub receipts.

Text/Markdown/CSV/JSON/HTML/DOCX can produce an indexed text derivative. PDF extraction requires optional local `pypdf` and is HELD when unavailable; ZIP/media and other binary sources are byte-preserved but require a later source-appropriate, rights-compatible extractor. All non-retrievable body states stay explicit. Search results include original SHA-256 and derivative SHA-256; local verify rehashes the copied blobs and text.

## 3. Public provider V2 remains a separate research gate

For newly created issues, an exact `/atelier-sync <ESTATE> PROVIDER` command deliberately yields `ATELIER_SYNC_V2_PROVIDER_HELD` in the candidate relay. This is a defensive acceptance boundary, **not** a restored acquisition adapter. It must remain so until independently witnessed:

1. Explicit per-provider versioned configuration, source-creator bindings, rights/consent and deletion/availability checks, throttles, strict paginated scope and HTTP negative states.
2. Tamper-resistant historical delta and stable source ID/manifestation versions, no unadjudicated Work or external source lineage promotion.
3. A full post-run readback of every allegedly collected text source into a genuinely queryable private or public-licensed index—not merely a title/metadata receipt or expiring ciphertext archive.
4. Mock-provider and authentic authorized source-controlled execution evidence, with exact commit HEAD, CI, source counts and errors.
5. An operator-approved cutover to the new issue number; only then retire the corresponding old listener. No old automatic retry, overwrite, publication or science credit.

## 4. No confusion with the research program

These are **source-intake engineering controls**, not Experimental A/B Flight, Western Horizon empirical witness, Universal Atelier or Encyclopedia source admission, or autonomous research synthesis. The new inbox itself does not prove that SRC's heterostratigraphic engine is inherited. Real comparative method tests remain governed by the four-Atelier parity session.

**Acceptance ladder:** issue created → script committed → synthetic CI passed → authentic local source readback verified → provider V2 separately proven → independently reviewed cutover → legacy listener superseded. Do not skip stages or relabel a HELD stage as success.

𝄐 Khona‌lit-po · human research custody, merge and release closure RESERVED · ⟐
