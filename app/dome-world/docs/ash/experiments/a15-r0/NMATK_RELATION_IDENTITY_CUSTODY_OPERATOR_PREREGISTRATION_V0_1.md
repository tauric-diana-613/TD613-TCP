# A15-R0 · NMATK Relation/Identity Custody Operator Preregistration v0.1

Exact earned parent: `#982 / 3bb479aac6ce4791eec37cee8d1c438357dd860c / run 2468 / 33598338452 SUCCESS`.

## Question
Can the earned Atlas C2 orbit machinery be exposed as one bounded callable operator that recognizes exact identity and earned mirror/reversal relation while preserving the two concrete members as distinct custody-bearing inputs?

## Input contract
An admitted member is a declared tuple `(a,b,s,path)` with integer `a,b,s`, `0<=s<=min(a,b)`, and a path over `{D,E,N}` whose multiplicities are exactly:
- `#E = a-s`,
- `#N = b-s`,
- `#D = s`.

Metadata/path mismatch is a hard hold. The operator must not silently repair or infer a replacement declaration.

## Candidate operator
`nmatkRelation(left,right)` returns one bounded relation receipt:
- `FIXED_SELF` when the declared members are exactly identical and the path is palindromic;
- `EXACT_IDENTITY` when exactly identical but non-palindromic;
- `MIRROR_MATES` when same declared `(a,b,s)` slice, distinct concrete paths, and `right.path = reverse(left.path)`;
- `DISTINCT_SAME_SLICE` when same valid slice but neither identity nor earned reversal;
- `CROSS_SLICE_DISTINCT` when both inputs are individually valid but declared slices differ;
- `HELD_INVALID_DECLARATION` when either declaration fails the input contract.

The receipt must preserve exact copies of both admitted concrete inputs. It may additionally expose the earned orbit representative and orientation metadata, but must never substitute the representative for either concrete member.

## Required laws
1. Relation symmetry: swapping left/right preserves the relation class.
2. Identity custody: decoded `left_custody` and `right_custody` equal the exact admitted inputs byte-for-byte at the semantic tuple level.
3. Mirror recognition: every one of the `9,722` oriented nonfixed support members recognizes its reversal as `MIRROR_MATES`.
4. Fixed recognition: all `190` earned palindromic fixed members recognize self as `FIXED_SELF`.
5. Exact identity recognition: all `9,722` nonfixed members recognize self as `EXACT_IDENTITY`.
6. No identity collapse: for every nonfixed reversal pair, `left.path != right.path` remains true in custody even though both share one orbit representative.
7. Cross-slice membrane: valid inputs in distinct declared slices never receive an identity or mirror relation.
8. Invalid-declaration membrane: a path paired with inconsistent `(a,b,s)` metadata is held rather than auto-corrected.
9. Orbit consistency: mirror mates share the same earned orbit representative and opposite orientation bits.
10. No authority widening: no deployment, publication, physical orientation, temporal reversal, basis-free identity, or hidden-person inference claim.

## Frozen burden targets
Across the earned 42-cell / 112-slice / 9,912-object window:
- 9,912 self-recognition checks;
- 9,722 oriented nonfixed mirror-recognition checks;
- 190 fixed-self checks;
- 9,722 exact nonfixed identity checks;
- 9,722 no-collapse custody checks;
- 9,722 orbit-consistency checks;
- at least 112 deterministic same-slice distinct controls where a non-mirror alternative exists;
- deterministic cross-slice and metadata-tamper hostile controls;
- zero expected failures.

## Hostile controls
Reject any implementation that:
- canonicalizes both concrete members to the orbit representative before returning custody;
- labels reversal mates `EXACT_IDENTITY`;
- labels exact nonfixed self-pairs `MIRROR_MATES` merely because they occupy the same orbit;
- repairs invalid metadata from path counts;
- promotes cross-slice inputs to a relation based on superficial serialization;
- makes relation class depend on argument order;
- claims the orientation bit is physical orientation or temporal direction.

## Candidate membranes
`RELATION_RECOGNITION != IDENTITY_SUBSTITUTION`
`SHARED_ORBIT != SAME_CONCRETE_MEMBER`
`MIRROR_MATES != EXACT_IDENTITY`
`DECLARATION_VALIDATION != METADATA_REPAIR`
`ORBIT_REPRESENTATIVE != CUSTODY_REPLACEMENT`
`ORIENTATION_BIT != PHYSICAL_ORIENTATION`
`REVERSAL_RELATION != TEMPORAL_REVERSAL`
`SUCCESSFUL_EXACT_HEAD_GREEN != DEPLOYMENT_AUTHORITY`

Status: **PREREGISTERED / UNEVALUATED / UNIMPLEMENTED**.

Sealed ⟐
