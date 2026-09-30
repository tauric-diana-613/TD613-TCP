# A15-R0 · Atlas Schubert C2 Palindromic Folding Preregistration v0.1

Status: PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED.

Exact earned parent:
`#978 / 3c3a3dac296a819fad7c896fc2042510a6709ea9 / run 2452 / 33594729543 SUCCESS / CLOSED / UNMERGED`.

## Question

Does the earned #976 involution become literal reversal under the earned #971 Delannoy path encoding, so that the #978 fixed-point law is realized by an exact fold/unfold bijection with palindromic Delannoy words?

For fixed `a=d-1`, `b=k`, gap `s`, every supported interval corresponds to a Delannoy word with multiplicities

`E^(a-s) N^(b-s) D^s`.

Candidate theorem:

`Path(J(I)) = reverse(Path(I))`.

Therefore `I` is fixed by `J` iff its Delannoy word is a palindrome.

## Candidate fold/unfold map

Let `(A,B,S)=(a-s,b-s,s)`.

A palindromic word exists iff at most one of `A,B,S` is odd.

When all are even, fold a palindrome by taking its left half. The left half has multiplicities `(A/2,B/2,S/2)` and determines the whole palindrome uniquely by reversal.

When exactly one count is odd, the unique odd letter occupies the center; deleting that center letter and taking the left half gives multiplicities `(floor(A/2),floor(B/2),floor(S/2))`. Unfold by reflecting the half-word around the forced center letter.

Thus the fixed set should be in exact bijection with multiset words on the half-counts, with the center letter forced by parity.

## Required consequences

For every frozen `(a,b,s)` slice:

- path equivariance: `encode(J(I)) = reverse(encode(I))`;
- fixed interval iff palindromic Delannoy path;
- more than one odd multiplicity implies zero fixed objects;
- otherwise fold/unfold is a two-sided inverse;
- fixed count equals the multinomial of half-counts;
- summing slice fixed counts over the frozen window reproduces exactly 190 fixed objects;
- no fixed object lies off the middle lower-rank hyperplane `2 r_low = ab-s` inherited from #976.

## Hostile controls

Reject:

- endpoint reversal without path reversal;
- path reversal with E/N exchange;
- a free choice of center letter when parity forces it;
- any folding rule that works only when all three multiplicities are even;
- any count-only proof that does not round-trip fixed Atlas intervals through encode/fold/unfold/decode.

## Membranes

`PALINDROMIC_PATH != TEMPORAL_REVERSAL`
`FOLDING_BIJECTION != PHYSICAL_FOLDING`
`CENTER_SYMBOL != TIME_ORIGIN`
`HALF_PATH != HALF_STATE`
`FIXED_FLAG_COMBINATORICS != BASIS_FREE_GEOMETRY`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge, deploy, release, publication, Vercel, temporal interpretation, physical folding, basis-free duality, or asymptotic claim.

Sealed ⟐
