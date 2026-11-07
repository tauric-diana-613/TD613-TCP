# 𝌋 Rulefield Amendments — Kiki Receiver and Scientific Resynthesis

**Version:** \`td613.rulefield.amendment-packet/v1\`  
**Authority reference:** \`SAC[X6ZNK5NO51]\` · **Covenant:** Khona‌lit-po (U+200C retained)  
**Operator authorship / scientific closure:** RESERVED · **Protected Experiment B:** HELD.

The **amendment packet** is how any authorized reader—Kenough/Antigravity, Amari, the human operator, a trained research assistant or another LLM—returns *proposed* new relations, rewritten local rules, projections, predictions, geometries, causal consequences, observer questions, counterexamples and experiment designs.

The packet is **data**. Its text is never interpreted as code or trusted instructions by the receiver. The receiver writes staged review documents, never silently updates historical rule files, the operator's priority queue or sealed experiments.

## Start here: actual commands

At the complete repository root, with Node.js 22:

\`\`\`bash
node scripts/rulefield.mjs validate
node scripts/rulefield-lab.mjs suite
node scripts/rulefield-amend.mjs help
node scripts/rulefield-amend.mjs baseline
node scripts/rulefield-amend.mjs init RF-AP-20261107-001
# Edit packages/rulefield/amendments/inbox/RF-AP-20261107-001.json
node scripts/rulefield-amend.mjs inspect RF-AP-20261107-001.json
node scripts/rulefield-amend.mjs dry-run
node scripts/rulefield-amend.mjs sync
\`\`\`

The built-in \`init\` command generates a **fresh baseline SHA-256** from the actual canonical Rulefield file. A copied schema template contains a placeholder instead; never submit the placeholder as if it were a verified digest.

**Output:** \`outbox/<packet_id>--<digest-prefix>.review.json\` and \`.review.md\`, where the stable content digest is the packet fingerprint. Repeating the same packet is idempotent. Changing a packet without changing its identifier produces a *new* content-addressed review record, not an edit of the old review. A missing or stale baseline is held/rejected, not silently reconciled.

A folder alone does not monitor anything. \`sync\` is an **explicit on-demand command**; it is not a cron service, daemon, deployment, cloud event listener or autonomous merger. An external scheduler would require separate operator approval and authority scope.

## Contract and schema

The source files are:
- [\`schema.json\`](schema.json): typed JSON structure.
- [\`hooks.json\`](hooks.json): nine deterministic lifecycle hooks for LLM and tool orchestration.
- [\`receiver.mjs\`](receiver.mjs): local receiver implementation; never evals or imports packet source.
- [\`templates/amendment.template.json\`](templates/amendment.template.json): worked example with a *deliberately unbound* baseline.
- [\`../rulebook/LLM_QUICK_START.md\`](../rulebook/LLM_QUICK_START.md): historical source recovery, connector routing and evidence classification.
- [\`../ROADMAP.md\`](../ROADMAP.md): ambitious tools and unearned future claims, staged behind explicit readiness criteria.
- [\`../lab/tool_registry.json\`](../lab/tool_registry.json): public Wolfram and complexity science resources.

### Amendment operation kinds

\`PROPOSE_RULE\`, \`PROPOSE_RELATION\`, \`PROPOSE_PROJECTION\`, \`PROPOSE_PREDICTION\`, \`PROPOSE_GEOMETRY\`, \`PROPOSE_CONSEQUENCE\`, \`PROPOSE_ASSAY\`, \`RECORD_COUNTEREXAMPLE\`, \`REQUEST_ALIAS_ADJUDICATION\`, \`REPAIR_INTEGRATION\`, \`PROPOSE_AMBIANCE_OBSERVER_ASSAY\`, \`REFRACT_RULE\`, \`DOCUMENT_FAILED_ASSAY\`.

The receiver recognizes explicit \`anchors.rules\`, \`anchors.crossings\`, \`anchors.queue_ranks\`. Unresolved IDs are not equated to convenient names: they are put in a HELD review issue.

### Required scientific commitments

Every consequential proposal specifies:
1. A concrete hypothesis, original source locator, claim type and uncertainty.
2. Its candidate local rewrite, observer projection, history equivalence, branch order or geometry (as applicable).
3. A **falsifier**: a conceivable observation that would make the proposed advantage or mechanism fail.
4. A **competent null** given the same information, source access, temporal constraints, scheduler and resources.
5. A **negative control** where possible, such as the same mathematical kernel under different ambiance.
6. Distinct status of intended experiment versus actually executed result. A toy event history is a synthetic observation only within its own declared model.

A source-free assistant may propose novel physics analogies, but it may not reclassify them as empirical exteriority. It may generate semantic refractions inspired by Collins, Dotson, McKittrick, Sedgwick, Butler, Berlant, Caro, Glissant or Virilio, but these intellectual traditions are not a model's built-in endorsement or a substitute for human knowledge.

### NKS computational pattern

A useful mathematical amendment looks like this:

\[
(S_t,\ r,\ \phi,\ \pi_{\rm obs})\ \longrightarrow\ 
\{\,(S_{t+1}^{(i)},\ e_i,\ h_i)\,\}_i
\]

Define initial states, rules, redex matches, update scheduler, event-instance identities, observation function and stopping bounds. Enumerate **all enabled branches** within the declared finite model. Keep different event histories even when they reach the same state. Identify overlapping critical redexes separately from independent commuting operations; record joinability only over a stated horizon, unless distinct terminal normal forms prove nonjoinability for the fully specified rule set.

Then ask: which variation is attributable to the rule, the observer's projection, the institutional authority gate, or the temporal evidence path? Which result remains after an information-matched comparator?

The native source-free lab provides a bounded starting point:
\`\`\`bash
node scripts/rulefield-lab.mjs diamond
node scripts/rulefield-lab.mjs critical
node scripts/rulefield-lab.mjs ca 30
node --test tests/rulefield-nks-lab.test.mjs
\`\`\`

For a *native Wolfram* comparison, use the public Function Repository's \`MultiwaySystem\` / \`WolframModel\`, with \`IncludeEventInstances\`, unmerged histories and branch-pair properties where applicable. This repository has a reference engine; **a Wolfram kernel run must be separately executed and witnessed**. Consult \`lab/tool_registry.json\` and \`ROADMAP.md\`.

### Parsing and safe failure

\`receiver.mjs\` enforces a current canonical registry baseline, exact permitted operation kinds, a source-free authority contract, a maximum 64 proposals per packet, bounded references, source class vocabulary, an explicit falsifier and competent null requirement for a review without missing-specification flags. It reports unresolved anchors, unregistered evidence or omitted controls, rather than filling them in.

Local JSON parsing does not authenticate the identity or intent of an author. GitHub reviews, comment receipts, internal hashes, rendered diagrams and automation logs have separate evidence ceilings. Packet-provided URLs, file paths or code blocks cannot grant themselves connector privileges.

**Draft workflow:** \`INBOX → VALIDATE → SOURCE/WARRANT REVIEW → NKS BRANCH STAGING → COUNTERFACTUALS → OUTBOX RECEIPT → HUMAN REVIEW → SEPARATELY AUTHORIZED CHANGE\`.

Never claim an earlier version of a file was edited when a new successor packet was created. Never imply that a green CI test for one commit validated a different revision. Preserve all failed and tied hypotheses as first-class research records.

## A minimal cross-thread handoff

An agent joining a new conversation should request or locate the \`packages/rulefield/\` ZIP or GitHub path, read \`AGENTS.md\`, \`rulebook/LLM_QUICK_START.md\`, \`lab/tool_registry.json\`, and \`amendments/hooks.json\`, then inspect the user's prompt and available source corpus. It should compose one or more source-free amendment packets and use \`init\` and \`sync\` only if Node and the repo are available. Otherwise, return schema-compatible draft JSON with \`BASELINE_UNVERIFIED\`, not a fake accepted receipt.

**Success = an insightful, falsifiable, source-grounded proposal with its negative outcomes and uncertainty still visible.** It does not require granting the proposal scientific authority.

𝄐 Khona‌lit-po · Unmerged, observable, amendable ⟐
