# Phase 9 Whole-Stack Collision Audit

Status: readiness scaffold only. Phase 9 has not started.

Phase 9 begins only after the Phase 8 threshold-floor hotfix is merged, the full Hush suite is green, the packet bank and provider logs are available, and Vercel quota or another deployed test environment permits runtime validation.

## Audit object

The test object is the full TD613/Hush runtime ecology:

1. local repo test suite
2. Hush mask registry
3. per-mask packet builder
4. stylometric passport builder
5. numeric decision surface
6. Hush Customizer UI
7. strict provider bridge
8. outbound provider contracts
9. inbound provider logs
10. deployed Hush and TD613 pages
11. Safe Harbor packet and receipt surfaces
12. Aperture governance declarations
13. Vercel deployment behavior
14. cross-mask outputs produced from the same source packet

`adversarial-bench.html` is one stress arena. It is not the canonical runtime by itself and cannot stand in for the whole stack.

## Core question

Can the stack preserve mask identity, source obligations, public-default discipline, export policy, and provider-contract integrity when one source packet is processed through multiple masks across local and deployed surfaces?

## Comparison route

For every source/mask pair, preserve one joined record:

`Source Packet -> Local Fixture Replay -> Local Packet Build -> Deployed UI -> Outbound Contract -> Provider Return -> Final Packet/Log`

Compare:

- source anchors and mandatory obligations
- mask ID, label, role, centroid, and threshold table
- candidate output and provider style note
- preserved propositions, dropped propositions, and new claims
- raw candidate/sample exclusion
- `public_default_allowed: false`
- packet hashes, replay hashes, receipts, and contract consistency

Score local/deployed parity, source-obligation parity, mask identity retention, provider drift, threshold parity, replay consistency, export discipline, and public-default integrity.

## Collision matrix

Start with these higher-risk pairings:

- Blip vs Pixie
- Lulu vs Blip
- Zora vs Sheree
- Keisha vs Queenie
- Sol vs Luz
- Dromological Paul vs Zora
- Rex vs Blip
- Rex vs Sol
- Luz vs Dromological Paul
- Sheree vs Keisha

Expand to the full matrix after the first comparison pass is stable.

## Shared packet bank

Prepare ten packets before runtime testing:

1. dense forensic source
2. short vague whistleblower source
3. high-emotion source
4. technical metadata source
5. public-facing forum source
6. legal or claim-boundary source
7. document-custody source
8. contradiction or logic source
9. sensitive relational source
10. provider-stress source

Each packet must declare mandatory anchors, optional anchors, source obligations, claim boundaries, prohibited additions, and expected mask-specific behavior.

## Provider log contract

Record provider model, prompt and Flight packet versions, outbound contract hash, source/reference hashes, mask ID and label, candidate text, preserved/dropped/new propositions, style operation/note, and risk flags.

Hard blockers:

- new factual claim
- dropped mandatory anchor
- wrong mask ID, label, role, or internal-register exposure
- public-default flip
- raw candidate or sample leak
- provider style note contradicting the mask role
- generic formal-assistant collapse

## Deployment evidence

For every deployed surface, record URL, visible build timestamp or commit SHA when available, output, request shape when accessible, endpoint behavior, contract/log artifacts, console errors, and exports.

Current deployment status: not validated because the Vercel free-tier deployment quota is exhausted. This is not evidence of runtime failure or runtime success.

## Findings template

### 1. Local vs deployed parity

Pending Phase 9 execution.

### 2. Provider drift summary

Pending Phase 9 execution.

### 3. Cross-mask collision table

Pending Phase 9 execution.

### 4. Mask identity preservation

Pending Phase 9 execution.

### 5. Source-obligation survival

Pending Phase 9 execution.

### 6. Public-default/export integrity

Pending Phase 9 execution.

### 7. Safe Harbor/Aperture boundary status

Pending Phase 9 execution.

### 8. Adversarial bench findings

Pending Phase 9 execution. Use the bench for malformed packets, collision prompts, mask-confusion attempts, raw leakage attempts, public-default flips, provider formalism traps, and register/costume traps.

### 9. Runtime-only issues

Pending Phase 9 execution.

### 10. Repo-only issues

Pending Phase 9 execution.

### 11. Required hotfixes

Pending Phase 9 execution.

### 12. Release recommendation

Not ready to issue until local and deployed evidence is available.

## Issue classes

Classify every finding as a repo bug, runtime/deployment bug, provider drift, mask collision, threshold calibration bug, export-policy bug, UI-routing bug, contract/log mismatch, documentation-only issue, or Phase 10 candidate.

## Non-claims

Phase 9 may test mask behavior, provider drift, export discipline, deployed/runtime parity, source-obligation retention, and cross-mask collision.

Phase 9 may not claim authorship or identity proof, legal protection, consent, truth adjudication, public-release permission, anonymity, non-attribution, safety guarantee, EO-RFD/ACEDIT authority override, or Safe Harbor override.
