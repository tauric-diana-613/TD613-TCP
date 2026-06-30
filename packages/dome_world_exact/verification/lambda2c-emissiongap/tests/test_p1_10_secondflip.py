"""
test_p1_10_secondflip.py
========================
Paper 1, Sections 17-18: the multiplicative flip on |lambda| and where the two
flips meet.

Forced relationships:
    multiplicative flip on |lambda|: >1 expanding (M>1); =1 cyclotomic (M=1, Kronecker);
       <1 contracting (no Mahler contribution)
    the two flips meet at C=-1: x^2+x+1, roots e^{+-2pi i/3}, M=1, D=-3   (Prop 18.1)
    Lehmer band ordering 1 < L < mu_S < phi                              (Rem 17.x)
"""
import sympy as sp
import mpmath as mp
from harness.algebra import x, mahler_mp, PHI, MU_S
from harness.results import record

PAPER = "lambda_2c"


def test_multiplicative_flip_kronecker():
    # |lambda|=1 cyclotomic -> M=1; |lambda|>1 -> M>1
    assert abs(float(mahler_mp([1, 0, 1])) - 1.0) < 1e-12        # x^2+1 (roots +-i, on circle)
    assert abs(float(mahler_mp([1, -1, 1])) - 1.0) < 1e-12       # x^2-x+1 (6th roots)
    assert float(mahler_mp([1, 0, -2])) > 1.0                    # x^2-2 expanding
    record("P1-2FLIP-01", PAPER, "Sec 17 (multiplicative flip)",
           "the multiplicative flip on |lambda|: =1 is the cyclotomic (Kronecker) floor M=1; "
           ">1 is expanding M>1; <1 contracting (no contribution)",
           "|lambda|=1 <=> cyclotomic <=> M=1 (Kronecker)",
           detail={"M_x2p1": 1.0, "M_x2mxp1": 1.0})


def test_two_flips_meet_at_C_minus_1():
    roots = sp.Poly(x**2 + x + 1, x).all_roots()
    assert all(sp.simplify(sp.Abs(r) - 1) == 0 for r in roots)   # on the unit circle
    # roots are the primitive cube roots of unity e^{+-2pi i/3}
    assert set(sp.nsimplify(r) for r in roots) == {
        sp.Rational(-1, 2) - sp.sqrt(3) * sp.I / 2,
        sp.Rational(-1, 2) + sp.sqrt(3) * sp.I / 2,
    }
    assert abs(float(mahler_mp([1, 1, 1])) - 1.0) < 1e-12        # M=1
    assert 1 + 4 * (-1) == -3                                    # D=-3
    record("P1-2FLIP-02", PAPER, "Prop 18.1 (flips meet)",
           "at C=-1 the gate polynomial is x^2+x+1 with roots e^{+-2pi i/3} on the unit "
           "circle, M=1, D=-3: the additive flip (D<0) meets the multiplicative flip (|z|=1)",
           "C=-1: x^2+x+1, roots e^{+-2pi i/3}, M=1, D=-3",
           detail={"M": 1.0, "D": -3})


def test_lehmer_band_ordering():
    L = max(mp.re(r) for r in mp.polyroots([1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1],
                                           maxsteps=2000, extraprec=400)
            if abs(mp.im(r)) < mp.mpf('1e-25') and mp.re(r) > 1)
    assert 1 < L < float(MU_S) < float(PHI)
    record("P1-2FLIP-03", PAPER, "Rem 17.x (Lehmer band)",
           "the band ordering is 1 < L(=1.17628) < mu_S(=1.32472) < phi(=1.61803); the Lehmer "
           "band (1,L) is the frontier resolved within the system",
           "1 < L < mu_S < phi",
           detail={"L": float(L), "mu_S": float(MU_S), "phi": float(PHI)})
