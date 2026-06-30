"""
test_constants.py
=================
The canonical constant registry of both papers, each pinned to its EXACT minimal
polynomial. This file is the reference foundation: every constant that appears in
a forced equation elsewhere is anchored here once, in exact arithmetic.

Core relationships proved (see README for the table):
    phi  : x^2 - x - 1            tau   : x^2 + x - 1
    mu_S : x^3 - x - 1            L     : Lehmer degree-10 (Salem)
    beta4: x^4 - x^3 - x^2 - x+1  sqrtD : x^2 - D  for D in {2,3,5}
    gap  : x^2 - 7x + 1 (=phi^4)  K-form: x^4 + 5x^2 - 5
    z_c  : 4x^2 - 3 (=sqrt3/2)    CRIT  : 9x^2 - 9x + 1 (=phi^2/3)
"""
import sympy as sp
from harness.algebra import x, PHI, PSI, SQRT5, MU_S, lucas, fib, mahler_mp, is_salem
from harness.results import record

PAPER = "shared"


def minpoly(elem):
    return sp.minimal_polynomial(elem, x)


def test_phi_and_tau_minpolys():
    phi, tau = PHI, (-1 + SQRT5) / 2          # tau = 1/phi is a root of x^2 + x - 1
    assert sp.expand(minpoly(phi) - (x**2 - x - 1)) == 0
    assert sp.expand(minpoly(tau) - (x**2 + x - 1)) == 0
    assert sp.simplify(PHI * PSI) == -1        # product of conjugates = det = -1
    assert sp.simplify(PHI + PSI) == 1         # trace = 1
    record("CONST-01", PAPER, "catalog: golden seeds",
           "phi is the root of x^2-x-1; tau the root of x^2+x-1; phi*psi=-1, phi+psi=1",
           "minpoly(phi)=x^2-x-1, minpoly(tau)=x^2+x-1",
           detail={"phi": float(PHI), "phi_psi_product": -1, "phi_psi_sum": 1})


def test_mu_S_plastic():
    # plastic number is the real root of x^3 - x - 1; pin precision locally so the check is
    # immune to any module's global mpmath dps setting.
    import mpmath as _mp
    with _mp.workdps(60):
        mu = _mp.findroot(lambda z: z**3 - z - 1, 1.3247)
        assert abs(mu**3 - mu - 1) < 1e-40
    assert float(MU_S) < float(PHI)            # Smyth floor sits below golden
    record("CONST-02", PAPER, "Smyth floor",
           "mu_S is the plastic number, real root of x^3-x-1, and mu_S < phi",
           "mu_S^3 - mu_S - 1 = 0",
           detail={"mu_S": float(MU_S), "phi": float(PHI), "mu_S<phi": float(MU_S) < float(PHI)})


def test_lehmer_is_salem_below_mu_S():
    L = [1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1]
    assert sp.Poly(L, x).is_irreducible
    assert is_salem(L)                          # exact flip-straddle classification
    M = mahler_mp(L)
    assert float(M) < float(MU_S)               # Lehmer measure below the Smyth floor
    record("CONST-03", PAPER, "Lehmer number",
           "Lehmer's degree-10 polynomial is an irreducible Salem polynomial with "
           "Mahler measure ~1.17628 < mu_S",
           "M(Lehmer) < mu_S < phi",
           detail={"M_lehmer": float(M), "mu_S": float(MU_S), "is_salem": True})


def test_beta4_minimal_degree4_salem():
    b4 = [1, -1, -1, -1, 1]
    assert sp.Poly(b4, x).is_irreducible
    assert is_salem(b4)
    M = mahler_mp(b4)
    assert float(M) > float(PHI)                # the degree-4 Salem floor exceeds phi
    record("CONST-04", PAPER, "degree-4 Salem floor",
           "x^4-x^3-x^2-x+1 is the minimal degree-4 Salem polynomial; beta4 ~1.72208 > phi",
           "beta4 = M(x^4-x^3-x^2-x+1) > phi",
           detail={"beta4": float(M), "phi": float(PHI)})


def test_gate_radicand_seeds():
    # x^2 - D for D in {2,3,5}; Mahler measure of x^2 - D is exactly D (both roots off circle)
    for D in (2, 3, 5):
        Mp = sp.expand(minpoly(sp.sqrt(D)) - (x**2 - D))
        assert Mp == 0
        assert abs(float(mahler_mp([1, 0, -D])) - D) < 1e-30
    record("CONST-05", PAPER, "gate-ladder radicand seeds",
           "x^2-D for D in {2,3,5} are the gate seeds; M(x^2-D)=D exactly",
           "minpoly(sqrt(D))=x^2-D, M(x^2-D)=D",
           detail={"D": [2, 3, 5], "mahler": [2.0, 3.0, 5.0]})


def test_gap_seed_is_phi4():
    gap = PHI**4
    assert sp.expand(minpoly(gap) - (x**2 - 7 * x + 1)) == 0
    assert sp.simplify(gap + PHI**(-4) - lucas(4)) == 0     # phi^4 + phi^-4 = L_4 = 7
    record("CONST-06", PAPER, "gap seed",
           "gap = phi^4 has minimal polynomial x^2-7x+1; phi^4 + phi^-4 = L_4 = 7",
           "minpoly(phi^4)=x^2-7x+1, trace=L_4=7",
           detail={"gap": float(gap), "L4": lucas(4)})


def test_Kformation_minpoly():
    K = 5**sp.Rational(1, 4) / PHI
    assert sp.expand(minpoly(K) - (x**4 + 5 * x**2 - 5)) == 0
    record("CONST-07", PAPER, "K-formation seed",
           "K = 5^(1/4)/phi has minimal polynomial x^4 + 5x^2 - 5",
           "minpoly(K)=x^4+5x^2-5",
           detail={"K": float(K)})


def test_zc_and_critical():
    zc = sp.sqrt(3) / 2
    assert sp.expand(minpoly(zc) - (4 * x**2 - 3)) == 0       # the C=1/2 gate, D=3
    crit = PHI**2 / 3
    assert sp.expand(minpoly(crit) - (9 * x**2 - 9 * x + 1)) == 0
    record("CONST-08", PAPER, "hex anchor & critical",
           "z_c = sqrt3/2 has minpoly 4x^2-3 (C=1/2 gate, D=3); CRITICAL = phi^2/3 has minpoly 9x^2-9x+1",
           "minpoly(sqrt3/2)=4x^2-3, minpoly(phi^2/3)=9x^2-9x+1",
           detail={"z_c": float(zc), "critical": float(crit)})


def test_lucas_fibonacci_seed_identities():
    assert [fib(3), fib(4), fib(5)] == [2, 3, 5]              # the gate discriminants
    assert lucas(4) == 7 and lucas(4) == fib(3) + fib(5)
    assert lucas(4)**2 - 5 * fib(4)**2 == 4                   # Pell at n=4
    record("CONST-09", PAPER, "Lucas/Fibonacci anchors",
           "{F3,F4,F5}={2,3,5} are the gate discriminants; L4=7=F3+F5; Pell L4^2-5F4^2=4",
           "{F3,F4,F5}={2,3,5}, L4=F3+F5=7, L4^2-5F4^2=4",
           detail={"F3F4F5": [2, 3, 5], "L4": 7, "pell": 4})
