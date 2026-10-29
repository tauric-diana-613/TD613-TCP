# 𝌋 TD613 · Experiment A Custody Gaps Analysis & Private Vault Architecture Proposal

**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po (`U+200C` preserved)  
**Authority:** Sovereign Operator Direct · Emergence HQ Independent Scientific Review  
**Operating Posture:** Princess Latifa · Wild Field Mode Active · `/plan OFF`  
**Classification:** Review-Safe Public Architectural Proposal (Confidential Vault Ingestion Handled Separately)  
**Governing Audit:** `TD613_Experiment_A_Architecture_Custody_Preservation_Audit_2026-10-29.md`

---

## 1. Executive Custody Status

Following independent source-and-archive inspection by Emergence HQ and Antigravity, all five core historical archives of Experiment A (`Latifa Preflight Lever`, `Flight-V0`, `Flight-R1`, `Postflight-W0`, and `Scientific Postflight`) are byte-verified and permanently secured ($181$ directory entries, $577,129$ aggregate bytes, $100\%$ SHA-256 match).

However, as identified in Emergence HQ's governing audit, **no single unified historical edition exists** that consolidates the byte-verified archives, originating operator commissioning records, human-readable walkthroughs, unmerged redpen adjudications, and loose-file multi-edition revisions.

This proposal formally itemizes the **six identified archival gaps** and defines the architecture for a private, operator-controlled **TD613 Experiment A Heritage & Architecture Vault**.

```text
challenge_corpus_state = STRICTLY_SEALED_AND_QUARANTINED
gate_e_disposition = HELD
empirical_exteriority_credit = 0
human_scientific_closure = RESERVED
issue_405_release_authority = CLOSED
experiment_a_scientific_status = CAPABILITY_REST_ACCEPTED_DO_NOT_REOPEN
```

---

## 2. Identified Archival Gaps

### Gap 1: Originating Operator Instructions & Succession Grants
* **Deficit:** The foundational governance charters (including `TD613_Manifest_Emergence_HQ_Protocol_Succession_R2_2026-10-28` and multiple interim activation handoffs) were delivered through conversation sessions and runtime mounts.
* **Archival Impact:** These originating instructions are **not among the internal contents of the five core archives**. While archive receipts contain proxy summaries of operator authority, a summary field is not an authentic legal instrument or originating document.
* **Remediation:** Consolidate all 12 raw operator directives and signed charter documents into `00_GOVERNANCE_AND_COMMISSIONS/` within the private vault.

### Gap 2: Human-Readable Walkthrough Continuity
* **Deficit:** Antigravity and Emergence HQ generated 22 comprehensive, narrative walkthroughs covering Preflight, Flight, Postflight W0, and Wild Field architecture (e.g., `experiment_a_preflight_lever_walkthrough_v1.1.md`, `experiment-a-w0-walkthrough.md`, `arewedoneyetwalkthrough.md`, `experiment_a_postflight_wild_field_architecture.md`).
* **Archival Impact:** These narrative accounts live in local scratch storage and the private operator supplement (`media_1793303991243_e59d9e7d.zip`), but were **not bundled into the original public witness ZIPs**. Without these documents, external auditors see machine receipts without understanding the human cognitive journey.
* **Remediation:** Archive all 22 narrative walkthroughs in `02_OPERATOR_WALKTHROUGHS/` with cryptographic crosswalks to their corresponding machine receipts.

### Gap 3: Unmerged Retrospective Evidence & Redpen Chains (PR #1606)
* **Deficit:** Pull Request #1606 preserved 26 retrospective evidence files, native capability execution traces, and independent redpens. Because PR #1606 was closed unmerged following independent redpen review `5704109031`, this material does not exist on `main`.
* **Archival Impact:** Relying on unmerged GitHub PRs or temporary conversation attachments poses long-term retention risks.
* **Remediation:** Ingest the complete PR #1606 evidence packages (`TD613_Experiment_A_Reciprocal_Completion_Evidence_2026-10-29.zip` [67,081 bytes] and `TD613_Experiment_A_Reciprocal_Completion_R1_Adjudication_Evidence_2026-10-29.zip` [54,741 bytes]) into `03_INDEPENDENT_REDPENS_AND_REVIEWS/` as historical, unmerged audit evidence.

### Gap 4: Public Loose-File Multi-Edition Length Drift
* **Deficit:** Emergence HQ identified that five non-archive loose files on the witness branch differ in recorded byte length from the values recorded in the master manifest:
  1. `closure-receipt.json`: $3,678$ vs $3,725$ bytes ($\Delta = -47$)
  2. `REPLAY_INSTRUCTIONS.md`: $4,524$ vs $4,509$ bytes ($\Delta = +15$)
  3. `run-postflight-closure.mjs`: $31,413$ vs $31,648$ bytes ($\Delta = -235$)
  4. `verify-postflight-closure.mjs`: $7,972$ vs $8,106$ bytes ($\Delta = -134$)
  5. `verify-scientific-postflight.mjs`: $10,772$ vs $10,906$ bytes ($\Delta = -134$)
* **Archival Impact:** In automated verification, file length discrepancies can trigger false alarms or lead engineers to mistakenly overwrite historical versions.
* **Remediation:** Explicitly classify both sets as authentic timestamped editions. The vault will store both the loose witness commit edition and the master ZIP central directory edition side-by-side with distinct edition manifests.

### Gap 5: Public Exposure of Former Unblinding Key & Source Estate Containment
* **Deficit:** The first witness commit included the 619,514-byte master portable review package, which contained a historical unblinding key (`ALPHA=2A, BETA=2B`) and plain arm mappings on a public repository. Furthermore, Em's full 23.6 MB rendered review evidence archive (`TD613_Em_Manifest_Rendered_Review_Evidence_Closure_2026-10-29.zip`, SHA-256 `2b92e074...`) contains restricted intellectual property.
* **Archival Impact:** The scientific blinding for Experiment A is spent; however, restricted source rights and privacy hygiene require containment.
* **Remediation:** The master review package and Em rendered evidence archive must be restricted strictly to the private vault and never re-published to public GitHub.

### Gap 6: Local Scratch & Intermediate Trace Inventory
* **Deficit:** Antigravity's local scratch contains intermediate diagnostic scripts, leak-scan harnesses, and temporary verification scripts that were not inventoried against archive manifests.
* **Archival Impact:** Potential confusion over which local files are authoritative versus throwaway scratch.
* **Remediation:** Formalize the local scratch inventory (completed in the Architecture Preservation Register) and classify non-bundled intermediate scripts as `DIAGNOSTIC_SCRATCH_INERT`.

---

## 3. Proposed Private Heritage Vault Architecture

We propose establishing a private, authenticated storage repository:  
`tauric-diana-613/td613-experiment-a-heritage-vault` (Private GitHub Repository or Encrypted Offline Volume).

```
td613-experiment-a-heritage-vault/
├── README.md                                      # Master vault index & verification guide
├── MANIFEST.json                                  # Cryptographic manifest of all 5 core archives + supplementary
├── EVENT_DAG.json                                 # Complete machine-readable event DAG (Nodes & Edges)
├── 00_GOVERNANCE_AND_COMMISSIONS/                 # Raw operator instructions & charters
│   ├── TD613_Manifest_Emergence_HQ_Protocol_Succession_R2_2026-10-28.md
│   ├── TD613_Experiment_A_Antigravity_Succession_Activation_2026-10-29.md
│   └── TD613_Experiment_A_Flight_Activation_Latifa_Redpen_2026-10-29.md
├── 01_ORIGINAL_FIVE_ARCHIVES/                     # Authenticated byte-identical core ZIP archives
│   ├── TD613_Experiment_A_Latifa_Preflight_Lever_2026-10-29.zip          (274,617 B | 86dd720e...)
│   ├── TD613_Experiment_A_Flight_Evidence_2026-10-29.zip                 (77,400 B  | 897cf83f...)
│   ├── TD613_Experiment_A_Flight_R1_and_Postflight_Evidence_2026-10-29.zip (127,502 B | 21df8b13...)
│   ├── TD613_Experiment_A_Postflight_W0_Evidence_2026-10-29.zip          (54,510 B  | 47b282e4...)
│   └── TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip  (43,100 B  | a8568aef...)
├── 02_OPERATOR_WALKTHROUGHS/                      # 22 Standalone narrative walkthroughs
│   ├── experiment_a_latifa_preflight_plan.md
│   ├── experiment_a_preflight_lever_walkthrough_v1.1.md
│   ├── experiment_a_flight_walkthrough.md
│   ├── experiment-a-w0-walkthrough.md
│   └── experiment_a_postflight_wild_field_architecture.md
├── 03_INDEPENDENT_REDPENS_AND_REVIEWS/            # All formal redpens & adjudications
│   ├── TD613_Experiment_A_Postflight_W0_Independent_Redpen_2026-10-29.md
│   ├── TD613_PR1606_Independent_Source_Code_Redpen_2026-10-29.md
│   ├── TD613_Experiment_A_Architecture_Custody_Preservation_Audit_2026-10-29.md
│   └── PR1606_RECIPROCAL_EVIDENCE/
│       ├── TD613_Experiment_A_Reciprocal_Completion_Evidence_2026-10-29.zip
│       └── TD613_Experiment_A_Reciprocal_Completion_R1_Adjudication_Evidence_2026-10-29.zip
├── 04_NATIVE_EXECUTION_AND_REST_RECEIPTS/         # Native API capability characterization & rest
│   ├── TD613_Experiment_A_Native_Execution_and_Capability_Characterization_2026-10-29.md
│   ├── TD613_Experiment_A_Native_Capability_Independent_Adjudication_2026-10-29.md
│   └── TD613_Experiment_A_Native_Capability_Rest_and_B_Design_Options_2026-10-29.md
├── 05_RESTRICTED_EVIDENCE_HOLD/                   # Confidential and spent-blinding assets
│   ├── TD613_Experiment_A_Master_Portable_Review_Package_2026-10-29.zip   (619,514 B | 32176bed...)
│   └── TD613_Em_Manifest_Rendered_Review_Evidence_Closure_2026-10-29.zip  (23,635,724 B | 2b92e074...)
└── 06_MULTI_EDITION_CROSSWALK/                    # Loose-file editions preserved with exact hashes
    ├── EDITION_A_WITNESS_HEAD/                    # Pinned witness commit versions
    └── EDITION_B_MASTER_ZIP/                      # Master ZIP central directory versions
```

---

## 4. Privacy, Security & Governance Protocol

1. **Strict GitHub Separation:** Review-safe architecture documentation (such as this proposal, the Preservation Register, and the Event DAG) lives on public GitHub PR #1607 to support transparent concurrent review. Under no circumstances will raw operator walkthroughs, spent unblinding keys, or restricted Em source archives be pushed to public branches.
2. **Experiment B Challenge Quarantine:** The ~20–24 file blinded challenge archive for Experiment B remains completely separate, unhashed, unread, and strictly quarantined.
3. **No Retroactive History Rewriting:** No commits or branches on public GitHub will be force-pushed, deleted, or scrubbed. The multi-edition drift and historical predecessor claims are handled strictly append-only.
4. **Zero Release/Deploy Mutation:** Issue #405 deployment authority remains `CLOSED`. Gate E remains `HELD`. Empirical exteriority credit remains `0`.

---

𝌐 `CUSTODY_GAPS_IDENTIFIED · PRIVATE_VAULT_STRUCTURE_PROPOSED · REVIEW_SAFE_PUBLIC_DISCLOSURE · B_CORPUS_SEALED · GATE_E_HELD · HUMAN_CLOSURE_RESERVED`
