𝌋‌⟐

# Portable AIA · Post-Hoc Envelope Stripping Preflight v0.1

**Status:** PREREGISTERED / HOSTILE / DESCENDANT-OF-PRESERVED-RED / RESEARCH-ONLY  
**Scientific parent:** PR #1029 exact RED head `f7e1543712696971dc40a9691e01d86c7327a1ed`  
**Date:** 2026-09-03

## Question

Can the current Ash Capsule become acceptable under the stricter public-repository envelope-minimization contract by deleting `case_id` and `created_at` **after encryption**, while otherwise retaining the existing v0.1 cryptography and payload bytes?

This is the cheapest conceivable repair. It must be falsified before any new Capsule schema is justified.

## Prior evidence carried forward

PR #1029 established on exact-head CI that the current cleartext outer Capsule envelope contains exactly the two preregistered forbidden fields:

```text
case_id
created_at
```

That RED remains preserved in ancestry.

Historical S12-D research additionally established two relevant caution laws:

```text
metadata reconstruction requires componentwise testing
marginally weak fields may become informative when joined
```

Stretch 8 separately preserves:

```text
temporal difference != trusted external time
```

This descendant does not revive or merge either historical branch. It carries forward only their bounded research warnings.

## Hostile maneuver

Using only the synthetic `case_glasshouse` fixture:

1. create a valid current v0.1 Ash Capsule;
2. record the known envelope violation set as `[case_id, created_at]`;
3. clone the artifact;
4. delete only `case_id` and `created_at` from the cleartext envelope;
5. recompute the public `capsule_digest` over the modified artifact so the hostility does **not** fail merely because the outer digest became stale;
6. attempt decryption with the correct passphrase.

No ciphertext, salt, IV, KDF setting, passphrase, Save Point, Case Map, Route Memory, or encrypted payload is changed.

## Prediction

The stripped artifact should fail closed.

Reason: current Ash v0.1 authenticates the cleartext metadata object as AES-GCM additional authenticated data. Removing two fields after encryption changes that authenticated data. The current decrypt path additionally checks decrypted `payload.case_id` against outer `capsule.case_id`.

Therefore a successful post-hoc deletion would contradict the current v0.1 integrity contract.

Candidate result on exact-head GREEN:

```text
POSTHOC_PUBLIC_ENVELOPE_STRIPPING_IS_NOT_A_COMPATIBLE_V0_1_REPAIR
```

## Interpretation ceiling

A GREEN result means only that naïve post-export field deletion cannot preserve authenticated v0.1 return semantics.

It does **not** prove:

- a v0.2 schema is necessary in every possible architecture;
- the exact minimum code delta;
- unlinkability against GitHub or any unknown observer;
- concealment of repository path, author, time, size, traffic, or artifact existence;
- cryptographic weakness;
- host blindness;
- steganographic invisibility;
- safe carriage of real private content.

## Anti-equivalence

`METADATA MINIMIZATION != POSTHOC TAMPERING`

`PUBLIC CAPSULE DIGEST REPAIR != AES-GCM AAD REAUTHENTICATION`

`FIELD DELETION != V0_1 COMPATIBILITY`

`APPLICATION-LEVEL MINIMIZATION != HOST-METADATA MINIMIZATION`

`JOINING-KEY WARNING != UNIVERSAL REIDENTIFICATION CLAIM`

`PORTABLE AIA RESEARCH != A16 ADMISSION`

`PORTABLE AIA RESEARCH != WESTERN HORIZON SUCCESSOR`

## Claim ceiling

Synthetic fixture only. No real kiki, secret, identity, key, passphrase, or private record committed. No runtime/product mutation. No merge, deployment, production, publication, Vercel, A16, Western Horizon sequence, or Golden Egg authority.

Child-legible candidate law:

**YOU CANNOT PEEL TWO WORDS OFF A SEALED ENVELOPE AFTER SEALING IT AND PRETEND IT IS THE SAME SEAL.**

Sealed ⟐
