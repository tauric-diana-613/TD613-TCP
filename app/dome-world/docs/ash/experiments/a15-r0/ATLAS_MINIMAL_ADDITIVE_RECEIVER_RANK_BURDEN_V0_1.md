# A15-R0 · Atlas Minimal Additive Receiver Rank · Execution Burden v0.1

Parent: exact earned #948 / `c880a89346fd18a11a8c9476529e77816e12d14a`.

The implementation and hostile must satisfy this fixed burden before exact-head validation may earn the chamber.

## Structural transform burden

For each `n=1..5`:

1. enumerate all `2^n-1` nonempty labeled supports;
2. construct the stratified receiver transform from containment predicates only;
3. verify exactly `d_n=2^n-1` rows and columns;
4. verify upper-triangular support-order structure with unit diagonal;
5. compute the determinant independently by exact integer Bareiss elimination;
6. require determinant `1`.

The finite profile dimensions are `1,3,7,15,31`.

## Additive compression obstruction burden

The implementation must expose an exact collision witness for any supplied integer matrix `A` with fewer rows than columns:

- compute an exact rational RREF;
- select a free coordinate;
- produce a nonzero rational null vector;
- clear denominators to a nonzero integer kernel vector `z`;
- split `z=z^+-z^-` into nonnegative vectors;
- verify `z^+ != z^-` and `A z^+ = A z^-`.

The hostile must exercise exactly 42 preregistered generated `m×7` matrices: `m=1..6`, seven deterministic variants per `m`. Every matrix must yield a certified collision.

It must separately exercise the seven `6×7` coordinate-deletion projections. Every deletion must yield a collision.

## Nonlinear scope-control burden

Recursively Cantor-pair every vector in `{0,1}^7` to one nonnegative integer scalar. Require exactly 128 distinct codes.

This control is load-bearing: a passing one-scalar nonlinear code bars any wording that promotes the additive rank theorem into a universal scalar-coordinate or bit-compression theorem.

## Claim ceiling

The earned claim, if any, is limited to additive integer-valued receiver channels on support multiplicities. It does not establish minimum serialized bytes, entropy, Kolmogorov complexity, physical sensor count, practical compression ratio, or impossibility of nonlinear injections.

Any observed mismatch is RED. Expectations remain frozen and may not be edited toward output after execution.

Sealed ⟐