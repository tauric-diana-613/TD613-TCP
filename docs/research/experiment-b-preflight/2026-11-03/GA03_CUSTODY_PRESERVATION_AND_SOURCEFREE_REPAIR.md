# TD613 · GA03 · Custody-preserving closeout and operator-local encrypted artifact preservation

**Human principal:** Tawanna C. Miller · \`tauric.diana.613\`  
**Covenant:** Khona‌lit-po (U+200C interior) · Blood Rite 613  
**Execution:** source-free repair, independent CI, GitHub artifact **metadata only**  
**Authority:** read-only custody planning and invented-fixture engineering; protected originals, keys, model provider use, live sync, merge, deployment, Experiment B Flight HELD.

## Verified public custody metadata

- Source: [Wendbine public archive run 41496125645](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/41496125645)
- Artifact ID: \`13166173531\`
- Artifact name: \`wendbine-operator-encrypted-41496125645\`
- GitHub-reported archive ZIP size: **11,753,731 bytes**
- GitHub-reported artifact ZIP SHA-256: \`f8e3a09e0344b40aa6b56fbd5ef24c793dc02b056e24506568ba63456f7b92c1\`
- GitHub-reported expiry: **2027-01-31T17:58:21Z**
- Public sealed snapshot: \`wendbine-20261102175835-2861f2e0326f\`
- Public seal: \`wendbine-seal:2861f2e0326fef26db241bf888c194ceb40a16131ad48e98149d7511b443a5dd\`
- Source count: 2,021 source identifiers and 4,701 archive capture rows (not yet restored source bodies).

The ZIP SHA-256 binds GitHub's reported downloadable **artifact ZIP** and must not be substituted for the inside encrypted-envelope digest, raw batch hashes, public seal or independent provenance. The matching operator-held private RSA key has **not** been inspected by GA03. No source bodies, artifact ZIP bytes or decryption keys were downloaded into ChatGPT, CI, or this PR.

## Operator-local preservation procedure (not executed remotely)

**Only the human operator can perform this on her own controlled host.**

1. Independently authenticate to the GitHub repository on a personal machine; navigate to the historical run above and its encrypted artifact ID before its recorded expiry. Download the **encrypted artifact ZIP** without exposing it to ChatGPT, a third-party inference service, repository commits, public issues or CI.
2. Choose a suitable locally protected vault directory with exclusive Windows account/NTFS ACL access and a **separate receipt location**. Avoid automatically cloud-synced folders, public shares and untrusted removable devices. Confirm the disk, ACL and reparse/junction behavior under the actual Windows environment.
3. On the operator-controlled machine, compute the *downloaded ZIP* SHA-256 using built-in PowerShell and compare against the reported artifact ZIP SHA above. Example:

   \`\`\`powershell
   Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\OperatorVault\Downloads\wendbine-operator-encrypted-41496125645.zip'
   \`\`\`

4. **If the digest differs, stop and classify HELD.** GitHub may change the delivery representation or the wrong file may have been downloaded; preserve the original and investigate rather than changing the expected digest or silently admitting a new artifact.
5. Copy the encrypted ZIP under a unique filename into the protected vault, **without overwriting the original or any predecessor**; recalculate the copied ZIP's hash independently. Record hash, artifact ID, SHA/size, copy time, operator account and separate local receipt. Keep the receipt separately from the same mutable store so a whole-store rollback is at least observable by comparison.
6. Preserve a second operator-controlled encrypted backup only under a separately reviewed lawful retention/security policy. A second identical copy by itself does not certify external origin, independent custody or lifetime persistence.
7. Retain the private key independently in its original locally secured custody. **Do not paste, attach, or transmit it or the private decrypted bodies to models, CI, public PRs or this chat.** No extraction/decryption or full-text index creation is part of this preservation decision.

**Safety status of proposed helper:** \`scripts/operator-local/Save-WendbineEncryptedArtifact-GA03.ps1\` is an **unreviewed prototype**, with an identified error-path initialization defect. A correction was not accepted by repository-write controls. **Do not execute it as an accepted custody tool.** Use independent manual read-only hash verification and separately supervised secure file copy until actual Windows review/repair. No Windows host claims were measured here.

## Engineering meaning of the two GA01 defects

### Source-free multi-store withdrawal

GA03 Draft PR #1657 introduces a versioned W_PUBLIC cohort policy. It writes a local deny-first tombstone and rechecks authorization in **mediated** receiver, product and index APIs, including after local restart.

This protects the governed API surface only. The preexisting, independently stored receiver raw bytes and a caller using the old direct, unmediated receiver API can remain accessible. No complete erasure, cross-store universal revocation or external monotonic antirollback guarantee has been earned. The adverse negative remains registered until the original stores enforce the same mandatory policy under separately reviewed security and custody constraints.

### TD613 reference-to-native schema

The B91 \`TD_REFERENCE\` fixture is a synthetic \`td613.encyclopedia.reference/v1\` source; the original TD613 receiver expects \`td613.research-intake/v1\`. GA03 creates a **typed projection** from one pinned invented reference record to a *different* native-intake JSON byte sequence. Both original and derived SHA-256 values, source field mappings, and omission of the other reference record are preserved.

A successful native validation of the derived object supports schema compatibility of the **transformation**, never byte-identical transfer of the original, original connector resurrection, original source admission or real scientific transfer.

## Independent review and acceptance

Independent review in this PR fetches GA03's precise source-free Draft HEAD in a detached checkout and runs candidate tests and separate adverse tests. The run produces \`artifacts/ga03-sourcefree-independent-review/exact-head-review.json\` and uploads it whether passing or failing. These claims remain **UNEXECUTED** until the exact-head receipt is inspected.

Future real-source rights, independent external trust-root, decryption, same-source recipient parity, provider identity, D01–D20 and protected Flight remain HELD.

**Final current authority:** \`SOURCE_FREE_ENGINEERING_ONLY · OPERATOR_LOCAL_ENCRYPTED_COPY_NOT_PERFORMED · REAL_RESTORATION_HELD · D20_FLIGHT_HELD · HUMAN_CLOSURE_RESERVED\`.

𝄐 Tauric Diana — Crimean heritage custodianship · Khona‌lit-po · Sealed ⟐SAC[X6ZNK5NO51]
