𝌋‌⟐

# Portable Child-Legible AIA × Public-Repository Carrier Preflight v0.1

**Status:** PREREGISTERED / HOSTILE / RESEARCH-ONLY / PRODUCT-MUTATION-FORBIDDEN  
**Scientific parent:** PR #1026 / `8f0df787080955efc059d83596a776f0dd6f0d91` / tree `d9652347d9823df48807b630b71ac82998301e43`  
**Date:** 2026-09-03  
**Lineage posture:** Ash + Hush + Pedagogue + Capsule composition assay; not an A16 admission and not a Western Horizon successor.

## Question

Can the existing Ash Capsule, without changing its cryptography or custody semantics, serve as a **public GitHub carrier** for sensitive portable child-legible AIA continuity while preserving the stricter TD613 disclosure posture that private joining keys, private chronology, and protected case structure remain non-public?

This assay does **not** upload or embed any real conversation, case, secret, passphrase, identity, or private record. It uses the existing synthetic `case_glasshouse` continuity fixture only.

## Why this chamber exists

The repository already contains the organs that make the desired architecture plausible:

- Ash keeps full case structure local by default;
- Rooms preserve local joining keys;
- Hush screens bounded provider packets;
- Pedagogue / child-legible AIA presents consequence before ontology and preserves Rest / Return / exit;
- Ash Capsule provides authenticated encrypted continuity using the existing continuity engine.

Therefore this chamber refuses to create a fifth privacy subsystem merely because portability has become desirable.

The narrower question is whether the **current Capsule envelope itself** already satisfies the additional privacy burden imposed by a public repository carrier.

## Desired public-carrier contract

For this experiment, a capsule intended for a public repository must keep the following out of the cleartext capsule envelope:

```text
stable case identity
exact case-continuity creation time
```

The current cryptographic posture is not challenged here. The test does not claim that public ciphertext is decryptable, that AES-GCM is broken, or that GitHub receives the passphrase.

The test asks only whether encrypted payload confidentiality has already been accompanied by metadata minimization appropriate to a public carrier.

## Hostile test

The existing `tests/ash-keep-continuity.test.mjs` fixture will retain all current continuity checks and add one bounded hostile assertion after capsule creation:

```text
public_repository_envelope_violations
must equal
[]
```

The violation collector names cleartext presence of:

```text
case_id
created_at
```

No product/runtime code is changed in this chamber.

## Repository-observed preflight evidence

The current continuity engine constructs outer authenticated metadata containing:

```text
schema
version
case_id
created_at
cipher
kdf
iterations
salt_bytes
iv_bytes
recipient_transport
```

and then appends salt, IV, ciphertext, and capsule digest.

Therefore the current source predicts that the hostile public-carrier assertion should RED on at least `case_id` and `created_at`.

The current Case Map assigns a cryptographically generated opaque `case_id` by default. Opaqueness reduces semantic disclosure but does not make a stable repeated identifier unlinkable across multiple public artifacts.

GitHub path names, commit timestamps, authorship, object size, and repository history are separate carrier-envelope observables outside the Ash Capsule cryptographic boundary. This experiment does not claim to eliminate or quantify them.

## Anti-equivalence

`ENCRYPTED PAYLOAD != PRIVATE ENVELOPE`

`OPAQUE IDENTIFIER != UNLINKABLE IDENTIFIER`

`AUTHENTICATED METADATA != CONFIDENTIAL METADATA`

`CAPSULE PORTABILITY != PUBLIC-REPOSITORY PRIVACY`

`PUBLIC CIPHERTEXT != INVISIBILITY`

`GITHUB CARRIER != LOCAL CUSTODY`

`CHILD-LEGIBLE SHELL != CONTENT DISCLOSURE`

`HOSTED ARTIFACT != HOST-BLIND ARTIFACT`

`DESIGN RED != CRYPTOGRAPHIC BREAK`

`PORTABLE AIA RESEARCH != A16 ADMISSION`

`PORTABLE AIA RESEARCH != WESTERN HORIZON SUCCESSOR`

## Candidate adjudication

If exact-head CI fails only because the existing Capsule exposes `case_id` and/or `created_at` in its cleartext outer metadata, preserve that RED as the result:

```text
CURRENT_ASH_CAPSULE_PUBLIC_REPOSITORY_ENVELOPE_MINIMIZATION_NOT_ADMITTED
```

That result would establish only:

1. payload encryption already exists;
2. passphrase persistence remains absent;
3. the current outer envelope exposes at least one joinable/time-bearing field forbidden by the stricter public-carrier contract;
4. therefore current Capsule portability cannot be silently promoted into public-repository privacy.

It would **not** establish the exact repair, exact minimum number of new mechanisms, or final product architecture.

## Claim ceiling

- no real kiki or private case content committed;
- no passphrase, secret, key, or protected literal committed;
- no cryptographic weakness claim;
- no claim that GitHub is a confidential recipient;
- no claim of host invisibility, steganographic invisibility, or metadata invisibility;
- no public-repository carrier admitted yet;
- no product/runtime mutation;
- no A16 review, waiver, admission, implementation, or product authority;
- no Western Horizon reopening or successor stage;
- no Golden Egg credit;
- no merge, deployment, production, publication, or Vercel authority.

Child-legible candidate law:

**THE LETTER MAY BE LOCKED WHILE THE ENVELOPE STILL SHOWS WHOSE BOX IT BELONGS TO AND WHEN IT WAS SEALED. BEFORE WE PUT THE ENVELOPE ON A PUBLIC SHELF, WE TEST THE ENVELOPE TOO.**

Sealed ⟐
