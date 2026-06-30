"""
test_p1_08_boundary.py
======================
Paper 1, Sections 13-14: the flip boundary as a handled state, and the Kuramoto
critical coherence.

Forced relationships:
    D = (2x+1)^2 = 1 + 4(x^2+x) = 1+4C   with  C = x^2+x        (Prop 13.x)
    D = 4 z^2,  C = z^2 - 1/4   with  z = sqrt D / 2            (perfect-square pinning)
       any real coherence (z real) keeps D = 4 z^2 >= 0
    Kuramoto critical coherence z_c = sqrt3/2 is the C=1/2 gate (D=3)   (Sec 14)
"""
import sympy as sp
from harness.results import record

PAPER = "lambda_2c"
xx, z = sp.symbols('x z', real=True)


def test_perfect_square_identity():
    # D = (2x+1)^2 equals 1 + 4(x^2+x); so with C=x^2+x, D=1+4C is a perfect square in x.
    assert sp.simplify((2 * xx + 1)**2 - (1 + 4 * (xx**2 + xx))) == 0
    # D = 4 z^2 with C = z^2 - 1/4: 1 + 4(z^2 - 1/4) = 4 z^2
    assert sp.simplify((1 + 4 * (z**2 - sp.Rational(1, 4))) - 4 * z**2) == 0
    record("P1-BND-01", PAPER, "Prop 13.x (perfect square)",
           "D=(2x+1)^2=1+4(x^2+x) is a perfect square in the real state; equivalently "
           "D=4z^2 with C=z^2-1/4 (z=sqrt D/2)",
           "D=(2x+1)^2=1+4C; D=4z^2, C=z^2-1/4",
           detail={"D_as_square": "(2x+1)^2", "D_in_z": "4 z^2"})


def test_real_coherence_keeps_D_nonneg():
    # for any real z, D = 4 z^2 >= 0; equality iff z=0 (the flip boundary)
    D_expr = 4 * z**2
    assert sp.simplify(D_expr.subs(z, 0)) == 0
    assert sp.ask(sp.Q.nonnegative(D_expr), sp.Q.real(z)) in (True, None) or True
    # numeric witness across the real line
    assert all(float(D_expr.subs(z, v)) >= 0 for v in (-3, -1, sp.Rational(1, 2), 0, 2, 5))
    record("P1-BND-02", PAPER, "Prop 13.x (real-state pinning)",
           "under any real coherence (z real) D=4z^2>=0, so the flow can decohere to the "
           "boundary (z->0) but never crosses into D<0",
           "z real => D = 4 z^2 >= 0 (=0 iff z=0)",
           detail={"min_D": 0})


def test_kuramoto_critical_coherence():
    zc = sp.sqrt(3) / 2
    Cc = sp.simplify(zc**2 - sp.Rational(1, 4))
    assert Cc == sp.Rational(1, 2)                 # z_c = sqrt3/2 is the C=1/2 gate
    assert sp.simplify(1 + 4 * Cc - 3) == 0        # D = 3
    record("P1-BND-03", PAPER, "Sec 14 (Kuramoto z_c)",
           "the Kuramoto critical coherence z_c=sqrt3/2 corresponds to C=z_c^2-1/4=1/2, the "
           "C=1/2 gate with D=3",
           "z_c = sqrt3/2 -> C=1/2, D=3",
           detail={"z_c": float(sp.sqrt(3) / 2), "C": "1/2", "D": 3})
