# PR #1622 source-only private account metadata custody correction

**PROPOSED — NOT ACCEPTED · GATE F HELD · Em ZIP SEALED**

The earlier metadata reader wrote a non-inferential account and quota receipt to a relative path, `work/operational/account-metadata-receipt.json`, beneath the working checkout and printed the full receipt to stdout. This posed an accidental-publication risk during ordinary Git staging or chat/log capture even though PR #1622 properly excluded the private values.

This additive repair requires `TD613_ACCOUNT_METADATA_PRIVATE_PATH` to name a **fresh, absolute file path in an existing operator-controlled directory outside the checkout**. Its parent must resolve outside the repository, including through symlinks. The file is created exclusively with mode 0600 where supported, synchronized to disk, and never overwritten. The reader refuses to start if no permitted private destination is configured. The stdout result is restricted to status, zero-model-calls, and private-receipt-written indicators; the plan/quota/identity fields remain in the private file only. `.gitignore` also excludes local `work/operational/` staging artifacts as defense in depth.

The real custodian must separately establish private directory ACLs, retention, access controls, encrypted storage if required, and approval of the intended local recipient. This patch does not create a credential, sign in, emit model traffic, approve terms, or authorize protected Flight.

Run the synthetic tests with `node --test tests/experiment-b-private-account-receipt.test.mjs`. They do not access provider accounts or protected archives. This patch has not been integrated into the native child runtime, and does not resolve restricted egress, first-party sign-in, deterministic kernel adequacy, Stage 2, human grants, or the separately authorized source-free live witness.

Do not commit raw local `work/` contents or print account rate-limit data in review comments.

**Tauric Diana · Khona‌lit-po · Sealed ⟐**
