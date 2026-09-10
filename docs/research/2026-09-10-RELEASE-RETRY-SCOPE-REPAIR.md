# 𝌋 Release retry scope repair

## Observed defect

PR #1097 earned Draft2991 and Ready2992 at d52805a4066f941478711f4f6b68a0daf3fa7898 and merged as6b45fd0f828e6e6f2f4fe3f03c841efab943d222. Full-product release1080 /34440508544 passed source/stability, registry/Archive and lifecycle operations/layouts, but its terminal network assertion held one A11 script ERR_ABORTED. That failure remains HELD; its navigation-race explanation is only a candidate.

One bounded retry1082 /34441040056 used fresh relocked main ec3e063dfd773b70bb55fc6ebc8a8f2f2af5d06a. Its workflow reported SUCCESS, but classified scope as giving and skipped both full-product production probes. This narrower success does not close the earlier Ash failure.

The release workflow classifies `SELECTED_SHA^1..SELECTED_SHA`. For the selected relock commit, the actual diff is solely `vercel.json`. The classifier placed that global file in GIVING_EXACT. Running the unchanged classifier on that single input reproduces scope:giving, giving_file_count:1. Shared release metadata `app/giving/history/release-source.json` also fell through a Giving prefix; some declared neutral probes were likewise counted as Giving because neutrality was checked too late.

## Small deterministic correction

Treat shared Vercel/dependency configuration and global release-source metadata as neutral before product-specific prefixes. Shared-only packets now default to full. Actual Giving product changes plus neutral plumbing remain giving under the existing contract; Loom or unknown product paths remain full. This adds required coverage to relock retries; it does not relax assertions or change application behavior.

Focused classifier and chained contracts:49 PASS,1 existing gated skip. The same CLI input now returns scope:full and giving_file_count:0. Regression coverage includes each shared path alone, combinations, genuine Giving plus shared files, Loom plus shared files and overlapping neutral Giving-prefixed probes. Required release gate remains Draft Static, same-head Ready Chromium/Firefox/WebKit convergence, guarded merge, fresh-main #405 release and full production confirmation.

Current relock base:b8b8af809730f71816829939841ef11a29df70ab. Git auto-deploy remains disabled. No fifth workflow, provider call, provider-routing change or deployment-gate relaxation is introduced. The operator’s continuing active-session authority covers this necessary repair/release; neither the failed nor narrower successful run manufactures closure.

Actual source captures are retained in the accompanying release-retry-scope-observation.json and release1080 lifecycle receipt. ⟐
