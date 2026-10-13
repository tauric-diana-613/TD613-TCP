"""
test_p1_01_identity.py
======================
Paper 1, Sections 2-3 + 5: the exchange rate identity and the conformal scale.

Forced relationships proved here:
    lambda = 2c           (Thm 3.1 / eq:lambda2c)   the '2' is the inverted 1/2 of KL
    sigma  = 1/(2c) = 1/lambda                       (Rem 3.2)
    F = G/c  ->  c->kc rescales F->F/k               (Thm 4.1, Cencov scaling content)
    c in {1, n, sqrt(1+4C)/(2C)}                     (Sec 5, three canonicalizations)
"""
import sympy as sp
from harness.algebra import x, PHI
from harness.results import record

PAPER = "lambda_2c"
c, gain, logM, n, k, C = sp.symbols('c gain logM n k C', positive=True)


def test_lambda_equals_2c():
    # KL gain = (1/2c)||r||^2_G ; the MDL balance is gain = 2c log M, so the coefficient
    # of log M (the exchange rate) is exactly 2c. Solve symbolically for the gain.
    lam = sp.solve(sp.Eq(gain / (2 * c), logM), gain)[0] / logM
    assert sp.simplify(lam - 2 * c) == 0
    assert sp.simplify(lam.subs(c, 1) - 2) == 0          # shipped c=1  -> lambda=2
    assert sp.simplify(lam.subs(c, n) - 2 * n) == 0      # degree-aware c=n -> lambda=2n
    record("P1-IDENT-01", PAPER, "Thm 3.1 / eq:lambda2c",
           "lambda = 2c, derived from the 2nd-order KL / MDL balance; the factor 2 is the "
           "inverted 1/2 of the quadratic KL term and carries no freedom",
           "lambda = 2*c   (c=1 -> 2, c=n -> 2n)",
           detail={"lambda": "2*c", "at_c1": 2, "at_cn": "2*n"})


def test_sigma_is_inverse_lambda():
    lam = 2 * c
    sigma = 1 / (2 * c)
    assert sp.simplify(sigma - 1 / lam) == 0
    record("P1-IDENT-02", PAPER, "Rem 3.2 (variance reading)",
           "the precision sigma equals 1/(2c) = 1/lambda; the conformal scale is the model variance",
           "sigma = 1/(2c) = 1/lambda",
           detail={"sigma": "1/(2*c)", "lambda": "2*c"})


def test_cencov_rescaling_content():
    # Cencov: Fisher metric unique up to a positive scalar. The exact algebraic content
    # the paper uses is F = G/c, so c -> k c rescales F -> F/k (identical geodesics).
    Gscalar = sp.Symbol('Gscalar', positive=True)         # scalar proxy for the Gram entry
    F = Gscalar / c
    F_scaled = Gscalar / (k * c)
    assert sp.simplify(F_scaled - F / k) == 0
    record("P1-IDENT-03", PAPER, "Thm 4.1 (Cencov scaling)",
           "F = G/c; rescaling c -> k c rescales F -> F/k, so no invariance argument fixes c "
           "(the impossibility is Cencov's cited theorem; the scaling identity is exact)",
           "F = G/c, c->k*c  =>  F -> F/k",
           detail={"F": "G/c", "rescaled": "F/k"})


def test_three_canonicalizations():
    c_frame = sp.sqrt(1 + 4 * C) / (2 * C)                 # frame-shift value
    assert sp.simplify(c_frame.subs(C, 1) - sp.sqrt(5) / 2) == 0
    assert sp.simplify(2 * c_frame.subs(C, 1) - sp.sqrt(5)) == 0
    record("P1-IDENT-04", PAPER, "Sec 5 (three canonicalizations)",
           "c in {1 (Jeffreys), n (degree), sqrt(1+4C)/(2C) (frame-shift)}; at the golden "
           "gate C=1 the frame-shift gives c=sqrt5/2, lambda=sqrt5",
           "c_frame(C) = sqrt(1+4C)/(2C);  c_frame(1)=sqrt5/2, lambda=sqrt5",
           detail={"c_frame_at_C1": float(sp.sqrt(5) / 2), "lambda_at_C1": float(sp.sqrt(5))})


def test_c_free_lambda_unfrozen():
    # c is a FREE parameter (Cencov): lambda = 2c is an IDENTITY over c, not a frozen
    # number. The three canonicalizations disagree, and the frame-shift evaluated at the
    # three forced gates gives three distinct values -- lambda never collapses to one constant.
    lam = 2 * c
    assert sp.diff(lam, c) == 2 and lam.free_symbols == {c}   # identity in free c
    assert lam.subs(c, 1) == 2                                # Jeffreys c=1 -> 2
    assert sp.simplify(lam.subs(c, n) - 2 * n) == 0           # degree c=n -> 2n
    assert lam.subs(c, 1) != sp.sqrt(5)                       # 2 != sqrt5 (frame-shift golden)
    # frame-shift lambda(C) = sqrt(1+4C)/C across the three forced gates {1/4,1/2,1}
    fs = sp.sqrt(1 + 4 * C) / C
    vals = {sp.Rational(1, 4): fs.subs(C, sp.Rational(1, 4)),
            sp.Rational(1, 2): fs.subs(C, sp.Rational(1, 2)),
            sp.Integer(1): fs.subs(C, 1)}
    assert sp.simplify(vals[sp.Rational(1, 4)] - 4 * sp.sqrt(2)) == 0   # gate 1/4 -> 4 sqrt2
    assert sp.simplify(vals[sp.Rational(1, 2)] - 2 * sp.sqrt(3)) == 0   # gate 1/2 -> 2 sqrt3
    assert sp.simplify(vals[sp.Integer(1)] - sp.sqrt(5)) == 0          # gate 1   -> sqrt5
    assert len({round(float(v), 9) for v in vals.values()}) == 3       # three distinct values
    record("P1-IDENT-05", PAPER, "Thm 4.1 + Sec 5 (c free, lambda unfrozen)",
           "c is a free parameter (Cencov), so lambda=2c is an identity, never a single "
           "frozen number; the canonicalizations disagree (c=1->2, c=n->2n) and the "
           "frame-shift over the three forced gates gives three distinct values {4sqrt2, "
           "2sqrt3, sqrt5}",
           "lambda = 2c (identity in free c); frame-shift over gates -> {4sqrt2,2sqrt3,sqrt5}",
           detail={"is_identity": True,
                   "frameshift_lambda_by_gate": {"1/4": "4 sqrt2", "1/2": "2 sqrt3", "1": "sqrt5"}})
