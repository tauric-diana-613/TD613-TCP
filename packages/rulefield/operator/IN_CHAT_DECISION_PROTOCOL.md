## ROD-0002 successor renderer

Run `node scripts/rulefield-docket2.mjs export` to generate three exact-digest artifacts: a complete Markdown review of 86 human original expressions and 70 historical priority positions, a full JSON with 26/31 type crosswalk, and a chat navigator with **ten simultaneous role bindings**. The assistant must show workstreams and meaningful original examples directly in-message; provide verified file links if available. Present five scoped operator decisions; a click sends a new user turn and never assumes merge or Flight authority. OD-02 academic labels remain HELD.

## ROD-0002 typed crosswalk decision

When presenting the successor docket, show concrete original IDs and corrected types for at least one model, assay, retained rule, derivative child and preserved broad field. Report **26 / 31 / 11 / 14** as overlapping assessment sets (not additive discoveries). Clearly disclose 559 legacy records still needing deeper assessment. Provide the full source assessment Markdown and JSON and make the decision actionable in-chat: accept the nonmutating projection, request a corrected mapping, or HOLD selected IDs. The human's OD-02 HOLD of academic title ratification persists. **Approval of a typed projection is not approval to rewrite 596 historical records or merge a branch.**

# 𝌋 In-Chat Operator Decision Protocol — Rulefield Operator Docket (ROD)

**Required user experience:** The assistant must present the meaningful change details **in the same chat response that asks for approval**. A ZIP and a GitHub link are supplements, not the decision interface.

## One source, multiple faithful views

Generate the `RF-OD-XXXX` dossier from the actual field seed, inherited queue and source hashes using `operator/docket.mjs`; never use a free-form recollection as the authoritative source.

**Light:** name, scientific status, exact source revision, pending decision, proposed changes, tested behavior, holds, explicit human-authority boundary. **Medium:** each workstream and scoped proposed consequence, contested names, at least 6 nontrivial examples with original wording and academic label. **Heavy:** all 80 original field expressions/labels, the 70 historical priorities, duplicate flags, source lineage and full JSON/Markdown.

The full appendix must be generated and linked **by an actually verified sandbox path or repository URI**. Do not assert a file attached when its bytes/path were not verified. Long lists may use an in-chat expandable or navigable view so that the human need not scroll through 80 items to find the decision, but must remain recoverable in-message, not only via external file.

## Conversation controls

When the host supports interactive controls, render 5 decision choices: **Approve provisional**, **Approve selected for review**, **Request revisions**, **Hold**, **Decline**. A user selection MUST send a new chat message containing `docket_id`, `docket_sha256`, `source_head`, `selected_IDs`, decision and scope; the assistant must not claim success before any later authorized GitHub mutation runs. Controls can use `GenUI.issueNewTurn` synchronously in a user click. DIL is a host rendering mechanism, not a rulefield machine source of truth.

For portable executors with no interactive UI, present the same decisions as copyable short replies and a text fallback. **Never require a browser or detached form** for the user to approve a review proposal in a live chat.

### No decorative controls

Every button must invoke a real user-turn or supported host action. A local checkbox/select is a preview until the user explicitly submits. Approval of a *research arrangement* is not approval of a future unknown code diff. A request to edit a specific label must specify the original ID and proposed correction and result in a new digest.

## At each consequential change

`Amari proposes → operator inspects Light/Medium/Heavy → operator chooses/edits → agent makes only separately approved changes → agent reports exact execution and limits.`

An agent is never allowed to summarize source-free novel science as established novelty, read its own draft as a signature, or suppress a duplicate HELD. No automatic canonical promotion or protected Flight release.

## Required machine fields

One docket payload includes:
- `schema,id,edition,source_head,registry_sha256,field_seed_sha256,lock_version,docket_sha256`;
- `proposed_changes[],review_issues[],decision_options[],unresolved_effects[]`;
- `historical_priorities[]` (70) and `rulefields[]` (80) with verbatim human expressions and academic labels;
- `groups[]` whose ID union covers all 80 fields exactly once; 
- `rendering.light`, `rendering.medium` and complete appendix;
- `authority` showing canonical changes and operator approval absent.

**Human comprehensibility must not depend on an LLM narrating invisible JSON.**

## Rulefield/Rule role multiplicity in human review

Do not present a forced choice between Rule and Rulefield. The **same historical object** may have a research Rulefield view and an executable Rule view, with no implicit authority transfer. In ROD-0002 disclose ten example qualified views, the ability to declare parallel roles on a prospective candidate and the exact separate scopes of execution and inquiry. This is a type-system distinction, not an automatic operator adoption or new scientific result. See `rulefields/type_assessment/ROLE_MULTIPLICITY_ROD0002.md`.
