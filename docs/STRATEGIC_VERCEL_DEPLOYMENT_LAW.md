# Strategic Vercel Deployment Law

𝌋‌ U+10D613

Vercel deployment remains authorized as a governed release witness, never the default development loop.

```text
branch work ≠ deployment requirement
local CI ≠ public release
green packet ≠ automatic deployment
merge ≠ automatic deployment
cost control ≠ evidentiary weakening
repeating the same browser matrix after deployment ≠ stronger evidence
```

## Canonical route

1. Develop and validate without Vercel deployment.
2. Complete the packet on an exact pull-request head.
3. Require scope-aligned three-engine evidence before merge through `TD613 Consolidated Validation`.
4. Merge the exact green head and identify the exact current `main` commit.
5. Receive one explicit operator release gesture in chat.
6. The assistant/Codex invokes issue #405 with that exact SHA.
7. One Vercel deployment is attempted.
8. When the bounded Git fallback is used, the one deployable release commit is followed immediately by a relock commit before any production waiting or browser observation begins.
9. The deployed application bytes are compared with the authorized packet.
10. The authorized source receipt must remain stable through a bounded stale-queue window, then exact application bytes are reconfirmed.
11. One scope-aligned bounded Chromium production confirmation observes the released surface: Giving for Giving-only packets, or desktop/mobile and Ash lifecycle continuity for full-product packets.
12. A final source-receipt guard confirms production still belongs to the authorized packet before the release is sealed.

```text
operator authorization → assistant/Codex execution → one Vercel deployment
one deployable fallback commit → immediate relock → production observation
```

The operator is not required to operate Vercel, GitHub Actions, or deployment plumbing. The operator authorizes. The assistant/Codex transports that authorization through the governed conduit, executes, observes, relocks, and reports. Relay identity does not create release authority.

## Evidence placement

The costly cross-browser proof belongs before merge, where a defect can still stop promotion without creating a public release.

```text
Giving-only premerge authority = Giving Chromium + Firefox + WebKit
full-product premerge authority = full-product Chromium + Firefox + WebKit
Giving-only production confirmation = one Giving Chromium witness
full-product production confirmation = one Chromium desktop/mobile witness + Ash lifecycle observation
```

The premerge witness must cover every principal journey affected by the classified packet, plus static truth, reduced motion, accessibility-relevant controls, and the relevant generation contracts. A Giving-only diff runs the common release membrane, Giving contracts, and the Giving export journey across Chromium, Firefox, and WebKit; it does not invoke Ash, Dome-World, or Flow-Core product suites. A full-product diff invokes the full Ash, Dome-World, Flow-Core, and related matrix. Classification fails closed to the full-product witness whenever any changed application file falls outside Giving.

The production confirmation follows the same classification. Giving-only releases run the bounded Giving Chromium probe and do not start Ash. Full-product releases retain the bounded registry, Archive, desktop/mobile, and Ash lifecycle observation. Production verifies deployment identity and a bounded live consequence path; it does not replay the entire cross-browser estate.

This separation preserves evidence while avoiding repeated browser downloads, duplicated local servers, repeated fixture construction, and parallel workflows proving the same source packet.

## Cost and attempt ceiling

The normal ceiling is one deliberate Vercel deployment per completed packet or release candidate. Additional deployments require a named deployment-specific defect, failed public-runtime observation, rollback verification, or a new explicit operator decision.

Ordinary branches, pull requests, and `main` pushes must not trigger Vercel.

```text
one authorization = one deployment ceiling
failed deployment ≠ automatic retry authorization
bookkeeping commit ≠ deployment reason
browser observation ≠ second deployment
```

## Executable lock

`vercel.json` disables Git-triggered deployment for every branch:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

A merge, push, green workflow, release-candidate label, or branch name cannot create a Vercel deployment.

## Assistant/Codex release conduit

The permanent conduit is GitHub issue **#405, “TD613 Vercel Release Gate.”** After explicit operator authorization in chat, the assistant/Codex posts:

```text
/td613-vercel-release PRODUCTION <40-character-current-main-sha>
```

The release workflow accepts only:

- issue #405;
- the repository-owner identity **or the exact installed `chatgpt-codex-connector[bot]` relay carrying an explicit in-chat operator authorization**;
- the exact current `main` SHA;
- the named `PRODUCTION` target;
- one mutually exclusive credential route;
- one deployment invocation.

The allowlisted chat relay is a transport mechanism, not an independent operator. Its presence cannot substitute for the operator gesture, widen the target, choose a different SHA, open a closed release without authorization, or bypass any later release check. No wildcard bot identity, generic GitHub App identity, or arbitrary collaborator may inherit this conduit.

The issue comment is an execution mechanism used by the assistant/Codex, not a task transferred to the operator.

## Credential routes

The **direct token bridge** is preferred. When `VERCEL_TOKEN` is present, the gate links the existing project, pulls the production environment, builds once, and invokes one prebuilt production deployment.

When the token bridge is absent, the gate may use the repository's **bounded Git fallback**:

1. begin only while `git.deploymentEnabled` is `false`;
2. materialize the exact-source release receipt;
3. change only the Vercel Git deployment lock to `true`;
4. create and push one transient deployable release commit;
5. immediately restore the lock to `false` in a second non-deployable commit, before waiting for Vercel settlement or installing a production browser;
6. observe exact application-content parity against the authorized source packet;
7. require the source receipt to remain unchanged through the bounded stale-queue stability window;
8. reconfirm exact application bytes after that window;
9. run the scope-aligned production witness and perform one final source-receipt guard.

```text
direct token bridge OR bounded Git fallback
credential route count = 1
deployment count ceiling = 1
fallback deployable commit count = 1
fallback open-gate duration = one commit, not one workflow
fallback application-tree drift = none
relock push with deployment disabled ≠ second deployment
```

The fallback may not leave an open gate while production observation runs. A delayed Vercel webhook, build queue, status check, browser install, browser witness, or evidence upload therefore cannot cause later `main` pushes to inherit deployment authority.

The exact-source receipt is deployment metadata used to distinguish the authorized packet from a stale queued deployment. It grants no custody, authorship, human-evidence, or program-closure authority.

The fallback may not alter application code, custody state, API allocation, source artifacts, or the selected source packet. Its transient commits exist only to bind the source receipt, admit one deployment, and close the deployment lock.

## Stale-queue defense

Vercel status metadata is useful evidence but cannot outrank served production bytes. A delayed or missing GitHub `Vercel` status context must not keep the deployment gate open.

After production first matches the authorized source packet:

```text
authorized source receipt = stable through bounded queue window
→ exact application bytes = reconfirmed
→ scope-aligned production witness
→ post-witness source receipt = still authorized packet
```

Any later stale deployment that replaces the authorized receipt holds the release. Production cannot be sealed from a momentary match that is displaced during the stability window.

## Independent relock safety

`vercel-relock-safety.yml` remains separate because its authority differs from validation and deployment:

```text
independent relock safety
→ contents write permitted only to close a stranded lock
→ deployment count = 0
→ no browser installation
→ no Vercel invocation
```

Combining this membrane into the validator would widen validator write authority. Deleting it would leave an interrupted fallback capable of stranding the lock open. It therefore remains one of the four durable workflow surfaces.

## Required terminal receipt

A successful receipt must name:

```text
source_packet_commit = <40-character-current-main-sha>
deployment_count = 1
exact_source_content = PASS
stale_queue_stability_window = PASS
post_witness_source_guard = PASS
premerge_chromium_firefox_webkit = REQUIRED_AND_PASSED_BEFORE_MERGE
validation_scope = giving OR practice OR full
production_giving_history = PASS OR NOT_APPLICABLE
production_practice_fixture = PASS OR NOT_APPLICABLE
production_chromium_desktop_mobile = PASS OR NOT_APPLICABLE
ash_lifecycle_deployed_observation = PASS OR NOT_APPLICABLE
application_tree_drift = none
git_auto_deploy = disabled
```

Gate acceptance alone is not a terminal receipt. Deployment success does not become human empirical evidence, child-study authority, custody authority, future release authority, public-route promotion, or program closure.

## Final-cut convergence guard

A public release candidate must be the complete merge result rather than an older feature head.

```text
feature-head green ≠ final cut complete
merge-ref verification = required
exact deployed source packet = required
partial surface success ≠ whole-product release success
```

## Cache-epoch storage boundary

`td613.ash.cache-flush.epoch` is maintenance state used only to make one-time mass eviction idempotent. It remains outside Case Maps, receipts, Save Points, Capsules, source material, and user-authored content.

```text
cache epoch marker = permitted maintenance state
cache epoch marker ≠ case data
cache eviction ≠ IndexedDB deletion
cache eviction ≠ local-custody erasure
```

For A12–A15, graph-wide mass eviction remains reserved for A15 postclosure. A12–A14 use ordinary monotonic asset-version advancement only.

Sealed ⟐
