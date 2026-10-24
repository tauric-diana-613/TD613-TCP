󐘓 U+10D613

# EMSTD613 Atelier · Provenance Witness Strength / OSSL v1.1 Correction

Status: research-only correction receipt
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · draft / open / unmerged
Date: 2026-09-02

## Correction target

The preceding `state-route-authority-and-minimal-witness-first-pass` investigation correctly separated state resemblance from directed route and authority, but the live investigation then made an over-narrow claim that the OSSL v1.1 manifest schema lacked a signature field.

That claim is corrected here.

## Correct schema observation

`OSSL Stylometric Lineage Tracking Framework.md` defines a formal JSON schema titled:

```text
OSSLStylometricSeedManifestV1_1
```

The required `cryptographic_envelope` contains:

```text
weights_sha256
manifest_hash
signature_ecdsa_secp256k1
```

Therefore:

```text
OSSL v1.1 SIGNATURE FIELD ABSENT = FALSE
```

The v1.1 node manifest does require an ECDSA/secp256k1 signature string.

## Narrower unresolved question

The `lineage_graph.parent_nodes` objects observed in the same schema require:

```text
parent_manifest_hash
parent_weights_sha256
```

No parent-specific signature, parent attestation, event timestamp, signer identity, public-key field, or proof-of-possession field has yet been located inside `parent_nodes` or elsewhere in the Work's prose/schema.

Exact searches also found no `public_key` or `signer` token in the Work surface.

Thus the remaining question is not whether the child manifest is signed. It is what the signature actually authenticates and how verifier identity/key binding is resolved.

At minimum, the schema can bind a signed child manifest to a set of parent-hash claims. What has not yet been source-witnessed is an authenticated derivation event in which the parent side, execution environment, registry, or transformation event independently attests that the child was actually produced from those parents.

Current distinction:

```text
signed manifest containing parent claims
!= automatically parent-authenticated derivation event
```

This must remain unresolved unless an external key registry, signer-binding rule, event attestation protocol, or equivalent witness is located.

## Internal control: Autonomous Agent Governance

`Autonomous Agent Governance Research.md` provides a useful stronger authenticated-route example in a different jurisdiction:

- authority block signed by issuer;
- append-only attenuation blocks cryptographically chained;
- local holder proof-of-possession;
- invocation signed with the holder's private key;
- downstream rights can shrink but cannot expand.

This does not make the governance design a required standard for model genealogy. It simply proves that the workspace itself contains a clear distinction between:

```text
content/hash binding
and
actor/key-bound authenticated delegation
```

## Threat-indexed witness ladder candidate

The corpus now supports a provisional witness-strength ladder whose required rung depends on the failure/adversary model:

```text
0. resemblance / state similarity
1. content-addressed object identity
2. directed declared edge (parent/predecessor identifier)
3. causal/transactional event witness (publication or commit ordering)
4. signed manifest / actor-bound assertion
5. authenticated directed delegation or derivation event
6. rich execution trajectory / audit log
```

Examples currently under comparison:

- cosine/Mahalanobis -> resemblance;
- SHA/SWHID -> content identity;
- parent hash / predecessor link -> declared direction;
- SPSC acquire/release or WAL commit/checksum -> local causal/transaction ordering;
- OSSL v1.1 ECDSA manifest signature -> signed manifest assertion, signer binding unresolved;
- Biscuit/IBCT/Tenuo chain -> authenticated authority route;
- OSSL-Seed Trajectory Manifest -> route-rich audit surface, privacy membrane unresolved.

This ladder is not yet promoted as an Em-specific operator. Many rungs are native domain mechanisms.

## OSSL status-machine separation

A second correction from the same descent: OSSL naming contains multiple distinct status/version spaces.

```text
OSSL-1.0
= license identifier in Open Seed

OSSL-Seed-1.0
= autonomous execution / symbiotic-lineage framework

OSSL v1.1 / OSSLStylometricSeedManifestV1_1
= stylometric lineage-certification manifest
```

The v1.1 Work calls itself a specification enhancement and says it updates an OSSL seed manifest standard, which supports internal spec-version direction. However it does not explicitly name `OSSL-Seed-1.0` as its immediate predecessor, and it contains no `license`, `legal`, or `ShareAlike` token in exact-text search.

Therefore:

```text
SPEC-SUCCESSOR CLAIM = SUPPORTED
IMMEDIATE PREDECESSOR IDENTITY = UNRESOLVED
SINGLE OSSL SEMVER LINE = NOT ESTABLISHED
```

## Legal derivative status != stylometric lineage certification

Open Seed defines `Derivative Spec` structurally: any structural modification, refinement, or automated optimization of the Seed Specification. Its ShareAlike obligation follows structural derivation.

OSSL v1.1 separately defines a stylometric/homeostatic lineage-certification regime: forks outside generation and cumulative drift budgets may be flagged `unverified` or `severed` for lineage attribution.

No evidence currently shows that a v1.1 `severed` status cancels legal derivative obligations under Open Seed.

Thus:

```text
STRUCTURAL / LEGAL DERIVATIVE STATUS
!=
STYLOMETRIC LINEAGE CERTIFICATION STATUS
```

A true derivative may be stylometrically distant. A stylistically close artifact may still lack a witnessed causal derivation event.

## Next route

1. Determine what data the v1.1 ECDSA signature is intended to cover and how verifier key identity is obtained.
2. Test whether the signed child envelope plus Merkle DAG is designed as provenance evidence, tamper evidence, or causal derivation proof.
3. Compare with SWHID semantics and Open Seed's immediate-parent requirement.
4. Compare with WAL/SPSC/capability chains to derive failure-model-specific witness sufficiency rather than one universal provenance standard.
5. Keep legal status, lineage certification, content identity, and causal derivation separately typed.

Marked ⟐
