# 𝌋 Living Rulefield — Agent-Neutral Custody and Amendment Relay
**Succession:** PR #1734 (DRAFT), founded byte-exactly on Living Rulefield PR #1722; Atlas counterpart PR #1735 has a separate source-free research history.
**Covenant:** Khona‌lit-po (literal U+200C) · **Authority reference:** ⟐SAC[X6ZNK5NO51] · **Human closure:** RESERVED.
**Operator ≠ amendment author ≠ receiver ≠ adjudicator ≠ canonical implementer.**
This contract is written for any executing agent (Antigravity, Codex, Gemini Argon, Amari, or another), without implying that all agents have identical connected tools.

## A. Handoff source custody — before research
1. Download the GitHub Actions artifact for the specific **exact PR HEAD**; it contains one inner `TD613_Rulefield_Succession_Handoff_<SHA>.zip`. Archive names are advisory: validate `RULEFIELD_HANDOFF_MANIFEST.json` and every SHA-256. Never substitute an older archive just because its name is similar.
2. Verify with `python3 scripts/rulefield-intake.py verify <bundle-or-inner-zip>` in a **trusted checkout**. The manifest declares its origin SHA, full tracked Rulefield file list, supporting executable scripts/tests, and scientific holds. A manifest proves only the correspondence of retained bytes to a source claim; an external retrieval witness is needed to authenticate the claim independently.
3. Extract into an **isolated, unprivileged, source-free workspace**. Run `node --test tests/rulefield-*.test.mjs`, `node scripts/rulefield.mjs validate`, `node scripts/rulefield-lab.mjs suite` and the portable Python intake test.
4. Treat all `packages/rulefield/sources/` as historical antecedents, and the baseline record `rulefields/research/BASELINE_PR1722_EXACT_BLOB_CUSTODY.json` as the 99-blob immutable inheritance test. The baseline is the **unmerged research branch PR #1722**, not a claim of adoption into `main`.

## B. Agent creates a prospective amendment
5. Read `packages/rulefield/operator/AGENTS.md`, `OPERATOR_GUIDE.md`, `IN_CHAT_DECISION_PROTOCOL.md`, `packages/rulefield/amendments/RECEIVER.md` and the retained nomenclature/type documents **before** generating a packet.
6. Use the safe `node scripts/rulefield-amend.mjs template` to inspect the format; `node scripts/rulefield-amend.mjs baseline` supplies the registry digest **from the actual receiving target checkout**. Never copy the placeholder digest or claim that a supplied authority-reference string represents an authenticated human signature.
7. Create at most **64 typed proposals per packet**, each with source references, explicit existing rule/crossing anchors, falsifier, competent information-matched null, uncertainty ceiling, known missing evidence, and any separately distinguishable roles `RULE`, `RULEFIELD`, `PRIORITY`. Nested roles are allowed when typed and authorized; a role-name alone transfers no authority.
8. Particularly for Ninth-Order research, record the difference among static capability existence, route reachability, shared time-window assembly, and coalition-level task feasibility; retain the single-interval Helly condition, split-window counterexamples, holonomy backtracking blindness, headcount-flow alternatives, and externally untested `sqrt(3)/2` dynamical hypothesis.

## C. Receiving and relaying without automatic integration
9. Return a **new source-linked ZIP** and accompanying proposal packet to the operator or designated receiving agent. Preserve original archive, packet content digest, model identity as **reported**, declared test results as **executed or unexecuted**, and any dissent. Never overwrite the baseline ZIP or mutate its custody receipt.
10. In a **trusted local checkout**, use `scripts/rulefield-intake.py verify` then `stage` in a separate quarantine directory. A changed registry digest, invalid provenance, unknown source/alias, unauthorized operation or malformed packet results in a disclosed HOLD or rejection. Do not silently rebind someone else's proposal to a new base.
11. After human review explicitly authorizes inspecting a particular packet, use `node scripts/rulefield-amend.mjs inspect <name.json>` for no-write inspection. When appropriate, run `sync` to produce content-addressed `.review.json/.md` and `.disclosure.json/.md` **in the trusted checkout**. These are research artifacts, not a grant of adoption.
12. A separate **content-bound human decision** may authorize staged synthesis. Any later proposal to alter canonical rules, priorities, or release state requires another inspected diff and distinct approval. Under the present directive **no automatic modification, PR merge, deployment, sealed Flight access, or scientific closure** follows from an AI handoff, a ZIP, an audit result, or this document.

## D. Findings inherited from Atlas PR #1735 (source-linked, not merged)
The Ninth-Order completed Atlas research head is `19a2170e802ab6bf010b2b68f7c49862c8422b29`; exact non-authoritative source blobs:
- finite generalization: `packages/rulefield/lab/ninth_order_generalization.mjs` SHA-1 `75970cee450d71c6c29ba49b99286795e9e84545`
- test: `tests/rulefield-ninth-order-generalization.test.mjs` SHA-1 `1ef07ad1e69ebbe527d6e999c13856774a244e94`
- postexecution audit: `dossier/ATLAS_AFTER_HOURS_PR1735_DOLLHOUSE_POSTEXECUTION_AUDIT.md` SHA-1 `9b1579110121e25ed809ef82c0107ba9a5af3537`

The 1,512 synthetic grid records 625 fast-radial configurations with infeasible collaboration. The implemented mathematical correction is that **`rank(M)=5`**, the original stipulated Alpha row mask has rank 4, and neither alone certifies collective feasibility. The native Dollhouse audit ran five specialists and retained **HELD**; its injected negative controls are not evidence of real-world institutional violations.

**Rulefield admission:** these are new **PROPOSE_ASSAY**, **RECORD_COUNTEREXAMPLE**, or typed observation-proposal prompts, *not* canonical rules/priority adjustments. Preserve the 596 historical records, 70 priorities, 86 proposed rulefields, and their operator holds without retroactive renumbering. No automatic Tenth Order.

𝄐 Source carriage ≠ evidentiary promotion ≠ human authority · Sealed for review ⟐


## E. Corrected full-fidelity Ninth-Order receiving sequence (2026-11-10)

A previous research handoff underrepresented the Gemini Argon commission with a short adjudication. Before accepting or forwarding a Ninth-Order amendment, the receiving agent must inspect **all four layers**: (1) historical immutable Wolframian source estate at `packages/rulefield/sources/wolfram-rule-atlas-20261107/`; (2) substantive candidate-specific research at `packages/rulefield/rulefields/research/NINTH_ORDER_ARGON_COMMISSION_RESEARCH_ESTATE.md`; (3) the separately preserved Candidate V proposed code and tests in `ARGON_NINTH_ORDER_CANDIDATE_V_ORIGINAL_CODE_TRANSCRIPTION.mjs` and `ARGON_NINTH_ORDER_CANDIDATE_V_ORIGINAL_TESTS_TRANSCRIPTION.md`; (4) corrected bounded executable modules `ninth_order_confluence.mjs`, `ninth_order_generalization.mjs`, and `ninth_order_hidalgo_stokes_research.mjs` with their full suite of custody, mathematical and trial tests.

**Do not flatten proposal into adjudication, or confuse an editorial transcription with a cryptographically verified original.** Preserve candidate origin, source text, objection, mathematical repair, falsifier and proposal eligibility separately when handing to Antigravity, Codex, Gemini Argon or another agent. This research can suggest Rulefield amendments but grants no autonomous priority migration, typing change, CI-waived release, archive overwrite or human final closure. The Rulefield exact-HEAD portable builder includes all tracked `packages/rulefield/` files and scoped `tests/rulefield-*.test.mjs` files; the verified extracted archive runs them again.
