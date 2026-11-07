# Detailed reviewer evidence for Emergence HQ

**Published at the operator's explicit subsequent instruction so the operator and Amari can review everything through GitHub.** Earlier records that describe these fixtures as confidential or withheld document the prior publication posture; that posture is superseded by [the commission supplement](commission-supplement.md).

The frozen tested candidate is 7b6b4887f646155ba62b5c1b7bc0afc382fcaa34. The parent [qualification report](../A-PFR0.1-qualification-report.md) carries the disposition A_PFR0_1_HELD_MATERIAL_DEFECTS. These are observed failures and bounded successes, not candidate repairs.

## Start here

- [Independent native challenge results](evidence/independent-native-results.json) and [the exact native challenge harness](reviewer-harnesses/independent-native.mjs).
- [Browser click/field outputs](evidence/browser-ui.json), [direct-call results](evidence/browser-direct.json), [scalar fixture and outputs](evidence/browser-scalars.json), [Node comparison](evidence/browser-node-byte-comparison.json), and [browser reproduction guide](BROWSER-REPRODUCTION.md).
- [Crypto falsifier capture](evidence/browser-crypto-falsifier.jpg) and [normal witness capture](evidence/browser-witness.jpg).
- [Environment](evidence/browser-environment.json), [console](evidence/browser-final-console.json), [runtime events](evidence/browser-events.json), [HTTP observations](evidence/http.jsonl), [source verification](evidence/source-verification.json), and [baseline run metadata](evidence/baseline-results.json).
- [Raw baseline-generated receipts](native-receipts/), and [source/CI connector observations](github-source-evidence.json).
- [Screenshot audit input](evidence/screenshot-audit-final-input.json), [final scoped audit receipt](evidence/screenshot-audit-receipt.json), [design commission](evidence/screenshot-design-commission.json), and [design conductor receipt](evidence/screenshot-design-receipt.json).
- [Original commission](commission-original.txt), [operator supplement](commission-supplement.md), and [every published reviewer file and hash](FILES.json).

## Reproducing native checks

Use an isolated checkout of the exact frozen candidate, Node v26.7.0 or record any runtime difference, and no package installation. The archived harnesses preserve the paths used in the actual run: from a review working directory they expect the checkout at work/frozen2, observations at work/evidence, and temporary baseline receipts at work/native-receipts. First run run-baseline.mjs to create the output directories, then independent-native.mjs. Copy those two harnesses to a work/ directory in that review working directory, or invoke their absolute paths while retaining that working directory. The candidate itself must remain unchanged.

The native challenge harness records a met_requirement boolean for each grouped check. Its process exit 0 means the harness finished collecting observations; **it does not mean the candidate qualified**. The 16 false checks in the archived run are the counterexamples, including repeated variants. Malformed S input yielding TypeError is explicitly classified as an unexpected error rather than successful security enforcement.

A short-path checkout on Windows may require Git core.longpaths=true, core.autocrlf=false, and LFS smudge/process disabled. Do not hydrate source archives to reproduce these synthetic checks. The static server harness exposes only the frozen HTML on loopback and has no mutation endpoint. Browser function probes do not replace actual graphical clicks; repeat the UI steps and retain new screenshots and console observations.

## Reading the acquisition history

The evidence directory retains preliminary and final captures and the initial failed receipt-write attempt. Raw section screenshots may contain a compositor transition or a viewport helper that did not apply. The curated captures in ../screenshots/ and their manifest identify the final visual atlas. The 390-pixel layout was separately measured through CDP; it is not a physical-device witness. The screenshot audit's provisional HELD result recorded the still-unwritten description phase; the later scoped receipt checks the completed description order. Neither receipt sees pixels or certifies aesthetics. The design conductor's candidate/refraction text is internal scaffolding, not an extra product, source assertion or empirical discovery. The finished artifact is [the atlas](../Screenshot-atlas.md).

Local path strings in the original logs identify the run environment. Historical review-PR receipts name the head and publication posture at the time they were captured; they do not replace the live PR's current head. This publication introduces no new scientific execution, source admission, deployment, merge, release or closure authority.
