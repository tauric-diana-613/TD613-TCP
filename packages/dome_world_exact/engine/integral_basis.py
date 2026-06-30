"""integral_basis.py -- L0 exact vector core: coordinate object + trace-form Gram.

Part of the KIRA Vector Substrate (SPEC_KIRA_VECTOR_SUBSTRATE.md section 3, layer L0).
A number field K = Q[x]/(min_poly) is realized as a Q-vector space on the power basis
{1, theta, ..., theta^(d-1)}; the metric is the trace form <x,y> = Tr_{K/Q}(x*y),
computed EXACTLY from conjugate power sums via Newton's identities -- NEVER by summing
Durand-Kerner roots (G8).

Exactness contract: everything here is int/Fraction EXACT except embed_minkowski, the
FLOAT display chart that evaluates an element at loom.eigenvalues (the Galois conjugates
= Minkowski coordinates). Pure stdlib + fractions.Fraction; NO numpy (G8). Seeds are
monic integer minimal polynomials only -- algebraic integers (G10). L0 may reuse loom;
only the matrix_plates kernel (L1) must not (G9).
"""
from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from typing import List, Optional

Frac = Fraction


# --------------------------------------------------------------------------- #
# Data objects
# --------------------------------------------------------------------------- #
@dataclass
class FieldElement:
    min_poly: List[int]            # monic integer, high -> low (the defining seed poly)
    power_coords: List[Fraction]   # length d: coeffs in {1, theta, ..., theta^(d-1)}


@dataclass
class IntegralBasis:
    min_poly: List[int]
    degree: int                    # d == len(min_poly) - 1
    basis_elements: Optional[list] # O_K basis (None -> power basis {1, ..., theta^(d-1)})
    P2I: List[List[Fraction]]      # change-of-basis power -> integral (d x d, exact)
    I2P: List[List[Fraction]]      # exact inverse, integral -> power


# --------------------------------------------------------------------------- #
# tiny exact linear algebra (Fraction; no numpy)
# --------------------------------------------------------------------------- #
def _identity(n):
    return [[Frac(1) if i == j else Frac(0) for j in range(n)] for i in range(n)]


def _matvec(M, v):
    return [sum(Frac(M[i][j]) * Frac(v[j]) for j in range(len(v))) for i in range(len(M))]


def _degree(min_poly):
    return len(min_poly) - 1


def _guard_int_monic(min_poly):
    """Coefficient guard (mirrors loom.py / linalg.py): raise on non-monic / non-integer.
    Algebraic-integer seeds only (G10)."""
    mp = list(min_poly)
    if len(mp) < 2 or int(mp[0]) != 1:
        raise ValueError(f"min_poly must be monic with degree >= 1: {min_poly!r}")
    out = []
    for c in mp:
        if c != int(c):
            raise ValueError(
                f"min_poly must be integer (algebraic-integer seed only, G10): {min_poly!r}")
        out.append(int(c))
    return out


def _reduce(coeffs, mp):
    """Reduce a polynomial (Fraction coeffs, low->high) modulo the monic min_poly, using
    theta^n = -(mp[1] theta^(n-1) + ... + mp[n]). Returns a length-d Fraction list."""
    n = _degree(mp)
    raw = [Frac(c) for c in coeffs]
    if len(raw) < n:
        raw = raw + [Frac(0)] * (n - len(raw))
    for power in range(len(raw) - 1, n - 1, -1):
        c = raw[power]
        if c == 0:
            continue
        raw[power] = Frac(0)
        for k in range(1, n + 1):                       # theta^power = -sum mp[k] theta^(power-k)
            raw[power - k] += -mp[k] * c
    return raw[:n]


# --------------------------------------------------------------------------- #
# (a) the coordinate object
# --------------------------------------------------------------------------- #
def integral_basis_for(min_poly):
    """IntegralBasis for K = Q[x]/(min_poly).

    Default basis is the power basis {1, theta, ..., theta^(d-1)} with identity
    change-of-basis -- exact and correct for the shipped seeds (the golden {1, phi} IS
    the maximal order, and the SPEC fixes {1, sqrt d} for Q(sqrt2/3/5)). A sympy-computed
    O_K integral basis is a documented refinement behind this same interface (P2I/I2P).
    """
    mp = _guard_int_monic(min_poly)
    d = _degree(mp)
    ident = _identity(d)
    return IntegralBasis(mp, d, None, ident, ident)


def element_from_power(min_poly, power_coords):
    """A FieldElement from power-basis coordinates (reduced mod min_poly, exact)."""
    mp = _guard_int_monic(min_poly)
    return FieldElement(mp, _reduce([Frac(c) for c in power_coords], mp))


def to_integral_coords(elt, ib):
    """Power coords -> integral-basis coords (P2I matvec, exact)."""
    return _matvec(ib.P2I, elt.power_coords)


def to_power_coords(coords, ib):
    """Integral-basis coords -> FieldElement in power coords (I2P matvec, exact)."""
    return FieldElement(list(ib.min_poly), _matvec(ib.I2P, [Frac(c) for c in coords]))


def embed_minkowski(elt):
    """FLOAT display chart: evaluate elt at each Galois conjugate (loom.eigenvalues).
    Display only -- never feeds the exact membership decision (G8, Principle 5.12)."""
    import loom
    roots = loom.eigenvalues(elt.min_poly)
    out = []
    for r in roots:
        acc, rk = 0j, 1 + 0j
        for c in elt.power_coords:
            acc += complex(float(c)) * rk
            rk *= r
        out.append(acc)
    return out


# --------------------------------------------------------------------------- #
# (b) trace-form Gram via Newton's identities (EXACT, G8)
# --------------------------------------------------------------------------- #
def conjugate_power_sums(min_poly, up_to):
    """EXACT power sums p_k = sum_i theta_i^k for k = 0..up_to, via Newton's identities on
    the monic charpoly -- NEVER by summing roots (G8). With min_poly high->low monic,
    the elementary symmetric functions are e_k = (-1)^k * min_poly[k]."""
    mp = _guard_int_monic(min_poly)
    n = _degree(mp)
    e = [0] * (n + 1)
    for k in range(1, n + 1):
        e[k] = ((-1) ** k) * mp[k]
    p = [0] * (up_to + 1)
    p[0] = n
    for k in range(1, up_to + 1):
        total = 0
        for i in range(1, min(k - 1, n) + 1):
            total += ((-1) ** (i - 1)) * e[i] * p[k - i]
        if k <= n:
            total += ((-1) ** (k - 1)) * k * e[k]
        p[k] = total
    return p


def mult_in_power_basis(a, b, min_poly):
    """Product in K = Q[x]/(min_poly), reduced mod min_poly (exact Fraction)."""
    mp = _guard_int_monic(min_poly)
    a = [Frac(x) for x in a]
    b = [Frac(x) for x in b]
    raw = [Frac(0)] * (len(a) + len(b) - 1)
    for i, ai in enumerate(a):
        if ai == 0:
            continue
        for j, bj in enumerate(b):
            if bj == 0:
                continue
            raw[i + j] += ai * bj
    return _reduce(raw, mp)


def field_trace(elt):
    """Tr_{K/Q}(elt) = sum_k power_coords[k] * p_k (p_k the k-th conjugate power sum). EXACT."""
    pc = elt.power_coords
    p = conjugate_power_sums(elt.min_poly, max(0, len(pc) - 1))
    return sum(Frac(pc[k]) * p[k] for k in range(len(pc)))


def gram_trace_form(ib):
    """G[i][j] = Tr(b_i * b_j) over the integral basis. EXACT (Newton power sums)."""
    d = ib.degree
    p = conjugate_power_sums(ib.min_poly, d - 1)
    basis_pow = [_matvec(ib.I2P, [Frac(1) if t == i else Frac(0) for t in range(d)])
                 for i in range(d)]
    G = [[Frac(0)] * d for _ in range(d)]
    for i in range(d):
        for j in range(d):
            prod = mult_in_power_basis(basis_pow[i], basis_pow[j], ib.min_poly)
            G[i][j] = sum(prod[k] * p[k] for k in range(d))
    return G


def trace_form_inner(x, y, G):
    """<x, y> = x^T G y (exact)."""
    Gy = _matvec(G, y)
    return sum(Frac(x[i]) * Gy[i] for i in range(len(x)))


def trace_form_norm(x, G):
    """<x, x> = x^T G x (exact)."""
    return trace_form_inner(x, x, G)


def trace_pairing(ex, ey, ib):
    """Tr(ex * ey) computed directly from the reduced product and the power sums (exact)."""
    prod = mult_in_power_basis(ex.power_coords, ey.power_coords, ib.min_poly)
    p = conjugate_power_sums(ib.min_poly, max(0, len(prod) - 1))
    return sum(prod[k] * p[k] for k in range(len(prod)))
