"""
test_p1_09_kform.py
===================
Paper 1, Section 16: the K-formation seed astride the fold.

Forced relationship (Prop 16.1):
    f(x) = x^4 + 5x^2 - 5,  g(y) = y^2 + 5y - 5  with y = x^2:
       y+ = (-5 + 3 sqrt5)/2 > 0  -> real roots +-K,  K = sqrt(y+) = 5^(1/4)/phi
       y- = (-5 - 3 sqrt5)/2 < 0  -> imaginary roots +-i beta, beta = sqrt|y-|
    M(f) = beta^2 = (5 + 3 sqrt5)/2
"""
import sympy as sp
from harness.algebra import x, PHI, mahler_mp
from harness.results import record

PAPER = "lambda_2c"
y = sp.Symbol('y')


def test_kform_straddles_the_fold():
    yroots = sp.solve(sp.Eq(y**2 + 5 * y - 5, 0), y)
    yroots = sorted(yroots, key=lambda v: float(v))
    yminus, yplus = yroots[0], yroots[1]
    assert sp.simplify(yplus - (-5 + 3 * sp.sqrt(5)) / 2) == 0 and float(yplus) > 0
    assert sp.simplify(yminus - (-5 - 3 * sp.sqrt(5)) / 2) == 0 and float(yminus) < 0
    record("P1-KFORM-01", PAPER, "Prop 16.1 (fold straddle)",
           "x^4+5x^2-5 as y^2+5y-5 (y=x^2) has roots straddling 0: y+=(-5+3sqrt5)/2>0 (real "
           "terrain) and y-=(-5-3sqrt5)/2<0 (rotation)",
           "y+ = (-5+3sqrt5)/2 > 0, y- = (-5-3sqrt5)/2 < 0",
           detail={"y_plus": float(yplus), "y_minus": float(yminus)})


def test_K_and_beta_and_mahler():
    yplus = (-5 + 3 * sp.sqrt(5)) / 2
    yminus = (-5 - 3 * sp.sqrt(5)) / 2
    K = sp.sqrt(yplus)
    assert sp.simplify(K - 5**sp.Rational(1, 4) / PHI) == 0      # K = 5^(1/4)/phi
    beta = sp.sqrt(-yminus)
    Mf = beta**2
    assert sp.simplify(Mf - (5 + 3 * sp.sqrt(5)) / 2) == 0       # M(f) = beta^2
    assert abs(float(mahler_mp([1, 0, 5, 0, -5])) - float(Mf)) < 1e-9
    record("P1-KFORM-02", PAPER, "Prop 16.1 (K, beta, Mahler)",
           "the real roots are +-K with K=5^(1/4)/phi; the imaginary roots are +-i beta with "
           "beta=sqrt|y-|; M(x^4+5x^2-5)=beta^2=(5+3sqrt5)/2",
           "K=5^(1/4)/phi, M(f)=beta^2=(5+3sqrt5)/2",
           detail={"K": float(K), "beta": float(beta), "M": float(Mf)})
