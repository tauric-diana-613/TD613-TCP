# TD613 · Sequence 5.5 Remote Egress Handoff

**Branch:** `handoff/sequence-5.5-antigravity-egress-20261006`  
**Base:** `0469c721fb195a3fd45396446452679eb9776ab7`  
**Purpose:** Remove Sequence 5.5 operational dependence on the local workstation and make GitHub the reviewable handoff surface.

## Standing classification

- Freeze A V4: `70299c23b3e0b3d781ea9673cae1d1112ba281f3`
- Partial pilot raw freeze: `36f2aaf48a568d0a0171d34f6c1a22a25ff42a3b`
- Credential/billing provenance amendment: `0469c721fb195a3fd45396446452679eb9776ab7`
- Partial pilot: `PRESERVED_HELD`
- Main BAT execution count: `0`
- Pilot answer key: sealed
- Main answer key: sealed
- Product main / PR #1433 / Cathedral / Issue #405 / Vercel release path: untouched by this handoff

## Antigravity local-egress instruction

Antigravity may use this branch only to push any remaining Sequence 5.5 artifacts that currently exist **only** on the local workstation and are necessary for reproducibility, audit, or handoff.

Allowed examples:
- preflight reports;
- non-secret configuration receipts;
- runner source/scripts used to produce preserved evidence;
- execution manifests;
- provider response metadata already authorized for repository storage;
- handoff notes identifying held state.

Do **not** commit:
- `.env` files;
- raw API keys, OAuth tokens, service-account secrets, bearer tokens, Vercel tokens;
- secret prefixes/suffixes;
- locally cached credentials;
- node_modules/build caches;
- unrelated workstation files;
- BAT-01..BAT-16 outputs, because none are authorized to exist.

## Secret boundary

`LOCAL_FILE_EXISTS != REPOSITORY_ADMISSIBLE`

Every file must be inspected for secret material before push.

Credential identity may be represented only through the approved non-secret provenance fields. Raw credential bytes never enter Git.

## Egress rule

1. Commit all admissible local-only Sequence 5.5 residue to this branch.
2. Push to origin.
3. Return the full 40-character remote head SHA and exact file list.
4. Confirm working tree contains no **uncommitted assay evidence** required for later reproduction.
5. After remote verification, local scratch copies that are no longer operationally required may be removed from the workstation. Do not delete secrets or local files merely to create the appearance of remote completeness; verify remote bytes first.
6. Stop. Do not resume pilot execution, reveal keys, score the partial episode, touch BAT fixtures, mutate product branches, or deploy.

## Governing law

`REMOTE_REVIEW_SURFACE != LOCAL_WORKSTATION_DEPENDENCE`

`RESEARCH_AUDIT_ANCESTRY != PRODUCT_MERGE_ANCESTRY`

This branch is an egress and custody lane only. It is not a product integration branch and is not intended to merge into `main`.

⟐
