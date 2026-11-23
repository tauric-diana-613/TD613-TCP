# Vixen Cybernetics — Pre-#1744 Release Adjudication
**STATE: EVIDENCE INTAKE HELD — final screenshot archive not yet admitted.**

This branch is the persistent cross-thread review address for the **final, independently audited Chromium screenshot package only**, its manifest, source/source-revision and artifact-custody receipts. It exists separately from product PR #1730 and witness repair PR #1784.

- **Review branch ancestry:** initially sourced from witness-only candidate `b6106cf4633c2ad86f3519dc05f79b1144049aba` (draft PR #1784). **Moving repair candidate** at this ledger snapshot: `86664aecaa00951ffd085004c3db99ee256aa36b`; always recheck live #1784 HEAD.
- **Established product preview:** `b90ae99559b21e1561229cdc8e1d873cfaf6f43a`, currently verified by successful #1744 PREPARE 45049541672 and DEPLOY 45049621797.
- **Unmerged product:** PR #1730, branch `research/vixen-dual-estate-encyclopedia-20261108`.
- **Witness repairs:** draft PR #1784; final CI must qualify its exact commit after all fixes.
- **Research:** private 7+1 and PR #1782 excluded from visitor-facing and review archives.
- **Protected:** production #405, human Program Notes grants, Experiment B, provider synchronization, release rights remain untouched.

## Final-only evidence contract

Publish **exactly one** final screenshot package and **one** final integrity/coverage receipt after full local/hosted attribution, four viewport validation, nested scroll image audit, error/failure register, and SHA-256 inventory. Intermediate, historical, failed or partial capture ZIPs belong in CI history or labeled external evidence, **never** in this branch's final evidence directory. If an archive exceeds GitHub Git's 100 MB file limit, keep the complete byte-for-byte archive as the exact-head Actions artifact and persist its artifact ID, run URL, archive SHA-256, retrieval instructions, and any durable authorized external copy here. A link or pointer alone must never be described as a Git-embedded ZIP.


## Reproducible validation tools — preparation, not accepted final evidence

- [Post-deployment HTTPS witness protocol](POST_DEPLOYMENT_WITNESS_PROTOCOL.md): verifies actual served revision and records the owner-held #1744 release boundary.
- [Independent screenshot archive auditor](audit_final_surface.py): run `python audit_final_surface.py Vixen_Chromium_Full_Surface_<SHA>.zip <SHA>` with Pillow installed; must pass separately from GitHub Actions.
- [Exact-head archive staging script](stage_vixen_archives.py): run with `--repo <clean-product-checkout> --out <archive-directory>` to package the verified scoped stack and HTTP payload. **Only after independent HTTPS source verification**, add `--https-witness <full-surface-directory> --served-receipt <verified-source-receipt.json>` to stage one final screenshot ZIP. This script never deploys or promotes an archive by itself.
- [Engineering qualification ledger](ENGINEERING_QUALIFICATION_RECEIPT.md): latest point-in-time SHA, historical RED run IDs, known defects and integration hold.
- [Historical RED forensics registry](HISTORICAL_RED_REGISTER.md): independent ZIP SHA-256/size, source-bound image inventory, false-loading-frame finding, and four-profile Folios before/after observations; failed archives remain in CI.
- [Unfilled final-only custody template](FINAL_EVIDENCE_RECEIPT_TEMPLATE.md): required exact served SHA, Actions artifact ID, archive hash, route coverage, retention and Folios pixel evidence. **Not a final admission.**
- Historical RED archives and local HTTP sources are explicitly excluded from the accepted final screenshot archive. `retention-days: 30` applies to generated visual and full-stack CI artifacts.

## Release and adjudication status

HUMAN REVIEW PENDING. **No #1744 PREPARE or DEPLOY action from this branch.** Product-branch integration is operator-authorized **only after exact-head engineering and visual qualification**; independent human artistic adjudication remains reserved. The review branch is never merged as product code.

OPERAHOUSE ≠ OPERA ≠ PERFORMER.
Khona‌lit-po · Tauric Diana · ⟐SAC[X6ZNK5NO51]
