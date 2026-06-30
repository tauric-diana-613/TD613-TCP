"""
test_p2_01_algebra.py
=====================
Paper 2, Section 2: the emission catalog, the conjugate-travel hinge, and the
spectral operator semantics.

Forced relationships:
    conjugate-travel hinge: an integer matrix has an integer charpoly, so if an
       algebraic number is an eigenvalue then ALL its Q-conjugates are too      (Lem 2.1)
    spectral operators on spectra / Mahler measures:
       (x)  A (x) B : eigenvalues mu_i * nu_j  (Mahler composes)
       (+)  A (+) B : eigenvalues spec(A) U spec(B)  (Mahler multiplies)
       (.)^2: eigenvalues mu_i^2  (Mahler squares)                              (Def 2.3)
"""
import sympy as sp
from harness.algebra import x, companion, kron, dsum, mahler_mp
from harness.results import record

PAPER = "emission_gap"


def test_conjugates_travel_together():
    # The companion is built so its characteristic polynomial IS the input integer
    # polynomial; hence every Q-conjugate root is an eigenvalue (they share one
    # integer charpoly). We verify the exact polynomial identity.
    for coeffs in ([1, -1, -1], [1, 0, -2], [1, -1, -1, -1, 1], [1, 0, 5, 0, -5]):
        p = sp.Poly(coeffs, x)
        assert p.is_irreducible
        chp = sp.Poly(companion(coeffs).charpoly(x).as_expr(), x)
        assert sp.expand(chp.as_expr() - p.as_expr()) == 0          # charpoly == minpoly
        assert chp.count_roots(-sp.oo, sp.oo) == p.count_roots(-sp.oo, sp.oo)
    record("P2-ALG-01", PAPER, "Lem 2.1 (conjugate-travel hinge)",
           "an integer matrix has integer characteristic polynomial, so an eigenvalue drags "
           "its entire conjugate set along; the companion's charpoly equals the minimal "
           "polynomial, hence carries every conjugate root",
           "charpoly(companion(p)) = p  (all Q-conjugates are eigenvalues)",
           detail={"checked_degrees": [2, 2, 4, 4]})


def test_kron_multiplies_spectra():
    A = companion([1, 0, -2])      # +-sqrt2
    B = companion([1, 0, -3])      # +-sqrt3
    distinct = sorted({complex(e).real for e in (kron(A, B)).eigenvals()})
    expected = sorted([-float(sp.sqrt(6)), float(sp.sqrt(6))])      # {+-sqrt6}
    assert all(abs(a - b) < 1e-9 for a, b in zip(distinct, expected))
    record("P2-ALG-02", PAPER, "Def 2.3 ((x) composes)",
           "the tensor A (x) B has eigenvalues mu_i * nu_j; here {+-sqrt2}*{+-sqrt3}={+-sqrt6}, "
           "so the spectral operator (x) composes the constituent spectra",
           "spec(A (x) B) = { mu_i * nu_j }",
           detail={"example": "sqrt2 (x) sqrt3 -> +-sqrt6"})


def _charpoly_int_coeffs(M):
    return [int(v) for v in sp.Poly(M.charpoly(x).as_expr(), x).all_coeffs()]


def test_dsum_unions_and_multiplies_mahler():
    A = companion([1, -1, -1])     # phi seed, M(x^2-x-1) = phi
    B = companion([1, 0, -5])      # sqrt5 seed, M(x^2-5) = 5  (both roots off the circle)
    Msum = float(mahler_mp(_charpoly_int_coeffs(dsum(A, B))))
    assert abs(Msum - float((1 + sp.sqrt(5)) / 2) * 5) < 1e-9      # M(A (+) B) = phi * 5
    record("P2-ALG-03", PAPER, "Def 2.3 ((+) multiplies Mahler)",
           "the direct sum A (+) B has spectrum spec(A) U spec(B) and Mahler M(A)*M(B); here "
           "M(x^2-x-1)*M(x^2-5) = phi*5 (note M(x^2-5)=5, both roots off the unit circle)",
           "spec(A (+) B) = spec(A) U spec(B), M(A (+) B) = M(A) M(B)",
           detail={"M_sum": Msum, "factors": ["phi", "5"]})


def test_square_squares_mahler():
    A = companion([1, -1, -1])     # M = phi
    M2 = float(mahler_mp(_charpoly_int_coeffs(A * A)))
    assert abs(M2 - float((1 + sp.sqrt(5)) / 2)**2) < 1e-9         # M(A^2) = M(A)^2 = phi^2
    record("P2-ALG-04", PAPER, "Def 2.3 ((.)^2 squares Mahler)",
           "squaring the matrix squares each eigenvalue, hence squares the Mahler measure: "
           "M(A^2)=M(A)^2 (here phi^2)",
           "M(A^2) = M(A)^2",
           detail={"M_squared": M2})
