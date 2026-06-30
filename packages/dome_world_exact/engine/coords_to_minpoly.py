"""coords_to_minpoly.py -- A2.P0: the EXACT in-field minimal-polynomial core.

The real Problem-R1 increment. Given an element of a known field K as exact coordinates,
return its EXACT monic-integer minimal polynomial -- the object a residual centroid will later
snap to. This is the pure core only; wiring it into ResidualLearner (replacing the nearest-integer
placeholder snap) is A2.P1, gated separately.

Method (exact; Fraction/int throughout, NO floats anywhere in this path -- G8):
  K = Q[x]/(field) on the power basis {1, theta, ..., theta^(d-1)}. The element
  alpha = sum_i coords[i] * theta^i acts on K by multiplication; its REGULAR REPRESENTATION is the
  matrix  M = sum_i coords[i] * rho(theta^i) = sum_i coords[i] * C^i,  where C = companion(field) is
  rho(theta), the mult-by-theta matrix. The minimal polynomial of alpha is the LARGEST INVARIANT
  FACTOR of (xI - M) over Q[x] (Dummit & Foote 12.2 / Thm 6.9) -- computed by Smith normal form,
  REUSING the kernel in invariant_factors.py (vendored verbatim into this package). Monic-integer
  (G10) exactly for an algebraic-integer element; a clean raise otherwise.

`field` is K's defining monic-integer minimal polynomial, HIGH->LOW (the loom/CATALOG convention),
e.g. Q(sqrt5)=[1,0,-5], Q(phi)=[1,-1,-1], Q(sqrt2+sqrt3)=[1,0,-10,0,1].

Model-layer only, a PURE FUNCTION: no KIRA, no z, no _IC_*, no Plate-Matrices, no mutation, no
growth. Pure stdlib + fractions.Fraction.
"""
from __future__ import annotations

import os
import sys
from fractions import Fraction
from typing import List, Sequence, Union

# reuse the L0 G10 guard + the vendored Smith-normal-form kernel (siblings in this package) ---- #
_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)
for _p in (_HERE, _ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from integral_basis import _guard_int_monic                     # noqa: E402  (G10 guard, reuse L0)
from invariant_factors import invariant_factors, companion_high  # noqa: E402  (vendored SNF kernel)

Frac = Fraction
Number = Union[int, Fraction]


def _exact(c: Number) -> Fraction:
    if isinstance(c, float):
        raise TypeError("coordinates must be exact (int/Fraction), not float (G8)")
    return Frac(c)


def _identity(n: int) -> List[List[Fraction]]:
    return [[Frac(1) if i == j else Frac(0) for j in range(n)] for i in range(n)]


def _matmul(A, B):
    n, k, m = len(A), len(B), len(B[0])
    return [[sum(A[i][t] * B[t][j] for t in range(k)) for j in range(m)] for i in range(n)]


def regular_representation(coords: Sequence[Number], field: Sequence[int]) -> List[List[Fraction]]:
    """The mult-by-alpha matrix M = sum_i coords[i] * C^i, C = companion(field). Exact Fraction.

    M[r][c] is the power-basis coordinate r of alpha * theta^c -- the regular representation of
    alpha = sum_i coords[i] theta^i acting on K = Q[x]/(field).
    """
    mp = _guard_int_monic(field)                                # K defined by a monic-integer minpoly
    d = len(mp) - 1
    cs = [_exact(c) for c in coords]
    if len(cs) != d:
        raise ValueError(f"coords must have length {d} (= degree of K); got {len(cs)}")
    C = companion_high(list(mp))                                # rho(theta): mult-by-theta in {1,...,theta^(d-1)}
    M = [[Frac(0)] * d for _ in range(d)]
    power = _identity(d)                                        # C^0 = I
    for i in range(d):
        ci = cs[i]
        if ci != 0:
            for r in range(d):
                row_M, row_p = M[r], power[r]
                for c in range(d):
                    row_M[c] += ci * row_p[c]
        if i + 1 < d:
            power = _matmul(power, C)                           # advance to C^(i+1)
    return M


def coords_to_minpoly(coords: Sequence[Number], field: Sequence[int]) -> List[int]:
    """EXACT monic-integer minimal polynomial (HIGH->LOW) of the element with power-basis
    coordinates `coords` in K = Q[x]/(field).

    The minpoly is the LARGEST INVARIANT FACTOR of (xI - M) over Q[x], M the regular representation
    of the element -- computed via Smith normal form (reusing invariant_factors.py).

    Raises:
      TypeError  on a float coordinate (exact core, G8).
      ValueError on empty / wrong-length coords, a non-monic or non-integer `field`, or a
                 non-algebraic-integer element (its minpoly is not monic-integer -> G10).
    """
    if not list(coords):
        raise ValueError("coords must be a non-empty coordinate vector")
    M = regular_representation(coords, field)
    facts = invariant_factors(M)                                # nontrivial factors LOW->HIGH; last = minpoly
    if not facts:
        raise ValueError("degenerate element: no nontrivial invariant factor")
    minpoly_low_high = facts[-1]                                # largest invariant factor == minimal polynomial
    high_to_low = [minpoly_low_high[k] for k in range(len(minpoly_low_high) - 1, -1, -1)]
    return _guard_int_monic(high_to_low)                        # monic-integer (G10) or clean raise


if __name__ == "__main__":
    # tiny self-check (the assert-bearing gate lives in test_coords_to_minpoly.py)
    print("phi in Q(sqrt5)  [1/2, 1/2] ->", coords_to_minpoly([Frac(1, 2), Frac(1, 2)], [1, 0, -5]))
    print("2*sqrt6 in Q(sqrt2+sqrt3)   ->", coords_to_minpoly([-5, 0, 1, 0], [1, 0, -10, 0, 1]))
    print("rational 3 in Q(sqrt2+sqrt3)->", coords_to_minpoly([3, 0, 0, 0], [1, 0, -10, 0, 1]))
    print("theta (primitive) in Q(sqrt2+sqrt3) ->", coords_to_minpoly([0, 1, 0, 0], [1, 0, -10, 0, 1]))
