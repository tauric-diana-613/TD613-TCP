# OOP-01 engineering review — release HELD

Commission TD613-VIXEN-OOP-REPARATIVE-CLOSURE-20261121.
Track A base main f1288ec690c5d440a356f9db413a289e404f40b3.
Product/audit baseline 58056016fd3aec55a108532b30e3d5119c785e7d remains unchanged at reentry.

The two #1744 predicates now execute the trusted workflow-revision verifier before checking out product code. Arbitrary successful jobs have no qualifying authority. One named job must contain all six completed successful substantive steps, linked to the same GitHub run and current PR #1730 source/branch/repository. Dispatch requires equivalent named execution; standard dispatch cannot qualify. QA04's successful step records the HOLD only; no human acceptance is awarded.

The dedicated job remains inside td613-ci.yml. Exactly four workflows remain. It executes source contracts, real historical-source/native qualification, desktop browser geometry, dedicated iPhone emulation, integrated G8 and downloaded/extracted G5 replay, and an explicit QA04 HOLD receipt. Historical acquisition is GitHub read-only of the existing authorized repository at the pinned SHA, outside product. A missing checkout fails the required step; nothing silently skips. No provider acquisition occurs.

## Compatibility and activation

Main predates the product's Vixen test scripts. This job is deliberately limited to the Vixen product and repair PRs or explicit vixen-qualification dispatch. Track B supplies the tested source/browser runners. The product track carries the identical job block and the added product-base PR trigger to permit independent engineering CI before integration. The gate still rejects repair-branch execution as operational qualification of #1730. Human review must reconcile both workflow diffs at integration.

Owner authorization required, in order: approve the governance diff and its named witness scope; authorize merging Track A to main; separately adjudicate and authorize integrating Track B into the product branch; reconcile source divergence with main without rewriting research histories; run the final exact product source through the named job. Revalidate gate policy against real job metadata. Only a separate subsequent explicit operator PREPARE/DEPLOY authorization may use #1744. This commission issues neither gesture. No merge/deployment was performed.

Rollback: revert this governance commit through reviewed PR, retaining receipts and all four workflow surfaces. A rollback reopens OOP-01 and broad qualification must remain HELD; the older count predicate cannot substantiate broad qualification.

## Trigger diagnosis

Observed: main's CI PR filter included only main; nested BRAID PRs target research branches and therefore do not satisfy it. Dedicated product geometry/iPhone predicates on the audited product workflow required the exact product head ref, so same-SHA G8 PR execution did not execute them. PR #1730 currently reports mergeable=false; GitHub documents that pull_request workflows do not run while conflicts exist. This supplies an observed conflict boundary explaining missing events, but the connector does not expose historical webhook delivery/actor-token evidence. Earlier event absence cannot be uniquely attributed to a token mechanism.

GitHub documentation: https://docs.github.com/en/actions/how-tos/troubleshoot-workflows and https://docs.github.com/en/actions/concepts/security/github_token . Token-induced events have additional restrictions; changing to pull_request_target to execute product code with privileged authority is intentionally outside this repair.

Branch protection inspection returned 403 Resource not accessible by integration. Rulesets listing returned an empty list. Protection absence has not been established.

Local policy fixtures include unrelated successes, missing geometry, skipped original qualifier, held qualifier, skipped iPhone, stale SHA, wrong PR/branch, forged/no execution, cross-run jobs, insufficient dispatch and complete scoped execution. These are policy regression fixtures, not actual Actions witness receipts. Live listener remains unchanged until a human-authorized main merge.
