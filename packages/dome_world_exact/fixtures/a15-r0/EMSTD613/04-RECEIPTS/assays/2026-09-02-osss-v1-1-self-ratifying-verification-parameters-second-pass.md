󐘓 U+10D613

# EMSTD613 Atelier · OSSL v1.1 Self-Ratifying Verification Parameters · Second Pass

Status: research-only assay receipt
Branch: `amari/em-td613-lineage-atelier`
PR: #962 · draft / open / unmerged
Date: 2026-09-02

## Question

Does `OSSL Stylometric Lineage Tracking Framework.md` merely contain cryptographic/signature fields, or does the Work specify enough relational semantics to make lineage certification non-self-ratifying?

This pass follows the prior correction that `OSSL v1.1 SIGNATURE FIELD ABSENT = FALSE`.

The narrower question is:

```text
What does the signature bind?
Who supplies / authenticates the verification policy?
Can a candidate manifest choose the ruler by which its own lineage is certified?
```

## Result

The Work contains a materially stronger internal design gap than simple signature absence.

At the source surface reviewed in this pass:

```text
CRYPTOGRAPHIC FIELDS = PRESENT
FULL CRYPTOGRAPHIC VERIFICATION RELATION = NOT SPECIFIED

VERIFICATION PARAMETERS = PRESENT IN CANDIDATE MANIFEST
ROOT/PARENT/REGISTRY BINDING FOR THOSE PARAMETERS = NOT LOCATED

JSON SCHEMA VALIDITY
!= MATHEMATICAL LINEAGE VALIDITY
!= CRYPTOGRAPHIC PROVENANCE VALIDITY
```

The current design therefore permits a candidate manifest to carry the numerical policy used to judge its own stylometric drift unless an external verifier supplies an unobserved policy-binding rule.

This is a design/specification finding about the preserved workspace Work. It is not evidence of a deployed OSSL implementation or an exploited production vulnerability.

## 1. Signature-field correction retained

The formal JSON schema requires a `cryptographic_envelope` containing:

```text
weights_sha256
manifest_hash
signature_ecdsa_secp256k1
```

Therefore the earlier live claim that v1.1 lacked a signature field was correctly retracted.

However, exact-text searches in the Work surface found no:

```text
public_key
signer
verification routine
canonical serialization rule
ECDSA verification implementation
```

The only `signature` / `secp256k1` occurrence located is the schema field itself.

The Python implementation supplied by the Work implements the adaptive stylometric weighting matrix `W`; it does not implement hashing, signing, key lookup, or signature verification.

Thus:

```text
signature field present
!= signer identity bound
!= signature coverage defined
!= signature verification procedure specified
```

## 2. Merkle-style hash equation and schema are not fully bound

The prose defines a node hash:

```text
H_node = SHA-256(
  parent manifest hashes
  || fusion weights
  || child stylometric vector
  || merge residual vector
)
```

and calls the parent manifest hashes canonical.

The later JSON schema independently requires `manifest_hash` as a 64-hex string.

No rule was located that explicitly states:

```text
manifest_hash == H_node
```

or specifies canonical byte serialization for the values concatenated into `H_node`.

The schema therefore checks the *shape* of the hash field, not its semantic relationship to the earlier equation.

Likewise `weights_sha256` is a required field, but the displayed `H_node` equation does not include the child's `weights_sha256` as an explicit input.

Current typing:

```text
HASH FIELD SHAPE = SCHEMA-VALIDATABLE
HASH CORRECTNESS = REQUIRES EXTERNAL SEMANTIC CHECK
HASH-TO-MANIFEST BINDING = NOT FULLY SPECIFIED IN WORK
```

## 3. Mathematical lineage invariants are not encoded by the JSON schema

The multi-parent prose assumes:

```text
w_i >= 0
sum_i w_i = 1
```

The JSON schema constrains each `merge_fusion_weights` item independently to `[0,1]` but contains no observed rule enforcing:

```text
sum(weights) = 1
len(weights) = len(parent_nodes)
```

The schema also declares:

```text
node_type ∈ {root_seed, single_parent_fork, multi_parent_merge}
```

while universally requiring:

```text
parent_nodes
merge_fusion_weights
residual_innovation_vector
```

No `if` / `then` / `allOf` conditional logic was located that enforces node-type-specific cardinality, such as:

```text
root_seed -> zero parents
single_parent_fork -> exactly one parent
multi_parent_merge -> at least two parents
```

Therefore a document may be JSON-schema valid while violating the Work's own mathematical lineage assumptions.

```text
SCHEMA STRUCTURAL VALIDITY
!= MATHEMATICAL MODEL VALIDITY
```

## 4. Candidate-carried verification ruler

The Work defines lineage certification using homeostatic drift budgets:

```text
beta_budget(k) = beta_0 * gamma^k
```

and requires generation-bound and cumulative ancestral-horizon inequalities.

The formal manifest schema then requires the candidate document itself to carry:

```text
generation_depth_k
base_drift_budget_beta0
attenuation_gamma
max_mahalanobis_threshold
```

with only basic type/range restrictions.

At the source surface reviewed here, no rule was located binding these values to:

```text
root-seed policy
immediate-parent policy
external verifier configuration
trusted registry
actor-bound authority key
```

Exact searches found no `inherit` or `registry` rule supplying such a binding. `root_seed` appears only as a `node_type` enum in the schema surface searched during this pass.

This creates the candidate design failure:

```text
candidate fork
-> declares its own generation depth / beta_0 / gamma / threshold
-> candidate's drift is evaluated using those declared values
```

unless an external verifier silently overrides them.

That is a direct candidate instance of the Atelier's provisional `NON_SELF_RATIFICATION` breach:

```text
claimant carries ruler
-> ruler is type/range-valid
-> ruler judges claimant
```

A signature does not repair this by itself. A valid signature over self-chosen policy parameters proves integrity of the assertion, not legitimacy of the policy.

## 5. `max_mahalanobis_threshold` orphan observation

`max_mahalanobis_threshold` is required in the manifest's `verification_parameters`.

Exact-text search located it only in the schema field during this pass. The nearby lineage-certification prose instead defines its acceptance rules through `beta_budget(k)` and cumulative drift inequalities.

Therefore:

```text
max_mahalanobis_threshold
= SCHEMA FIELD PRESENT
= OPERATIONAL RELATION TO STATED CERTIFICATION RULE UNRESOLVED
```

This may be an intended additional verifier bound whose implementation/prose is missing, rather than an error. No stronger claim is admitted.

## 6. Internal project-family control: OSSL-Seed-1.0

`OSSL-Seed Framework Research.md` provides a useful contrasting authority topology.

For stochastic API risk it defines:

```text
w_i(t) = w_i,base * (1 + kappa * P_failure(t))
```

and explicitly states that `kappa` is defined by the **system administrator**.

High-magnitude legal/financial state mutations are separately routed through a Certified Logic Sandbox requiring human cryptographic ratification.

This does not establish that OSSL-Seed is secure or chronologically prior/later. It simply proves that the project-family workspace contains an alternative topology in which consequential policy parameters / ratification are externally assigned rather than solely self-declared by the candidate artifact.

Thus:

```text
OSSL-SEED EXTERNAL POLICY / HUMAN CEILING
!= OSSL v1.1 CANDIDATE-CARRIED DRIFT PARAMETERS
```

Project-family chronology remains unresolved.

## 7. Internal project-family control: Open Seed SWHID

`Open Seed License_ Multi-Party Framework & Stylometry Integration.md` requires a Derivative Spec to include a SWHID referencing its immediate upstream parent.

This supplies:

```text
content-addressed parent identity
+ directed declared parent edge
```

but does not by itself prove a causal derivation event.

Therefore the current witness ladder remains:

```text
content identity
< directed declaration
< signed assertion
< actor/key-bound authenticated event
< rich execution trajectory
```

with witness sufficiency determined by the failure/adversary model rather than one universal rung.

## 8. Strong correction to the phrase `cryptographic provenance guarantees`

The Work states that the Merkle DAG structure provides `cryptographic provenance guarantees and structural traceability`.

At this pass, the source surface supports a narrower statement:

```text
cryptographic content/reference fields are specified
+ a Merkle-style node-hash equation is proposed
+ a child signature field is required
```

It does not yet source-witness the complete verifier semantics required to promote that to authenticated causal derivation proof.

Current adjudication:

```text
TAMPER-EVIDENT / DECLARATIVE PROVENANCE ARCHITECTURE = PROPOSED
AUTHENTICATED DERIVATION EVENT = NOT DEMONSTRATED
SELF-RATIFYING VERIFICATION-PARAMETER RISK = PRESENT IN SPEC SURFACE
DEPLOYED VULNERABILITY = NOT CLAIMED
```

## 9. Relation to larger Atelier findings

This result strengthens rather than universalizes the current residual:

```text
state estimator != route witness != authority certificate

proposer != court

field present != relation specified

schema-valid != semantically valid

signed claim != authenticated causal event
```

The potentially distinctive research signal remains the migration of these distinctions into unusual target substrates. The individual cryptographic and schema mechanisms themselves remain domain-standard or common-upstream unless a specific migration witness is found.

## Next route

1. Search supported/PDF manifestations for any verifier semantics absent from this Markdown surface.
2. Determine whether `verification_parameters` are intended to be inherited from a root/parent but omitted from the schema.
3. Test whether the manifest signature covers a canonical serialized manifest and how the public verification key is resolved.
4. Compare the OSSL v1.1 drift-certification policy with Open Seed's SWHID route and OSSL-Seed's trajectory/audit model as a three-way provenance design surface.
5. Preserve the existing curation-adjacency result without manufacturing chronology.

## Membrane

```text
schema field != implemented verifier
signature != actor identity
hash != causal derivation
candidate-selected threshold != independent certification
curation adjacency != version chronology
```

Marked ⟐
