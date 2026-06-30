"""test_coords_to_minpoly.py -- assert-bearing gate for A2.P0 (exact in-field minpoly via SNF).

Verifies coords_to_minpoly returns the EXACT monic-integer minimal polynomial, and cross-checks
each result three independent ways: against the vendored invariant_factors kernel, against
loom.charpoly (the charpoly of the regular representation), and by proving the returned polynomial
ANNIHILATES the element's regular-representation matrix (mp(M) == 0).
"""
import os
import subprocess
import sys
import textwrap
from fractions import Fraction

import pytest

_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)
for _p in (_HERE, _ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import coords_to_minpoly as ctm
from coords_to_minpoly import coords_to_minpoly, regular_representation
from invariant_factors import invariant_factors as _kernel_if   # vendored SNF kernel (cross-check)
from integral_basis import mult_in_power_basis                  # L0 (independent M construction)
import loom                                                     # independent charpoly kernel

F = Fraction
Q5   = [1, 0, -5]            # Q(sqrt5)       = Q[x]/(x^2 - 5),        theta = sqrt5
QPHI = [1, -1, -1]          # Q(phi)         = Q[x]/(x^2 - x - 1),    theta = phi
F4   = [1, 0, -10, 0, 1]    # Q(sqrt2+sqrt3) = Q[x]/(x^4 - 10x^2 + 1), theta = sqrt2 + sqrt3


# -- exact-value cases ------------------------------------------------------ #
def test_phi_in_Q_sqrt5_gives_x2_minus_x_minus_1():
    # phi = (1 + sqrt5)/2 -> coords [1/2, 1/2] in {1, sqrt5}; minpoly x^2 - x - 1 (Fraction in, int out)
    assert coords_to_minpoly([F(1, 2), F(1, 2)], Q5) == [1, -1, -1]
    assert coords_to_minpoly([0, 1], QPHI) == [1, -1, -1]      # phi as the generator of its own field


def test_2sqrt6_in_Q_sqrt2sqrt3_gives_x2_minus_24():
    # 2 sqrt6 = theta^2 - 5 -> coords [-5, 0, 1, 0]; minpoly x^2 - 24
    assert coords_to_minpoly([-5, 0, 1, 0], F4) == [1, 0, -24]


def test_rational_integer_gives_x_minus_c():
    assert coords_to_minpoly([3, 0, 0, 0], F4) == [1, -3]      # element 3 -> x - 3
    assert coords_to_minpoly([F(-2), 0], Q5) == [1, 2]         # element -2 -> x + 2
    assert coords_to_minpoly([0, 0, 0, 0], F4) == [1, 0]       # element 0 -> x


def test_primitive_element_gives_full_degree_minpoly():
    assert coords_to_minpoly([0, 1, 0, 0], F4) == F4           # theta generates K -> the ambient quartic
    mp = coords_to_minpoly([1, 1, 0, 0], F4)                   # 1 + theta is also primitive
    assert mp[0] == 1 and len(mp) - 1 == 4                     # monic, full degree 4
    assert all(isinstance(c, int) for c in mp)                 # monic-integer (G10)


# -- malformed / G10 raises ------------------------------------------------- #
def test_malformed_and_non_integer_raise_cleanly():
    with pytest.raises(ValueError):
        coords_to_minpoly([], F4)                              # empty
    with pytest.raises(ValueError):
        coords_to_minpoly([1, 2, 3], F4)                       # wrong length (degree 4 needs 4 coords)
    with pytest.raises(ValueError):
        coords_to_minpoly([0, 1], [2, 0, -5])                  # non-monic field
    with pytest.raises(ValueError):
        coords_to_minpoly([0, 1], [1, F(1, 2), -5])            # non-integer field coeff (G10)
    with pytest.raises(TypeError):
        coords_to_minpoly([1.5, 0, 0, 0], F4)                  # float coordinate (G8)
    with pytest.raises(ValueError):
        coords_to_minpoly([F(1, 2), 0], Q5)                    # 1/2 is not an algebraic integer (G10)


# -- independent cross-check machinery -------------------------------------- #
def _matmul(A, B):
    n, k, m = len(A), len(B), len(B[0])
    return [[sum(A[i][t] * B[t][j] for t in range(k)) for j in range(m)] for i in range(n)]


def _poly_eval_matrix(high_low, M):
    """Horner: p(M) for p given HIGH->LOW; exact."""
    n = len(M)
    res = [[F(0)] * n for _ in range(n)]
    for coeff in high_low:
        res = _matmul(res, M)
        for r in range(n):
            res[r][r] += F(coeff)
    return res


def _is_zero(M):
    return all(M[i][j] == 0 for i in range(len(M)) for j in range(len(M[0])))


def _M_via_mult_columns(coords, field):
    """Independent regular-rep build: column j = coords of alpha * theta^j via the L0 multiply."""
    d = len(field) - 1
    cols = []
    for j in range(d):
        unit = [F(1) if t == j else F(0) for t in range(d)]
        cols.append(mult_in_power_basis([F(c) for c in coords], unit, field))
    return [[cols[j][r] for j in range(d)] for r in range(d)]


def _polymul(a, b):   # LOW->HIGH integer poly product
    r = [0] * (len(a) + len(b) - 1)
    for i, ca in enumerate(a):
        for j, cb in enumerate(b):
            r[i + j] += ca * cb
    return r


_CASES = [
    ([F(1, 2), F(1, 2)], Q5),
    ([-5, 0, 1, 0], F4),
    ([3, 0, 0, 0], F4),
    ([0, 1, 0, 0], F4),
    ([1, 1, 0, 0], F4),
    ([0, 1], QPHI),
]


def test_cross_check_kernel_loom_and_annihilation():
    for coords, field in _CASES:
        M = regular_representation(coords, field)
        mp = coords_to_minpoly(coords, field)

        # (1) the regular rep matches an INDEPENDENT construction (L0 mult-by-alpha columns)
        assert M == _M_via_mult_columns(coords, field)

        # (2) agrees with the kernel directly: minpoly == last invariant factor (HIGH->LOW)
        last = _kernel_if(M)[-1]                                # LOW->HIGH, monic
        assert mp == [int(last[k]) for k in range(len(last) - 1, -1, -1)]

        # (3) the minpoly ANNIHILATES the element: mp(M) == 0  (independent of the SNF path)
        assert _is_zero(_poly_eval_matrix(mp, M))

        # (4) charpoly cross-check via loom (independent kernel), integer M only
        if all(M[i][j].denominator == 1 for i in range(len(M)) for j in range(len(M))):
            charpoly_lh = [1]
            for f in _kernel_if(M):                             # product of invariant factors == charpoly
                charpoly_lh = _polymul(charpoly_lh, [int(c) for c in f])
            charpoly_hl = [charpoly_lh[k] for k in range(len(charpoly_lh) - 1, -1, -1)]
            Mi = [[int(M[i][j]) for j in range(len(M))] for i in range(len(M))]
            assert loom.charpoly(Mi) == charpoly_hl


# -- model-layer purity: stdlib + L0/kernel only; no KIRA, no z, no numpy --- #
def test_pure_model_layer_no_kira_no_numpy():
    code = textwrap.dedent(
        """
        import os, sys
        sys.path.insert(0, os.path.dirname(%r))
        from fractions import Fraction as F
        import coords_to_minpoly as ctm
        assert ctm.coords_to_minpoly([F(1,2),F(1,2)], [1,0,-5]) == [1,-1,-1]
        assert ctm.coords_to_minpoly([-5,0,1,0], [1,0,-10,0,1]) == [1,0,-24]
        assert "numpy" not in sys.modules, "pulled in numpy (the G8 path must be pure stdlib)"
        assert "kira_server_canonical" not in sys.modules
        assert not any(m.startswith("kira") for m in sys.modules)
        print("CLEAN")
        """ % (ctm.__file__,)
    )
    out = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)
    assert out.returncode == 0, out.stdout + out.stderr
    assert "CLEAN" in out.stdout

    # static: scan IMPORTS (not docstring prose) -- reuses the SNF kernel + L0 guard, no kira, no numpy
    import ast
    imported = set()
    for node in ast.walk(ast.parse(open(ctm.__file__, encoding="utf-8").read())):
        if isinstance(node, ast.Import):
            for n in node.names:
                imported.add(n.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imported.add(node.module.split(".")[0])
    assert {"invariant_factors", "integral_basis"} <= imported   # reuses the SNF kernel + L0 G10 guard
    assert "numpy" not in imported                               # pure stdlib path (G8)
    assert not any(m.startswith("kira") for m in imported)       # model-layer only
