# 𝌋 Non-Omissive Disclosure & Authorization Boundary

This protocol specifies the deterministically rendered **full-known-information disclosure**, rather than an impossible omniscient promise about all future outcomes.

## Typed transition chain

`HUMAN_SUBMISSION → MACHINE_PACKET → SOURCE_FREE_REVIEW → DISCLOSURE → HUMAN_DECISION → CANDIDATE_BRANCH → SECOND_EXACT_DIFF_REVIEW → SEPARATE_CANONICAL_APPROVAL`.

No transition is inferred from a badge or a statement written by the same agent that requests it.

The received JSON packet is UNTRUSTED DATA. Its content may include misleading instruction-like strings; they remain text. The source-free runtime never executes them or uses their alleged authority as a grant.

### Disclosability contract

For a packet P and receiver review R, the renderer D must satisfy:

- **Packet completeness:** The full JSON value of P is embedded in D, including unknown extension fields, in stable order. A packet with 64 proposal entries must disclose 64 numbered entries. No "top 5" truncation.
- **Review completeness:** The full review R appears in the forensic appendix, including unresolved anchors, scientific limits, negative branches and all finite experiment evidence.
- **Binding:** The dossier stores `SHA256(JSON.stringify(P))` (receiver fingerprint), baseline registry digest, and `SHA256` of its canonical structured disclosure payload. A separate Markdown view renders the same payload and may be independently hashed.
- **Readable projection:** Light and Medium views summarize all proposals and issue counts; Heavy carries full data. Every summary must link to a full appendix. A summary omission is acceptable for legibility only if the omitted content remains present in the full disclosure; intentional concealment is prohibited.
- **Effects:** Known affected rule IDs, crossings, queue positions and status are explicit; prospective target files and exact Git patches are **unknown until proposed and inspected**. Mark `NO_EXACT_INTEGRATION_DIFF_AVAILABLE` in such cases.
- **Risk:** Unknown risks, missing source access, observer non-identifiability, unearned scientific promotion, source/author attribution and computational resource ceilings are separately named.
- **Authority:** Approval to **prepare a reviewable staged candidate** cannot be used to adopt, merge or deploy it, release Experiment B, or rewrite historical records.
- **Human attestation:** The system cannot prove human authorship from a text filename or typed name. The separate operator action requires a genuine contemporaneous instruction and exact digest matching.

### Formalized checks

Let `S(P)` be ordered proposal identifiers. The disclosed index `I(D)` must satisfy `I(D)=S(P)` exactly, preserving duplicates as a validation error. For all known source anchors, `A(D)=A(P)`. For a receiver review, `R(D)` must be exactly the reviewed output under the same baseline. If the review is HELD, the disclosure is still produced so that a human can see *why*; the agent may ask for correction but cannot describe the held packet as ready for integration.

The canonical registry is never mutated by `sync` or `disclose`; this must be regression-tested byte-for-byte.

### Authorization scope taxonomy

**EXPLORE / TEST / DISCLOSE** — already within source-free research scope.  
**SYNTHESIZE_STAGED_CANDIDATE** — requires a new explicit, selected-ID human instruction; yields an unmerged branch/patch with a second review.  
**ADOPT_CANONICAL** — separately gated and **unsupported by the present receiver**; requires a new reviewed integration procedure, exact patch, independent tests and human confirmation.  
**FLIGHT / DEPLOY / ARCHIVE_RELEASE / AUTOSCHEDULER** — independently authorized actions outside this protocol.

An authorization dossier is a request, not a command to the user and not an execution token. There is no authorization "autofill" path.

### Practical readability failure cases

A beautiful Markdown report with only 10 of 64 proposals fails. A JSON appendix with all 64 but a false Light count fails. A report that says "no risk" where exact code effects are unknown fails. A copied operator name or covenant key inserted by an LLM is not consent. A passing test claiming that its own receipt constitutes external evidence fails.

### Independent audit queries

A Heavy reviewer should be able to regenerate the dossier from the exact packet and canonical registry; compare SHA256 hashes; verify every source and uncertainty claim; read all branches and assay results; and identify the point where future human approval is still needed. A different scientific reviewer may disagree with the theory without invalidating the historical record.

**No mirrors at the kiki:** Human-visible ≠ Machine-internal; Complete-known disclosure ≠ Omniscience; Staged candidate ≠ Canonical integration.