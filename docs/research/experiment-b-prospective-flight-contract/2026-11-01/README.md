# 𝌋 TD613 · Prospective Flight contract review package

**CODEX_PROSPECTIVE_FLIGHT_CONTRACT_HELD_WITH_EXACT_BLOCKERS**

To Tawanna C. Miller and Amari, Emergence HQ. Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C). GATE_P=CLOSED · GATE_F=HELD · GATE_E=HELD · HUMAN_CLOSURE=RESERVED. This planning package performs no model calls or protected-data operations and grants no execution authority.

Baseline: 50cc9d161f8f72c2d4b6ea33ece17ace88f35eff. Predecessor [PR #1616](https://github.com/tauric-diana-613/TD613-TCP/pull/1616) at 2d98d519535870bdf01b8cc9bd6b0328ad3ae70c. [Independent review 5728990012](https://github.com/tauric-diana-613/TD613-TCP/pull/1616#pullrequestreview-5728990012) accepts its local receipts within scope. That PR is not amended or merged here. The final new review HEAD and CI snapshot are in this PR's body and external publication handoff, avoiding a self-referential hash.

| Required deliverable | File |
|---|---|
| Scientific reconciliation dossier | DOSSIER.md |
| Machine-readable Gate F matrix | gate-f-matrix.json |
| Proposed amendment, not adopted | PROPOSED_AMENDMENT.md |
| Complete numerical capacity alternatives | CAPACITY.md; capacity-assumptions.json; capacity-results.json; capacity-model.mjs |
| Execution, continuity and Stage 2 isolation | ISOLATION_CONTRACT.md; execution-contract.json |
| Source custody / process-transfer specification | SOURCE_TRANSFER_SPEC.md |
| Negative controls and falsification | NEGATIVE_CONTROLS.md |
| Residual risks and exact blockers | RISKS_AND_BLOCKERS.md |
| All unresolved operator decisions | OPERATOR_DECISIONS.md |
| Reproducibility and source binding | reproducibility-manifest.json; source-manifest.json; SOURCES.md; validate-contract.mjs; validation-result.json |

The current prospective token ceiling is **720,000 per arm**, following the operator's correction to four times the earlier 180,000. The earlier 180,000 steer and historical 60,000 exceedance remain preserved. The operator reports High for the outer chat; the historical child CLI requests contain medium. Effective served effort remains unverified. Neither setting report is rewritten.

## Reproduction without inference

Use Node 22 or newer; only built-in modules are used. From this package directory, run:

1. node capacity-model.mjs — print the deterministic arithmetic.
2. node validate-contract.mjs — verify frozen arithmetic, source SHA-256/Git blobs, historical totals, review binding, gate non-promotions, decision cross-references, artifact hashes and publication hygiene.

Run node capacity-model.mjs --write only to regenerate capacity-results.json from the public assumptions; if assumptions change, all results, manifests and the prospective protocol revision must be reviewed anew. Node never invokes Codex, a child process, an API, a network connection or archive admission. No original Flight runner, source adapter or protected source is executed. The source copies are immutable citation snapshots; their relative runtime imports need not be complete and they must not be run as a reconstructed baseline checkout.

reproducibility-manifest.json binds every package file except itself. Its own bytes are bound by the Git commit tree and GitHub's blob identity. validation-result.json records actual local static checks, not a native qualification, independent review or Gate F certification. CI status is a separately timestamped handoff snapshot, never an attestation of provider/model identity.

No protected bytes, credentials, tokens or sensitive local paths are present. Source files are public baseline code and synthetic qualification records. No operator grant, key pair, witness, transport capability or archive identifier has been generated. All proposed controls need separate authority and later implementation evidence before protected use.
