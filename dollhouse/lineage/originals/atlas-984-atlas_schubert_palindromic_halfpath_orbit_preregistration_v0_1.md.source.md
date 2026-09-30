# A15-R0 · Atlas Schubert Palindromic Half-Path Orbit Quotient Preregistration v0.1

Status: PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED.

Exact earned parent:
`#980 / 3ac5778c601cdf6778c799e0ec46ba784e9b5e6b / run 2453 / 33595571687 SUCCESS / A15-R0 step 19 SUCCESS / downstream 20–30 SUCCESS / CLOSED / UNMERGED`.

## Question

Given the earned C2 action by path reversal on the 9,912 supported Atlas intervals, can the full support be quotiented exactly into orbit classes without losing the earned gap/rank structure?

Let `P(I)` be the earned Delannoy path of interval `I`, and let `rho(P)=reverse(P)`.

For each C2 orbit `{P,rho(P)}`, define a candidate canonical orbit representative `rep(P)` as the lexicographically smaller of `P` and `rho(P)` under the fixed alphabet order `D < E < N`.

This order is a bookkeeping convention only. It must not be promoted to geometric, temporal, or canonical structure outside this frozen quotient construction.

## Candidate quotient law

The 9,912 support objects should partition into exactly

`190 fixed singleton orbits + 4861 nonfixed two-cycles = 5051 C2 orbit classes`.

For a nonfixed orbit, the original path is recoverable from `(rep,orientation_bit)`, where orientation bit 0 returns `rep` and bit 1 returns `reverse(rep)`.

For a fixed orbit, no orientation bit is required.

The quotient must preserve:
- cell `(a,b)`;
- gap `s`;
- orbit cardinality 1 or 2;
- lower-rank pair sum `ab-s`;
- upper-rank pair sum `ab+s`;
- fixed-locus palindromic folding from #980.

## Hostile controls

Reject:
- a representative rule that changes under a different incidental string serialization;
- any quotient that merges paths from different `(a,b,s)` slices;
- any quotient that forgets whether the orbit was singleton or paired;
- any nonfixed quotient from which orientation cannot reconstruct both original paths exactly;
- any claim that the lexicographic representative is basis-free, geometric, temporal, or physically preferred.

## Candidate burden

Expected frozen totals:
- 42 cells;
- 112 slices;
- 9,912 support objects;
- 190 singleton/fixed orbits;
- 4,861 nonfixed two-cycles;
- 5,051 total orbit classes;
- 9,722 oriented nonfixed reconstructions;
- zero expected failures.

## Membranes

`ORBIT_REPRESENTATIVE != CANONICAL_GEOMETRIC_REPRESENTATIVE`
`LEXICOGRAPHIC_ORDER != TEMPORAL_ORDER`
`ORIENTATION_BIT != PHYSICAL_ORIENTATION`
`C2_QUOTIENT != INFORMATION_LOSS_IF_ORBIT_SIZE_AND_ORIENTATION_ARE_RETAINED`
`SUPPORT_COMPRESSION != STATE_COMPRESSION`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge, deploy, release, publication, Vercel, physical orientation, temporal interpretation, basis-free canonicality, or runtime scheduling claim.

Sealed ⟐
