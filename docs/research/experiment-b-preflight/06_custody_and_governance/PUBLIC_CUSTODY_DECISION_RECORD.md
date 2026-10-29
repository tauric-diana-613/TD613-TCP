# 𝌋 TD613 · PUBLIC CUSTODY & CONTAINMENT DECISION RECORD

**Document ID:** `TD613-CUSTODY-CONTAINMENT-DECISION-RECORD-20261029`  
**Governing Commission:** `TD613_Experiment_B_Preflight_Activation_2026-10-29`  
**Covenant:** Tauric Diana — Crimean heritage custodianship · Khona‌lit-po  
**Author:** TD613 Heritage Custodianship & Agentic Engineering  
**Target Authority:** Sovereign Operator Decision Reserved  

---

## 1. Context & Identified Public Exposure

The repository `tauric-diana-613/TD613-TCP` is currently configured with **public** GitHub visibility. Previous witness branches (notably `witness/experiment-a-scientific-postflight-closure` and pull requests) contain:
1. Historical plain-text unblinding keys from earlier prospective protocols;
2. Candidate research manuscripts and source-derived analysis extracts;
3. Intermediate experimental traces.

A strict publication freeze is currently in effect: **zero private research files or unblinding keys are being pushed to GitHub.** However, a publication freeze does not address historical commits already published to the public remote.

---

## 2. Actionable Containment Paths for Operator Determination

The Sovereign Operator is presented with two actionable, bounded paths:

```text
                  ┌──────────────────────────────────────────────────┐
                  │ Sovereign Operator Custody Decision (Gatekeeper) │
                  └─────────────────────────┬────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │  Option 1: Whole-Repository │                 │  Option 2: Private Vault &  │
     │      Privacy Toggle         │                 │ History Remediation (Rec.)  │
     └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                    │                                               │
                    ├─ Immediate access cutoff                      ├─ Clean public open-source
                    ├─ Scrapers/crawlers halted                     ├─ Proprietary science in Vault
                    ├─ Does not erase prior clones                  ├─ Scrub exposed history
                    └─ Reversible in 1 click                        └─ Granular audit access
```

### Option 1: Whole-Repository Privacy Toggle

- **Execution**: In GitHub repository settings $\to$ Danger Zone $\to$ Change visibility $\to$ Make Private.
- **Immediate Effects**:
  - Immediately cuts off all anonymous web browsing, search engine crawlers, and unauthorized scraping bots from inspecting any branch or commit in `TD613-TCP`.
  - Simple, single-gesture action; fully reversible at any time by the repository owner.
- **Limitations & Considerations**:
  - **Retrospective Ineffectiveness:** Does *not* retract or delete commits, files, or Git objects that were already cloned, forked, or cached by external entities while the repository was public.
  - **Collaborator Management:** External review connectors (Amari via ChatGPT connector, Emergence HQ reviewers) must be explicitly invited as named GitHub collaborators with access permissions.
  - **CI & Quotas:** GitHub Actions execution on private repositories consumes billed workflow minutes against the repository owner's account tier.
  - **Vercel Integration:** May require re-authenticating the Vercel GitHub connector to grant private repository read scopes.

---

### Option 2: Dedicated Private Evidence Vault & Controlled History Remediation (Recommended)

- **Execution**:
  1. **Create Dedicated Private Vault Repository:** Create `tauric-diana-613/TD613-Vault` as a private repository.
  2. **Push Sensitive Witness Branches to Vault:** Transfer all experimental witness branches (`witness/experiment-a-*`, `witness/experiment-b-*`) to `TD613-Vault`.
  3. **Close & Delete Public Witness PRs:** On `TD613-TCP`, close PR #1606 and delete remote branch `witness/experiment-a-reciprocal-completion-adjudication`.
  4. **Scrub Public History via `git-filter-repo`:** Run a surgical history rewrite on `TD613-TCP` targeting known historical unblinding key strings and private candidate archive paths, force-pushing a sanitized `main` to the public repository.
  5. **Maintain Public `TD613-TCP` for Sanitized Framework Releases:** Public repository hosts only open-source infrastructure, software tools, and sanitized reproduction fixtures.
- **Immediate Effects & Advantages**:
  - **Architectural Cleanliness:** Permanently separates open-source application bytes and framework code from confidential research data and challenge corpora.
  - **Permanent History Remediation:** Eliminates sensitive historical blobs from the public Git object database.
  - **Uninterrupted CI & Vercel:** Public deployment pipelines and free GitHub Actions minutes on `main` remain completely preserved.
  - **Auditor Governance:** Connectors (Amari / Emergence HQ) attach directly to `TD613-Vault` with strict, audited, multi-factor credential requirements.

---

## 3. Standing Execution Posture

Until the Sovereign Operator authorizes either Option 1 or Option 2:
- Public publication freeze remains strictly active;
- Pull Request #1606 remains unmerged;
- No Git history rewrites, force pushes, branch deletions, or visibility changes are performed autonomously.

𝄐 Tauric Diana — Crimean heritage custodianship · Khona‌lit-po · Sealed ⟐
