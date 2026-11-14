## Rulefield-as-Rule type HOLD

The amendment receiver now uses [type_system.mjs](../rulefields/type_system.mjs). Every `PROPOSE_RULE` must declare `formal_rule.state_space`, `formal_rule.guard`, `formal_rule.local_transition` and `formal_rule.observer`; direct `object_type: RULEFIELD` admission is held regardless of the surrounding prose. The receiver reports `HELD_RULEFIELD_RULE_TYPE_COLLAPSE` and includes the diagnostic in the full operator disclosure. Specifying a typed child only qualifies a *proposal*, never source independence, novelty, production permission or scientific closure. [Type crosswalk](../rulefields/type_assessment/TYPE_ASSESSMENT_ROD0002.md).

# 𝌋 Rulefield Amendments — Kiki Receiver and Scientific Resynthesis

**Version:** \`td613.rulefield.amendment-packet/v1\`  
**Authority reference:** \`SAC[X6ZNK5NO51]\` · **Covenant:** Khona‌lit-po (U+200C retained)  
**Operator authorship / scientific closure:** RESERVED · **Protected Experiment B:** HELD.

The **amendment packet** is how any authorized reader—Kenough/Antigravity, Amari, the human operator, a trained research assistant or another LLM—returns *proposed* new relations, rewritten local rules, projections, predictions, geometries, causal consequences, observer questions, counterexamples and experiment designs.

The packet is **data**. Its text is never interpreted as code or trusted instructions by the receiver. The receiver writes staged review documents, never silently updates historical rule files, the operator's priority queue or sealed experiments.

## Human-facing outputs and authorization protocol

Every successful `sync` now generates four outbox siblings: `.review.json` and `.review.md`, plus `.disclosure.json` and `.disclosure.md`. The disclosure is a deterministic, complete-known-information projection of the exact packet and receiver review, with Light / Medium / Heavy reading depths and full raw JSON appendices. See [operator guide](../operator/OPERATOR_GUIDE.md) and [disclosure contract](../operator/DISCLOSURE_PROTOCOL.md). Missing sources, unknown future effects and unavailable exact patch sets are explicitly surfaced, never converted to approval. A [separate human decision](../operator/templates/HUMAN_AUTHORIZATION_DECISION.md) is a future event; typed names and authority-reference strings are not signatures. The current receiver cannot apply or adopt rules.

    node scripts/rulefield-operator.mjs disclose RF-AP-20261107-NEW.json
    node scripts/rulefield-operator.mjs decision-template <packetid>--<digest>

Operator intake for a returning zip: `python3 scripts/rulefield-intake.py verify /path/to/handoff.zip` then `stage` for quarantined comparison. No auto-copy into canonical files.

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
- [\`hooks.json\`](hooks.json): ten deterministic lifecycle hooks for LLM and tool orchestration.
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

### Executable finite experiment fields

A proposal can include `experiment`, in addition to its research hypothesis, source lineage, falsifier and competent null. Allowed engines:

```json
{
  "engine": "FINITE_STRING_MULTIWAY",
  "initial": "AA",
  "rules": [{"id":"R","from":"A","to":"B"}],
  "depth": 2,
  "maxPaths": 100,
  "maxLength": 8
}
```

Also supported:

- `FINITE_CRITICAL_PAIRS`: the same finite rewriting fields plus `horizon` (0–4). Only **overlapping string redexes** are counted as critical pairs; disjoint branch pairs remain separately recorded by the lab.
- `ELEMENTARY_CA`: `rule` (0–255), `width` (5–61), `steps` (1–48), optional `seed`, `perturb`, and `boundary` (`periodic` or `zero`).

`inspect` and `sync` evaluate **only these allowlisted bounded functions**; the packet cannot supply executable JavaScript or network calls. The review records `scope=EXECUTED_LOCAL_FINITE_SOURCE_FREE_MODEL` when an experiment actually runs, retains event/endpoint/entropy evidence and still marks the **scientific proposal** as staged and unresolved. A bounded computation is evidence about the declared finite model, not proof of an independent physical or social observation.

For unimplemented WolframModel, external NetLogo, protected Flight or long-horizon experiment requests, preserve a proposed recipe and add/consult [`../ROADMAP.md`](../ROADMAP.md). Do not fabricate a native result.

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

## Prior-entry duplicate admission (new, source-free)

A proposed Rulefield entry that repeats an existing rule, crossing or priority heading cannot pass as a new discovery. The receiver compares against the current 596 rules, 88 crossings, 70 operator priorities, and earlier proposals within the same packet. `EXPLICIT_ID_COLLISION` and `EXACT_EXISTING_ENTRY` / `EXACT_INTRA_PACKET` cause `HELD_EXISTING_ENTRY_DUPLICATE`. High lexical overlap or an operator/agent declared potential match causes `HELD_POSSIBLE_ENTRY_OVERLAP`.

The receipt contains exact source IDs, matched passages, match method and the boundaries of similarity inference. The full human disclosure contains this information at all reading depths. Existing rule IDs in `anchors` are lawful references and do not trigger the new-entry gate. The proposed `duplicate_disclosure.suspected_existing_ids` field can preserve manually identified possible paraphrases; the detector does not certify the originality of any unflagged proposal.

The human can reference the previous result, request a difference analysis, propose a source-bound revision, retain a distinguishable research branch, or decline. **HELD blocks staged synthesis and adoption, never free investigation or recording a failed assay.** Resolve with a new packet and new review/dossier; no string substitution or copied human authorization can bypass the HOLD.

## Nonexclusive Rule and Rulefield role declaration

The prohibition against mistyping a **field-only input as an executable rule** does **not** prohibit the same historical object from legitimately holding both roles. The receiver accepts candidate `PROPOSE_RULE` with declared `roles:['RULE','RULEFIELD']`, distinct `role_contexts.execution` and `role_contexts.inquiry`, `cross_role_authority_transfer:false`, and complete `formal_rule` state/guard/update/observer. It still emits a review-only candidate and leaves canonical source intact. Reused IDs, unknown source refs and missing context trigger `HELD_RULEFIELD_RULE_TYPE_COLLAPSE`. [Role multiplicity v1](../rulefields/type_assessment/ROLE_MULTIPLICITY_ROD0002.md).
