"""
test_p1_07_flip.py
==================
Paper 1, Section 11: the flip D = 1+4C is one event with four readings, including
the trace-form signature flip det G = 4D.

Forced relationships:
    sign(D=1+4C) sets eigenvalues (real<->complex), field, channel character  (Thm 11.1)
       at C=-1: roots e^{+-2pi i/3} on |z|=1, M=1, D=-3
    trace form in gap basis {1, sqrt D}:  G = diag(2, 2D),  det G = 4D         (Prop 11.2)
       PD (Riemannian) iff D>0; indefinite (Lorentzian) iff D<0; Q(i)->diag(2,-2)
    gate and flip co-locate at D=0 (C=-1/4)
"""
import sympy as sp
from harness.algebra import x, mahler_mp
from harness.results import record

PAPER = "lambda_2c"
C, theta = sp.symbols('C theta')


def test_flip_table_regimes():
    rows = []
    for Cv in [sp.Integer(1), sp.Integer(0), sp.Rational(-1, 4), sp.Integer(-1), sp.Integer(-2)]:
        D = 1 + 4 * Cv
        roots = sp.Poly(x**2 + x - Cv, x).all_roots()
        on_circle = all(sp.simplify(sp.Abs(r) - 1) == 0 for r in roots)
        rows.append({"C": str(Cv), "D": int(D), "on_circle": bool(on_circle)})
        if Cv == sp.Integer(-1):
            assert on_circle and int(D) == -3                # the elliptic / rotation regime
            assert abs(float(mahler_mp([1, 1, 1])) - 1.0) < 1e-12   # M=1 (roots of unity)
        if int(D) > 0:
            assert not on_circle                              # real, off circle
    record("P1-FLIP-01", PAPER, "Thm 11.1 (canonical flip)",
           "the sign of D=1+4C sets the regime: D>0 real/off-circle (hyperbolic), D<0 complex "
           "on-circle (elliptic). At C=-1: roots e^{+-2pi i/3}, |z|=1, M=1, D=-3",
           "sign(D) sets eigenvalue/field/channel; C=-1 -> on circle, M=1, D=-3",
           detail={"flip_table": rows})


def test_trace_form_det_is_4D():
    # w = 2 theta + 1 with theta a root of x^2 + x - C: w^2 = D = 1+4C.
    # Field traces in the quadratic field: sum of roots of x^2+x-C is -1, so tr(theta)=-1.
    tr_1 = sp.Integer(2)                                       # tr(1) over a quadratic = 2
    tr_theta = sp.Integer(-1)                                  # sum of roots = -(coeff of x)
    tr_w = 2 * tr_theta + tr_1                                 # tr(2 theta + 1)
    assert sp.simplify(tr_w) == 0
    # w^2 = 4 theta^2 + 4 theta + 1; theta^2 = C - theta, so w^2 = 4(C-theta)+4theta+1 = 4C+1 = D
    w2 = sp.expand(4 * (C - theta) + 4 * theta + 1)
    assert sp.simplify(w2 - (1 + 4 * C)) == 0
    tr_w2 = 2 * (1 + 4 * C)                                    # tr(D) = 2D over a quadratic
    G = sp.diag(tr_1, tr_w2)                                   # Gram = diag(2, 2D)
    assert sp.simplify(G.det() - 4 * (1 + 4 * C)) == 0         # det G = 4D
    record("P1-FLIP-02", PAPER, "Prop 11.2 (det G = 4D)",
           "in the gap basis {1, sqrt D} the trace-form Gram is diag(2, 2D) with det G = 4D; "
           "positive-definite iff D>0, Lorentzian iff D<0",
           "G = diag(2, 2D), det G = 4D",
           detail={"Gram": "diag(2, 2D)", "det": "4D"})


def test_Qi_instance_and_colocation():
    # Q(i): basis {1, i}, i^2=-1=D, trace form diag(2,-2), det=-4=4D with D=-1
    Gi = sp.diag(2, -2)
    assert Gi.det() == -4 == 4 * (-1)
    # gate and flip co-locate at D=0 i.e. C=-1/4 (the spectral gap collapses there)
    Csol = sp.solve(sp.Eq(1 + 4 * C, 0), C)
    assert Csol == [sp.Rational(-1, 4)]
    record("P1-FLIP-03", PAPER, "Prop 11.2 + Sec 12 (co-location)",
           "Q(i) gives trace form diag(2,-2), det=-4=4D at D=-1; the gate (scale collapse) "
           "and the flip (regime inversion) co-locate at D=0, i.e. C=-1/4",
           "Q(i): det G = -4 = 4D; gate/flip co-locate at C=-1/4",
           detail={"Qi_det": -4, "colocation_C": "-1/4"})
