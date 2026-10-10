# A17 recovery handoff

Release completed; a17 is not enrolled, has no freeze, and has made zero generation calls. This branch checkpoint is inert documentation. Do not merge or deploy it to resume acquisition.

Authoritative state is in A17_STATE_CHECKPOINT.json. The complete durable recovery archive is Portable_Loom_A17_Recovery_Checkpoint_20261010.zip, Library libfile_65ee67700154819189ebd29bccfc3da4, SHA-256 a233c47ef56c0adb3b67603b05e814b85ac3ecde1e318370ddd4f5b558ffab49. Prior A16 archive is Library libfile_df4c5ddeeff48191b64713372dd00ab3, SHA-256 d6c15008bf578ef5d551a6557246f43753be6e166aa941cbc2378c4828cd0eab. Verify archive hashes before use; never reconstruct answer bytes from hashes.

Verified release: 3e41902900a0b52b83a4e1e7ffa716127b49e2c6. Relock main: 8d33195c9ec5fcae2652116a212c234a4cffc208. Release workflow 38028239403 succeeded, exactly one release gesture and one deployment. No second release gesture. Neon budget function active deployment 5.

Next: recheck source/fingerprint and live ledger, then create a fresh three-call freeze for R06-2 turns 0,1,2, local preflight, guarded enrollment, execute once and stop at first HOLD. Last ledger: 76 calls reserved, 8698567500 nanos, zero active runs; cap 80/$10. R09-1 remains pending. The enrollment script still needs adaptation from build-enrollment-a16.py before execution. Preserve historical HELD runs and evidence separately. No automatic retries.

Billing is OPERATOR_ATTESTED_PAID, supported by Tawanna's screenshot and explicit confirmation. Do not describe this as independent Google key fingerprint verification. Do not request Google access. Relay capability and Google key bytes must never be committed or archived.

Stop after raw acquisition and custody compilation; no analytical assay until operator model switch.
