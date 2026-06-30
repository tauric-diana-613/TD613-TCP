"""projector.py -- L0 exact subspace projector + residual (SPEC_KIRA_VECTOR_SUBSTRATE.md 3.3).

Orthogonal projection onto a forced subspace in the trace-form inner product, with the
EXACT residual r = x - Px (G8: Fraction/int throughout; NO numpy). gram_inverse is the
exact rational inverse missing from vendor/matrix_plates/linalg.py and also serves
IntegralBasis.I2P. NO_PROJECTION mirrors polytope.nearest_vertex's (-1, inf) sentinel for
a rank-deficient forced basis B.

Membership ("is x captured?", r == 0) is decided here exactly over Q/Z; magnitude
("how far off") may be read in float elsewhere -- never the reverse (G8, Principle 5.12).
"""
from __future__ import annotations

from fractions import Fraction

Frac = Fraction
NO_PROJECTION = None   # sentinel: singular B^T G B (mirror nearest_vertex (-1, inf))


# --------------------------------------------------------------------------- #
# tiny exact linear algebra (Fraction; no numpy)
# --------------------------------------------------------------------------- #
def _identity(n):
    return [[Frac(1) if i == j else Frac(0) for j in range(n)] for i in range(n)]


def _transpose(M):
    return [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]


def _matmul(A, B):
    n, k, m = len(A), len(B), len(B[0])
    return [[sum(Frac(A[i][t]) * Frac(B[t][j]) for t in range(k)) for j in range(m)]
            for i in range(n)]


def _matvec(M, v):
    return [sum(Frac(M[i][j]) * Frac(v[j]) for j in range(len(v))) for i in range(len(M))]


# --------------------------------------------------------------------------- #
# (c) the projector + residual
# --------------------------------------------------------------------------- #
def gram_inverse(G):
    """Exact rational inverse via Gauss-Jordan over Fraction. Returns None if singular."""
    n = len(G)
    A = [[Frac(G[i][j]) for j in range(n)] + [Frac(1) if i == j else Frac(0) for j in range(n)]
         for i in range(n)]
    for col in range(n):
        piv = None
        for r in range(col, n):
            if A[r][col] != 0:
                piv = r
                break
        if piv is None:
            return None                                   # singular
        A[col], A[piv] = A[piv], A[col]
        inv_p = Frac(1) / A[col][col]
        A[col] = [v * inv_p for v in A[col]]
        for r in range(n):
            if r != col and A[r][col] != 0:
                f = A[r][col]
                A[r] = [A[r][j] - f * A[col][j] for j in range(2 * n)]
    return [row[n:] for row in A]


def projector_matrix(B, G=None):
    """P = B (B^T G B)^{-1} B^T G, the G-orthogonal projector onto col(B). G=None gives the
    Euclidean B(B^T B)^{-1}B^T. Returns NO_PROJECTION if B^T G B is singular."""
    n = len(B)
    if G is None:
        G = _identity(n)
    Bt = _transpose(B)
    BtG = _matmul(Bt, G)
    BtGB = _matmul(BtG, B)
    inv = gram_inverse(BtGB)
    if inv is None:
        return NO_PROJECTION
    return _matmul(_matmul(B, inv), BtG)


def project(x, P):
    """P x (exact)."""
    return _matvec(P, x)


def residual(x, P):
    """r = x - P x (exact)."""
    px = _matvec(P, x)
    return [Frac(x[i]) - px[i] for i in range(len(x))]


def residual_norm(x, P, G=None):
    """<r, r>_G = r^T G r (exact). Zero IFF x is captured by the forced subspace."""
    r = residual(x, P)
    if G is None:
        G = _identity(len(r))
    Gr = _matvec(G, r)
    return sum(r[i] * Gr[i] for i in range(len(r)))
