# 𝌋 TD613 · Public Custody Exposure Risk Assessment & Remediation Plan

**Document ID:** `TD613-CUSTODY-RISK-ASSESSMENT-20261029`  
**Target Repository:** `tauric-diana-613/TD613-TCP` (GitHub Remote)  
**Target Branch:** `witness/experiment-a-scientific-postflight-closure`  
**Examined Commits:** `30ccebf223f17d470852e0dc17116888fa02aa30`, `d238c15ef828230fecda46726618d363717dfb11`  
**Date:** 2026-10-29  
**Covenant:** Tauric Diana — Crimean heritage custodianship · Khona‌lit-po  
**Disposition:** `PUBLIC_CUSTODY_EXPOSURE_IDENTIFIED · OPERATOR_AUTHORIZATION_REQUIRED · ZERO_UNILATERAL_MUTATION_TAKEN`  
**Gate E:** HELD · Empirical Exteriority Credit: 0 · Human Scientific Closure: RESERVED

---

## 1. Executive Summary

An independent inspection of the published GitHub witness branch `witness/experiment-a-scientific-postflight-closure` by Emergence HQ identified critical public custody exposures. The repository `tauric-diana-613/TD613-TCP` is currently configured with **PUBLIC** visibility. Pushing the scientific postflight closure witness branch to this public repository resulted in the public disclosure of:

1. **Purported Sealed Blinding Assets:** The file `04_sealed_unblinding_key/SEALED_UNBLINDING_KEY.json` was committed and published in plaintext JSON, immediately invalidating the external blinded evaluation protocol for that packet.
2. **Plaintext Arm Mappings:** `02_closure_r1_governing_documents/INDEPENDENT_REVIEW_NOTES_AND_REPLAY_INSTRUCTIONS.md` discloses the complete mapping from condition names to arm IDs in cleartext.
3. **Restricted Research & Manuscript Source Bytes:** The committed binary ZIP archives (`TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip`, etc.) contain unredacted text of the P1 manuscript (`eclipse-omega-admissibility-regime.md`, 40,418 bytes) and substantive extracts of the 147-record Em research candidate corpus.

Earlier Em source custody grants explicitly provided for **conditional private research use** and mandated meaningful server-side access protections. Public publication of raw research notes and manuscript text exceeds the declared boundaries of that grant.

In accordance with strict TD613 governance and the redpen instructions, **no unilateral destructive actions (branch deletion, force-pushing history erasures, repository visibility alterations) have been executed**. This document reports the precise risks and submits actionable remediation paths for explicit operator authorization.

---

## 2. Inventory of Exposed Assets

| Asset Path on Witness Branch | Classification | Exposure Impact |
| :--- | :--- | :--- |
| `04_sealed_unblinding_key/SEALED_UNBLINDING_KEY.json` | Blinded Evaluation Key | Structurally destroys prospective blinding for Experiment A postflight review. |
| `02_closure_r1_governing_documents/INDEPENDENT_REVIEW_NOTES_AND_REPLAY_INSTRUCTIONS.md` | Review Protocol | Reveals experimental conditions and hypotheses directly tied to arm identifiers. |
| `01_predecessor_archives/TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip` | Binary Archive | Contains raw P1 manuscript text (40,418 B) and Em candidate extracts. |
| `01_predecessor_archives/TD613_Experiment_A_Flight_R1_and_Postflight_Qualification_Evidence_2026-10-29.zip` | Binary Archive | Contains earlier qualification traces and raw manuscript fragments. |

---

## 3. Analysis of Custody Violations

1. **Violation of External Blinding Law:**
   - Under scientific postflight protocol, a prospective blinded review packet must separate observation data from condition identities.
   - Committing both `BLINDED_ADVERSARIAL_REVIEW_PACKET.json` and `SEALED_UNBLINDING_KEY.json` to the same public branch allows any external reviewer (or web crawler) to immediately correlate arms with hypotheses before freezing evaluations.
2. **Violation of Conditional Private Research Boundaries:**
   - The Em research corpus (147 records, 33 substantive notes, 27 PDFs) was acquired under conditional private research custody.
   - The P1 manuscript is an unpublished core TD613 theoretical work.
   - While summary hashes, structural schemas, and mathematical descriptors are appropriate for witness receipts, raw text publication in a public GitHub repository violates private custody covenants.

---

## 4. Proposed Remediation Paths (Awaiting Operator Gesture)

The operator must select one of the following remediation options:

### Option A: Convert Repository Visibility to Private (Recommended)
- **Mechanism:** In the GitHub repository settings for `tauric-diana-613/TD613-TCP`, navigate to **Settings > Danger Zone > Change repository visibility** and select **Make private**.
- **Advantages:**
  - Instantly removes all branches, commits, blobs, and releases from public internet access.
  - Preserves exact Git commit hashes (`30ccebf2`, `d238c15ef`) and commit trees without rewriting history.
  - Preserves full auditability for authorized collaborators (Emergence HQ and operator).
  - Requires zero destructive Git operations.
- **Consequences:** Any public links or badges pointing to the repository will require GitHub authentication.

### Option B: Dedicated Private Witness Repository & Public Branch Pruning
- **Mechanism:**
  1. Create a new private repository `tauric-diana-613/TD613-Witness-Vault` (Private).
  2. Push the witness branches and full evidence packages to the private repository.
  3. Delete the remote witness branch `witness/experiment-a-scientific-postflight-closure` from `origin` (`git push origin --delete witness/experiment-a-scientific-postflight-closure`).
- **Caveat:** Deleting a remote branch removes the ref pointer, but existing commit objects may remain reachable via direct SHA-1 URL until GitHub executes internal garbage collection. Complete blob erasure in a public repo requires rewriting Git history using `git-filter-repo` and requesting GitHub support cache clearing.

### Option C: Strict Segregation of Future Witness Packages
- **Mechanism:**
  - In all subsequent scientific packages (starting with this Reciprocal Completion package), the `SEALED_UNBLINDING_KEY` is held **STRICTLY LOCAL** on the operator's machine and transmitted via private out-of-band channel only after Emergence HQ registers frozen blinded scores.
  - Public witness packages must contain only anonymized raw execution traces, schema validations, and reproducible verification harnesses without raw private source text.

---

## 5. Agent Governance Declaration

The assistant certifies:
- **No Git history has been rewritten, deleted, or force-pushed without operator instruction.**
- **No repository visibility settings have been modified.**
- **No additional raw source files from Em or TD613 have been published to GitHub.**
- **The working tree on `main` remains clean (`+0 -0`) at commit `700019741e708abfd2e53990fc2d8919995a70f1`.**

𝄐 Tauric Diana — Crimean heritage custodianship · Khona‌lit-po · Sealed ⟐
