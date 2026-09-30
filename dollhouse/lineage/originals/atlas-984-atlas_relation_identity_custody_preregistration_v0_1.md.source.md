# A15-R0 · Atlas Relation–Identity Custody Operator Preregistration v0.1

Exact earned parent: `#982 / 3bb479aac6ce4791eec37cee8d1c438357dd860c / run 2468 / 33598338452 SUCCESS`.

## Question
Can the earned Atlas C2 orbit machinery expose one bounded callable operator that recognizes exact identity and earned path-reversal relation while preserving both concrete members as distinct custody-bearing inputs?

## Input contract
An admitted member is `(a,b,s,path)` with integer `a,b,s`, `0<=s<=min(a,b)`, path alphabet `{D,E,N}`, and multiplicities `#E=a-s`, `#N=b-s`, `#D=s`. Metadata/path mismatch is HELD, never repaired.

## Relation classes
`FIXED_SELF`, `EXACT_IDENTITY`, `MIRROR_MATES`, `DISTINCT_SAME_SLICE`, `CROSS_SLICE_DISTINCT`, `HELD_INVALID_DECLARATION`.

The receipt preserves exact concrete left/right custody. Orbit representative/orientation metadata may be reported but may not replace either member.

## Frozen laws and burden
Across 42 cells / 112 slices / 9,912 objects:
- 9,912 self-recognition checks = 190 fixed-self + 9,722 nonfixed exact-identity;
- 9,722 oriented nonfixed mirror-recognition checks;
- 9,722 no-collapse checks;
- 9,722 orbit-consistency checks;
- exactly 92 same-slice nonmirror controls, one for every slice admitting such a pair;
- deterministic cross-slice and invalid-metadata hostile controls;
- relation symmetry;
- zero expected failures.

Preimplementation correction: 92, not 112, slices admit a same-slice nonmirror control. This correction precedes implementation and is not a CI RED scar.

`RELATION_RECOGNITION != IDENTITY_SUBSTITUTION`
`SHARED_ORBIT != SAME_CONCRETE_MEMBER`
`MIRROR_MATES != EXACT_IDENTITY`
`DECLARATION_VALIDATION != METADATA_REPAIR`
`ORBIT_REPRESENTATIVE != CUSTODY_REPLACEMENT`
`ORIENTATION_BIT != PHYSICAL_ORIENTATION`
`REVERSAL_RELATION != TEMPORAL_REVERSAL`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

Status: **PREREGISTERED / UNEVALUATED / UNIMPLEMENTED**.

Sealed ⟐
